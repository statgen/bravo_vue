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
      const upper_limit = Math.ceil(this.max_mean_seq_depth/10)*10
      const step = upper_limit / 4
      return [1,2,3].map(val=>Math.ceil(val*step))
    }
  },
  methods: {
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

      // Use viewbox to avoid caring about external coordinate systems.
      // X is 0 to 1000 Y is 0 to 100
      this.svg = d3.select(this.$el)
        .append("svg")
          .style("display", "block")
          .attr("viewBox", "0 0 1000 100")
          .attr("preserveAspectRatio","xMinYMin")
      this.drawing_clip = this.svg
        .append("clipPath")
          .attr("id", "depth-clip")
        .append("rect")
          .attr("x", "0%")
          .attr("y", "0%");
      this.drawing = this.svg.append("g").attr("id", "depths-container");
      this.depth_g = this.drawing.append("g").attr("id", "depths");
      this.y_axis_g = this.drawing.append("g")
        .style("font-size", "9px");
      this.drawing.append("text")
          .attr("transform", `translate(-30,50) rotate(-90)`)
          .style("font-size", "10px")
          .style("text-anchor", "middle")
          .text("Avg. Depth");
      this.highlight_line = this.drawing.append("line")
          .attr("class", "highlight_line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", "100%")
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke", "#e77f00")
          .attr("visibility", "hidden");
    },
    initializeCoverageSVG: function() {
      this.depths_path = this.depth_g.selectAll("path")
        .data([this.cov_data])
        .enter()
        .append("path")
          .style("fill", "#ffa37c")
          .style("stroke-width", 0.1)
          .style("stroke", "black")
          .attr("id","depths-path");
    },
    draw: function () {
      this.svg.attr("width", "100%").attr("height", "100px");
      // Translate to allow space for y-axis lable
      this.drawing.attr("transform", "translate(40, 0)");
      this.drawing_clip
        .attr("width", "100%")
        .attr("height","100%");

      // Map data to viewbox scale
      // 960 = 1000-40 to account for space allocated for axis label
      this.x_scale.domain(this.segmentRegions)
                  .range([0,960]);
      this.y_scale.domain([0, this.max_mean_seq_depth])
                  .range([100, 0]);

      console.log(this.depth_tick_values)
      this.y_axis
        .scale(this.y_scale)
        .tickValues(this.depth_tick_values)
        .tickFormat(this.format_y_ticks);
      this.y_axis_g.call(this.y_axis);

      var area = d3.area()
        .x(  d  => this.x_scale(d.start) )
        .y0( () => 0)
        .y1( () => 0)
        .y0( () => 100 )
        .y1( d  => this.y_scale(d.mean) )
        .curve(d3.curveStepAfter);

      this.depths_path
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
