<template>
<div class="child-component">
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color:transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <div v-if="loading" class="d-flex align-items-center statusMessage">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="failed" class="statusMessage">Error while loading coverage data</div>
  <div v-if="loaded && (loaded_data_size == 0)" class="statusMessage">No coverage data for this region</div>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as d3 from "d3";
import axios from "axios";
axios.defaults.withCredentials=true

export default {
  name: "SeqDepth",
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
    //formerly dimensions.width
    givenWidth: {
      type: Number,
      default: 300
    },
    //formerly dimensions.margin
    givenMargins: {
      type: Object,
      default: function(){
        return({
          left:   40,
          right:  15,
          top:    12,
          bottom: 5
        })
      }
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
    }
  },
  methods: {
    load_depths: function(chrom, start, stop, continue_from=0){
      return axios
        .post(`${this.api}/chunked-coverage`, 
          {chrom: chrom, start: start, stop: stop, continue_from: continue_from})
        .then( resp => {
          this.cov_data.push(...resp.data.coverage)
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
      this.initializeCoverageSVG()
      this.loaded_data_size = 0
      this.load_depths(this.chrom, this.start, this.stop, 0)
    },
    format_y_ticks: function(value) {
      return d3.format('d')(value) + "x";
    },
    initializeSVG: function () {
      this.x_scale = d3.scaleLinear();
      this.y_axis = d3.axisLeft();
      this.y_scale = d3.scaleLinear();

      this.svg = d3.select(this.$el)
        .append("svg")
          .style("display", "block")
          .attr("width", this.givenWidth)
          .attr("height", this.height + this.givenMargins.top + this.givenMargins.bottom);
      this.drawing_clip = this.svg
        .append("clipPath")
          .attr("id", "depth-clip")
        .append("rect")
          .attr("x", 0)
          .attr("y", 0);
      this.drawing = this.svg.append("g");
      this.depth_g = this.drawing.append("g");
      this.y_axis_g = this.drawing.append("g")
        .style("font-size", "9px");
      this.drawing.append("text")
          .attr("transform", `translate(${-this.givenMargins.left + 11},${this.height/2}) rotate(-90)`)
          .style("font-size", "11px")
          .style("text-anchor", "middle")
          .text("Avg. Depth");
      this.highlight_line = this.drawing.append("line")
          .attr("class", "highlight_line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", this.height)
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke", "#e77f00")
          .attr("visibility", "hidden");
    },
    initializeCoverageSVG: function() {
      this.depth_g.selectAll("path")
        .data([this.cov_data])
        .enter()
        .append("path")
          .style("fill", "#ffa37c")
          .style("stroke-width", 0.1)
          .style("stroke", "black");
    },
    draw: function () {
      this.svg.attr("width", this.givenWidth).attr("height", this.height + this.givenMargins.top + this.givenMargins.bottom);
      this.drawing.attr("transform", `translate(${this.givenMargins.left}, ${this.givenMargins.top})`);
      this.drawing_clip
        .attr("width", this.givenWidth - this.givenMargins.left - this.givenMargins.right)
        .attr("height", this.height);
      this.x_scale.range(this.segmentBounds).domain(this.segmentRegions);
      this.y_scale.range([this.height, 0]).domain([0, d3.max(this.cov_data, function(d) { return d.mean; })]);
      this.y_axis.scale(this.y_scale).ticks(4).tickFormat(this.format_y_ticks);
      this.y_axis_g.call(this.y_axis);
      var area = d3.area()
        .x(  d  => { return d.last ? this.x_scale(d.end): this.x_scale(d.start); } )
        .y0( () => 0)
        .y1( () => 0)
        .y0( () => this.height )
        .y1( d  => this.y_scale(d.mean) )
        .curve(d3.curveStepAfter);
      this.drawing.selectAll("g>path:last-child")
        .attr("clip-path", "url(#depth-clip)")
        .attr("d", area);
    },
  },
  beforeCreate() {
    // initialize non-reactive data
    this.height = 70;
    this.svg = null;
    this.drawing = null;
    this.highlight_line = null;
    this.x_scale = null;
    this.y_axis = null;
    this.y_scale = null;
    this.y_axis_g = null;
    this.cov_data = [];
  },
  mounted: function() {
    this.initializeSVG();
    if ((this.chrom != null) && (this.start != null) && (this.stop != null) &&
      (this.segmentRegions.every(d => d != null)) && (this.segmentBounds.every(d => d != null))) {
      this.load();
    }
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
    givenWidth: function() {
      if ((!this.loading) && (!this.failed) && (this.loaded_data_size > 0)) {
        this.draw()
      }
    },
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
