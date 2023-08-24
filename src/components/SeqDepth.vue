<template>
<div id="holder" ref="holder" class="child-component">
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color:transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <svg id="depthSvg" style="display: block;" height="100px" width="100%" preserveAspectRatio="none">
    <clipPath id="depth-clip">
      <rect x="0%" y="0%" width="100%" height="100%"></rect>
    </clipPath>
    <g id="depths-container">
      <g id="depths"></g>
      <g id="y-axis" style="font-size: 9px"></g>
      <text id="axis-title" transform="translate(-30,50) rotate(-90)"
        style="font-size: 10px; text-anchor: middle;">Avg. Depth</text>
      <line id="highlight" class="highlight_line" x1="0" y1="0" x2="0" y2="100%"
        stroke-width="2" stroke-linecap="round" stroke="#e77f00" visibility="hidden"/>
    </g>
  </svg>
  <div v-if="loading" class="d-flex align-items-center statusMessage">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="failed" class="statusMessage">Error while loading coverage data</div>
  <div v-if="loaded && (loaded_data_size == 0)" class="statusMessage">No coverage data for this region</div>
</div>
</template>

<script>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { debounce } from 'lodash'
import * as d3 from "d3";
import axios from "axios";
axios.defaults.withCredentials=true

export default {
  name: "SeqDepth",
  setup() {
    const holder = ref(null)
    return { holder }
  },
  props: {
    //formerly region.segments.plot
    segmentBounds: {
      type: Array,
      default: function(){return [0, 1000 ]}
    },
    //formerly region.segments.region
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
    hoveredVarPosition: {
      type: Number,
      default: null
    }
  },
  inject: {
    api: {default: ''},
    chrom: {default: '11'},
    start: {default: 200000},
    stop:  {default: 201000}
  },
  components: {
    FontAwesomeIcon,
  },
  data: function() {
    return {
      loading: false,
      loaded: false,
      failed: false,
      loaded_data_size: 0,
      closeIcon: faTimes,
      max_mean_seq_depth: 0
    }
  },
  computed: {
    depth_tick_values(){
      const upper_limit = this.roundUpToTens(this.max_mean_seq_depth)
      const step = upper_limit / 4
      return [1,2,3].map(val=>Math.ceil(val*step))
    }
  },
  methods: {
    roundUpToTens: function(val){ return(Math.ceil(val/10)*10) },
    load_depths: function(chrom, start, stop, continue_from=0){
      return axios
        .post(`${this.api}/chunked-coverage`,
          {chrom: chrom, start: start, stop: stop, continue_from: continue_from})
        .then( resp => {
          this.cov_data.push(...resp.data.coverage)
          const meanArr = resp.data.coverage.map(val => val.mean)
          const maxMean = meanArr.reduce((acc, val) => val > acc ? val : acc, this.max_mean_seq_depth)
          this.max_mean_seq_depth = maxMean
          this.draw()
          this.loaded_data_size = this.cov_data.length
          if( resp.data.continue_from < stop){
            return this.load_depths(chrom, start, stop, resp.data.continue_from)
          } else {
            this.loading = false;
            this.loaded = true;
          }
        }).catch(error => {
          console.log("Error loading depth:" + error)
          this.loaded = false;
          this.loading = false;
          this.failed = true;
        })
    },
    load: function() {
      this.failed = false;
      this.loaded = false;
      this.loading = true;
      this.loaded_data_size = 0
      this.load_depths(this.chrom, this.start, this.stop, 0)
    },
    format_y_ticks: function(value) {
      return d3.format('d')(value) + "x";
    },
    scaleSvg: function () {
      // Use template ref, holder, to access the width of the holding div.
      const container_width = this.holder.scrollWidth || 1000

      const depth_upper_limit = this.roundUpToTens(this.max_mean_seq_depth)
      const axis_label_width = 40
      const right_margin = 10
      const x_range_limit = container_width - axis_label_width -right_margin;

      // Map data to viewbox scale
      this.x_scale.domain(this.segmentRegions)
                  .range([0,x_range_limit]);
      this.y_scale.domain([0, depth_upper_limit])
                  .range([100, 0]);

      // Match viewbox to containing element width setting the aspect ratio at draw time.
      this.svg = d3.select("#depthSvg")
          .attr("viewBox", `0 0 ${container_width} 100`)

      // Move drawing over for y-axis labels
      this.svg.select("#depths-container")
        .attr("transform", `translate(${axis_label_width}, 0)`);

      this.depth_g = this.svg.select("#depths")
    },
    draw: function () {
      this.scaleSvg();
      /***************
          Plotting
       ***************/
      var area = d3.area()
        .x(  d  => this.x_scale(d.start) )
        .y0( () => 0)
        .y1( () => 0)
        .y0( () => 100 )
        .y1( d  => this.y_scale(d.mean) )
        .curve(d3.curveStepAfter);

      // Remove any existing path
      this.svg.select("#depths-path").remove()

      let depths_path = this.svg.select("#depths").selectAll()
         .data([this.cov_data])
         .enter()
        .append("path")
          .style("fill", "#ffa37c")
          .style("stroke-width", 0.1)
          .style("stroke", "black")
          .attr("id","depths-path")
          .attr("clip-path", "url(#depth-clip)")
          .attr("d", area);

      let yax = d3.axisLeft(this.y_scale)
        .tickValues(this.depth_tick_values)
        .tickFormat(this.format_y_ticks);
      this.svg.select("#y-axis").call(yax)
    },
    debouncedDraw: debounce(function(){this.draw()}, 50)
  },
  beforeCreate() {
    this.svg = null;
    this.x_scale = d3.scaleLinear();
    this.y_scale = d3.scaleLinear();
    this.cov_data = [];
  },
  mounted: function() {
    this.highlight_line = d3.select("#highlight")
    if ((this.chrom != null) && (this.start != null) && (this.stop != null) &&
      (this.segmentRegions.every(d => d != null)) && (this.segmentBounds.every(d => d != null))) {
      this.load();
    }
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  },
  load: function() {
    this.failed = false;
    this.loaded = false;
    this.loading = true;
    this.loaded_data_size = 0;
    this.load_cycle(`${this.api}/coverage/${this.region.regionChrom}-${this.region.regionStart}-${this.region.regionStop}`,
      10000, null, new Promise( resolve => resolve()));
  },
  watch: {
    hoveredVarPosition(newVal, oldVal) {
      if(newVal == null){
        this.highlight_line
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("visibility", "hidden")
      } else {
        this.highlight_line
          .attr("x1", this.x_scale(newVal))
          .attr("x2", this.x_scale(newVal))
          .attr("visibility", "inherit")
      }
    },
  }
}
</script>
