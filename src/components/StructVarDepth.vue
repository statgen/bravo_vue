<template>
  <div id="svholder" ref="svholder" class="child-component">
    <svg id="structVarReads" style="display: block;" height="500px" width="100%" preserveAspectRatio="none">
      <defs>
        <linearGradient id="agg-gradient">
          <stop offset="0%" stop-color="green" />
          <stop offset="100%" stop-color="white" />
        </linearGradient>
      </defs>
      <clipPath id="depth-clip">
        <rect x="0%" y="0%" width="100%" height="100%"></rect>
      </clipPath>
      <g id="background">
        <rect height="100%" width="100%" opacity=0.1 fill="#AAAABB"></rect>
      </g>
      <g id="depths"></g>
      <g id="sv-bounds">
        <line id="sv-start" y0="0%" y1="100%" stroke="black" stroke-dasharray="2 1"/>
        <line id="sv-end"   y0="0%" y1="100%" stroke="black" stroke-dasharray="2 1"/>
      </g>
      <g id="alignments" style="visibility: hidden">
        <g id="split-reads"  class="sv__splits"></g>
        <g id="paired-reads" class="sv__pairs"></g>
      </g>
      <g id="aggregates"></g>
    </svg>
  </div>
  <button @click="toggle_visibility(svg.select('#alignments'))">Show/Hide Alignments</button>
  <button @click="toggle_visibility(svg.select('#aggregates'))">Show/Hide Aggregates</button>
  <div id="dbg-info">
  </div>
</template>


<script setup>
import {inject, onMounted, onBeforeUpdate, ref, watch} from 'vue'
import * as d3 from "d3"
import axios from "axios"
axios.defaults.withCredentials=true

/* Injects */
const api = inject('api')
const region_start = inject('start')
const region_end   = inject('stop')

/* Props */
const props = defineProps({svId: String})

/* Placeholder Variables for data that will be provided or calculated */
const genome_position_limits = [50186300, 50186900]
const max_insert_size = 300
const max_depth = 50
let sv_start = 50186563
let sv_end = 50186750

/* Plotting Data */
let aligns_data = {} 
let plot_data = []

let cov_data_bravo = {}
let cov_data_sv = {}
// let cov_ext_data from '../assets/cov_ext_data.json'
// let cov_ext_bravo from '../assets/cov_ext_bravo.json'

/* Alignment Binning
  Requires genome_position_limits and max_insert_size.
  Each bin is
    {start: int, end: int, pair_idxs: [], splits_idxs: []}
  Distance bin is the y-axis binning.
  Position bin is the x-axis binning.
*/
let n_position_bins = 35
let n_distance_bins = 10
let position_binwidth = 1
let distance_binwidth = 1
let max_dist = 1
let bin_grid = []

/* SVG Vars */
let svg           = null
let drawing_clip  = null
let drawing       = null
let splits        = null
let pairs         = null
let aggregates    = null
let x_scale       = d3.scaleLinear()
let y_scale       = d3.scaleLinear()
let y_depth_scale = d3.scaleLinear()

/* Color scheme for reads
  https://colorbrewer2.org/?type=diverging&scheme=PRGn&n=3
  .PRGn .q0-3{fill:rgb(175,141,195)} 
  .PRGn .q1-3{fill:rgb(247,247,247)} 
  .PRGn .q2-3{fill:rgb(127,191,123)}
  https://colorbrewer2.org/?type=sequential&scheme=Blues&n=6
  .Blues .q0-6{fill:rgb(239,243,255)} 
  .Blues .q1-6{fill:rgb(198,219,239)}
  .Blues .q2-6{fill:rgb(158,202,225)} 
  .Blues .q3-6{fill:rgb(107,174,214)}
  .Blues .q4-6{fill:rgb(49,130,189)} 
  .Blues .q5-6{fill:rgb(8,81,156)}
 */
const split_palette = ['#08519c', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff']
const pair_palette = ['#af8dc3','#7fbf7b']

/* Formatting dimension vars */
const axis_label_width = 40
const right_margin = 10
let container_width = null
let x_range_limit = null

/************
* Functions *
************/

// Generator for converting array of coverage objects into d attribute of a path.
let cov_area = d3.area()
  .x(  d  => x_scale(d.start) )
  .y0( () => 0)
  .y1( () => 0)
  .y0( () => 100 )
  .y1( d  => y_depth_scale(d.mean) )
  .curve(d3.curveStepAfter)

// Initialize SVG structure and named elements
function init_svg() {
  // Use template ref, holder, to access the width of the holding div.
  container_width = holder.scrollWidth || 1000
  x_range_limit = container_width - axis_label_width -right_margin;

  svg = d3.select("#structVarReads")
    .attr("viewBox", `0 0 ${container_width} 100`)
    .style("display", "block")

  splits = svg.selectAll("#split-reads").selectAll()
  pairs = svg.select("#paired-reads").selectAll()
  aggregates = svg.select("#aggregates").selectAll()
}

function init_plot_scales(start, end){
  x_scale.domain([start, end])
    .range([0, x_range_limit])

  y_scale.domain([0, 1.1*max_dist])
    .range([100, 0])

  y_depth_scale.domain([0, max_depth])
    .range([100, 0])
}

function plot_sv_bounds(){
  let start_line = svg.select("#sv-start")
  let end_line = svg.select("#sv-end")

  start_line
    .attr("x1",x_scale(sv_start))
    .attr("x2",x_scale(sv_start))
  end_line
    .attr("x1",x_scale(sv_end))
    .attr("x2",x_scale(sv_end))
}


// run when data arrives to populate svg
function update_plot_data(){
  plot_data = update_alignments(aligns_data)

  sv_start = aligns_data.pos
  sv_end = aligns_data.end

  max_dist = compute_max_distance(plot_data)

  // initialize array of bins for aggregating alignments
  position_binwidth = calc_position_bin_width()
  distance_binwidth = calc_distance_bin_width()


  generate_data_bins()
  
  // process and rearrange data for plotting
  update_bins(plot_data)
}

function update_plot(){
  plot_sv_bounds()
  //plot_alignments(pairs, plot_data.all_pairs, pair_palette)
  //plot_alignments(splits, plot_data.all_splits, split_palette)

  //debug
  //update_background_coverage()
  //update_carrier_coverage()
  //plot_bins_v2(aggregates, bin_grid)
}

function update_carrier_coverage() {
  svg.select("#depths-path").remove()

  let depths_path = svg.select("#depths").selectall()
     .data([cov_ext_data])
     .enter()
    .append("path")
      .style("fill", "#ffa37c")
      .style("opacity", "50%")
      .style("stroke-width", 0.1)
      .style("stroke", "black")
      .attr("id","depths-path")
      .attr("clip-path", "url(#depth-clip)")
      .attr("d", cov_area);
}

function update_background_coverage() {
  svg.select("#bkg-depths-path").remove()

  let depths_path = svg.select("#depths").selectall()
     .data([cov_ext_bravo])
     .enter()
    .append("path")
      .style("fill", "#7ca3ff")
      .style("opacity", "50%")
      .style("stroke-width", 0.1)
      .style("stroke", "black")
      .attr("id","bkg-depths-path")
      .attr("clip-path", "url(#depth-clip)")
      .attr("d", cov_area);
}

/* functions for 10 distance (y-axis) bins and 35 position (x-axis) bins */
function calc_distance_bin_width() {
  return Math.ceil(max_dist / n_distance_bins)
}

function calc_position_bin_width() {
  return Math.floor((region_end - region_start) / n_position_bins)
}

/* given alignment distance attribute, figure out which bin it goes in */
function calc_distance_bin_index(dist){
  return Math.floor(dist / distance_binwidth)
}

/* given genomice position, determine which position bin aligntent goes in */
function calc_position_bin_index(pos){
  return Math.floor((pos - region_start) / position_binwidth)
}

/* initialize array of bins for aggregating alignments to reduce overplotting.
conceptually, this is a 2d array of bins that are instead layed out in a single array.
each row is laid out end to end.
i.e. the last element of the 1st row is followed by first element of the 2nd row.

each bin tracks indexes of the alignments it aggregates for each category of alingment.
{ pos_start: int, dist_start: int, pair_idxs: [], split_idxs: [] }

position is mapped to the x-axis
distance is mapped to the y-axis

requires position_binwidth and distance_binwidth to already be computed.
*/
function generate_data_bins() {
  bin_grid = Array(n_position_bins * n_distance_bins)

  let bin_idx = 0
  for(let d_idx = 0; d_idx < n_distance_bins; d_idx++){
    for(let p_idx = 0; p_idx < n_position_bins; p_idx++){
      bin_idx = p_idx + (d_idx * n_position_bins)

      bin_grid[bin_idx] = {
        pos_idx: p_idx,
        dist_idx: d_idx,
        bin_idx: bin_idx,
        pos_start:  region_start + p_idx * position_binwidth,
        dist_start: d_idx * distance_binwidth,
        dist_end: (d_idx +1) * distance_binwidth,
        pair_idxs: [],
        split_idxs: [],
        n_alignments: 0
      }
    }
  }
}

/* preocess paired reads and split pairs alignment sets
   calc distance and index attribute to each alignment
   return shallow flattened copy of data
*/
function update_alignments(aln_data){
  aln_data.all_pairs.forEach((ele) => update_pair_dist(ele))
  aln_data.all_splits.forEach((ele) => update_split_dist(ele))

  return (
    {all_pairs: aln_data.all_pairs.flat(),
     all_splits: aln_data.all_splits.flat()}
  )
}

/* Find the maximum distance between pairs or splits.
  Use for scaling the y-axis and binning alignments */
function compute_max_distance(pdata){
  let local_maxs = [d3.max(pdata.all_pairs, (ele) => ele.dist),
                    d3.max(pdata.all_splits, (ele) => ele.dist)]
  return(d3.max(local_maxs))
}


/* Calc distance of a pair of alignments.
  Distance between lowest starts and and max stop position of alignments.
  Append as attribute of each alignment. */
function update_pair_dist(align_set){
  let max_end = d3.max(align_set, (d) => d.end)
  let min_start = d3.min(align_set, (d) => d.s)
  let dist = max_end - min_start
  align_set.forEach((ele,idx) => {ele.dist = dist; ele.idx = idx})
}

/* Calc distance of split reads.  Biggest size of the alignments. */
function update_split_dist(align_set){
  let biggest = d3.max(align_set, (d) => d.end - d.s)

  align_set.forEach((ele, idx) => {ele.dist = biggest; ele.idx = idx})
}


/* Which bin index does a particular position and distance go into.
  Distance index shifts up a row.  Position index shifts right.*/
function calculate_bin_index(pos, dist){

  let pos_idx = calc_position_bin_index(pos)
  let dist_idx = calc_distance_bin_index(dist)

  // Handle start location being less than genome position limits
  if(pos_idx < 0){ pos_idx = 0 }

  return(pos_idx + (dist_idx * n_position_bins))
}


/* Alignment is in bounds when the start OR end are between genome_position_limits */
function is_alignment_in_bounds(aln){
  return( (aln.start >= region_start && aln.start <  region_end) ||
          (aln.end >= region_start && aln.end <  region_end))
}

/* Given plotting data, object with two flat array of alignments (all_pairs, all_splits),
  update associated plot bin.
  Do not include alignments that get binned outside of the genome position range.
  */
function update_bins(pdata) {
  let n_bins = n_position_bins * n_distance_bins

  let bin_idx = -1
  pdata.all_pairs.forEach((ele, idx) => {
    if(is_alignment_in_bounds(ele)){
      bin_idx = calculate_bin_index(ele.s, ele.dist)
      bin_grid[bin_idx].pair_idxs.push(idx)
      bin_grid[bin_idx].n_alignments++
    }
  })

  pdata.all_splits.forEach((ele, idx) => {
    if(is_alignment_in_bounds(ele)){
      bin_idx = calculate_bin_index(ele.s, ele.dist)
      bin_grid[bin_idx].split_idxs.push(idx)
      bin_grid[bin_idx].n_alignments++
    }
  })
}


/*
  sel: d3 selection under which to append pairs
  alignments: array of alignment paired reads or split reads
  palette: array of hex codes
*/
function plot_alignments(sel, alignments, palette){
  sel.data(alignments).enter()
    .append("rect")
    .attr("x", d => x_scale(d.start))
    .attr("y", d => y_scale(d.dist))
    .attr("height", "1%")
    .attr("width", d => d.end - d.start)
    .attr("shape-rendering", "crispEdges")
    .style("fill", d => palette[d.idx])
    .style("opacity", 0.1)
}

/* Generate svg rect y value bin in terms of total height that accomodates the
  inverted nature of the SVG scale and the height of the bin (d_increment)
  E.g. if distance index is 0, and increment is 10,
       then upper left corner (y) should be at "90%"
  */
function index_to_axis_percent(idx, increment){
  return `${100 - increment * (idx + 1)}%`
}

/* Calculate the aggregate bin position with offset to avoid overplotting */
function bin_jitter(bin){
  let offset_seq = [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]
  let offset_idx = bin.pos_idx % (offset_seq.length -1)
  let offset = Math.floor( distance_binwidth * offset_seq[offset_idx] )

  return(bin.dist_start + offset)
}

function plot_bins_v2(sel, bins){
  let max_bin_alns = d3.max(bin_grid, d => d.n_alignments)
  let opacity_scale = d3.scaleSqrt().domain([0, max_bin_alns]).range([0, 1]).clamp(true)

  let draw_width = x_scale(region_start + distance_binwidth)

  sel.data(bins).enter()
    .append("rect")
    .attr("opacity", d => opacity_scale(d.n_alignments))
  //.attr("fill", "url(#agg-gradient)")
    .attr("fill", "red")
    .attr("x", d => x_scale(d.pos_start))
    .attr("width", draw_width)
    .attr("y", d => y_scale(bin_jitter(d)))
    .attr("height", "0.75%")
}

function toggle_visibility(sel){
  if( sel.style("visibility") == "visible") {
    sel.style("visibility", "hidden")
  } else {
    sel.style("visibility", "visible")
  }
}

function get_alignments() {
  axios
    .get(`${api}/sv/alignments`, {params:{svid: props.svId}}) 
    .then( resp => {
      aligns_data = resp.data
      if(aligns_data) {
        update_plot_data()
        update_plot()
      } else {
        console.log(`No alignment data for sv: ${props.svId}`)
      }

    }).catch(error => {
      console.log("Error loading alignments:" + error)
    })
}

watch( () => props.svId, get_alignments, {immediate: false})


onMounted(() => {
  init_svg()
  init_plot_scales(region_start, region_end)
})

/*
onBeforeUpdate(() => {
  updatePlot()
})

onMounted(() => {

  // Add distance attribute for each alignment
  plot_data = update_alignments(plot_ext_data)
  max_dist = compute_max_distance(plot_data)

  // initialize array of bins for aggregating alignments
  position_binwidth = calc_position_bin_width()
  distance_binwidth = calc_distance_bin_width()
  generate_data_bins()

  // process and rearrange data for plotting
  update_bins(plot_data)
  initSvg()
  initPlotScales()
  updatePlot()
})
*/

</script>
