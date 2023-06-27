<template>
<div class="child-component">
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color: transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <div v-if="loading" class="d-flex align-items-center statusMessage">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="failed" class="statusMessage">Error while loading variants count</div>
  <div v-if="this.loaded && (this.variants >  0)" class="bravo-info-message">
    Displaying {{ this.variants.toLocaleString() }} variant(s)
  </div>
  <div v-if="this.loaded && (this.variants == 0)" class="bravo-info-message">
    No variants
  </div>
  <svg ref="depthSVG" :width="givenWidth" :height="svgHeight" style="display: block">
    <clipPath id="snv-clip">
      <rect x="0" y="0" :width="svgClipWidth" :height="height"></rect>
    </clipPath>
    <g ref="drawing" :transform="svgDrawingTransform">
      <g ref="histogram" clip-path="url(#snv-clip)"></g>
      <g ref="variantPointers"></g>
      <g ref="yAxisContainer" style="font-size: 9px"></g>
      <text ref="yAxisTitle" :transform="svgYAxisTransform" 
        style="font-size: 11px; text-anchor: middle;">Variants Count</text>
    </g>
  </svg>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as d3 from "d3";
import axios from "axios";
axios.defaults.withCredentials=true

export default {
  name: "SnvCount",
  components: {
    FontAwesomeIcon,
  },
  inject: {
    api: {default: ''}
  },
  emits: ['close'],
  data: function() {
    return {
      dataState: "loading",
      variants: 0,
      closeIcon: faTimes,
    }
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
    //formerly dimensions.width
    givenWidth: {
      type: Number
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
    filters: {
      type: Array,
      default: function(){return []}
    },
    includeIntrons: {
      type: Boolean,
      default: true
    },
    visibleVariants: {
      type: Object
    }
  },
  computed: {
    // Override computed url in extending component.
    url() { return "needs/to/defined/in/extending/component" },
    loading() { return this.dataState === "loading" },
    failed()  { return this.dataState === "failed"  },
    loaded()  { return this.dataState === "loaded"  },
    svgHeight: function() {
      return(this.height + this.givenMargins.top + this.givenMargins.bottom)
    },
    svgClipWidth: function() {
      return(this.givenWidth - this.givenMargins.left - this.givenMargins.right)
    },
    svgDrawingTransform: function() {
      return(`translate(${this.givenMargins.left}, ${this.givenMargins.top})`)
    },
    svgYAxisTransform: function() {
      return(`translate(${-this.givenMargins.left + 11},${(this.height - 10)/2}) rotate(-90)`)
    }

  },
  methods: {
    load: function(width) {
      if(width == null){ return }

      this.clearDrawing();
      this.dataState = "loading"

      var timestamp = Date.now();
      this.timestamp = timestamp;
      axios
        .post(this.url, {
          filters: this.filters,
          introns: this.includeIntrons,
          windows: width - this.givenMargins.left - this.givenMargins.right
        })
        .then(response => {
          var payload = response.data;
          if (timestamp == this.timestamp) {
            this.histogram_window_size = payload.data["window-size"];
            this.histogram_data = payload.data.windows;
            this.variants = this.histogram_data.reduce((total, entry) => total + entry.count, 0);
            this.draw();
            this.drawHistogram();
            this.drawVariants();
          }
          this.dataState = "loaded";
        })
        .catch(error => {
          console.log('Snv depth loading error: ' + error)
          this.dataState = "failed"
        })
        .finally(() => {
          this.dataState = "loaded";
        });
    },
    format_y_ticks: function(value) {
      return d3.format('d')(value) + "x";
    },
    initializeSVG: function () {
      this.drawing            = d3.select(this.$refs.drawing)
      this.histogram_g        = d3.select(this.$refs.histogram)
      this.variant_pointers_g = d3.select(this.$refs.variantPointers)
      this.y_axis_g           = d3.select(this.$refs.yAxisContainer)

      this.x_scale = d3.scaleLinear();
      this.y_axis  = d3.axisLeft();
      this.y_scale = d3.scaleLinear();
    },
    draw: function () {
      //Show y-axis title
      d3.select(this.$refs.yAxisTitle).attr("opacity", 1)

      this.x_scale.range(this.segmentBounds).domain(this.segmentRegions);

      var max_count = d3.max(this.histogram_data, function(d) { return d.count; });
      this.y_scale.range([this.height - 10, 0]).domain([0, max_count]);
      this.y_axis.scale(this.y_scale).ticks(Math.min(max_count, 4)).tickFormat(d3.format(".0s"));
      this.y_axis_g.call(this.y_axis);
    },
    drawHistogram: function() {
      this.histogram_g.selectAll("rect").remove();
      this.histogram_g.selectAll("rect")
        .data(this.histogram_data)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("width", d => this.x_scale(d.start + this.histogram_window_size) - this.x_scale(d.start))
        .attr("height", d => this.height - 10 - this.y_scale(d.count))
        .attr("transform", d => `translate(${this.x_scale(d.start)},${this.y_scale(d.count)})`)
        .attr("stroke-width", 1)
        .attr("stroke", "lightsteelblue")
        .attr("fill", "lightsteelblue");
    },
    drawVariants: function() {
      this.variant_pointers_g.selectAll("path").remove();
      if (this.visibleVariants.data != null) {
        this.variant_pointers_g.selectAll("path")
          .data(this.visibleVariants.data)
          .enter()
          .append("path")
          .attr("d", d3.symbol().size(40).type(d3.symbolTriangle))
          .attr("transform", d => `translate(${this.x_scale(d.pos)},${this.height - 4})`)
          .attr("stroke", "black")
          .attr("fill", "green")
          .attr("opacity", 0.2);
      }
    },
    clearDrawing: function() {
      this.y_axis_g.selectAll("*").remove();
      this.histogram_g.selectAll("rect").remove();
      this.variant_pointers_g.selectAll("path").remove();
      // Hide axis title
      d3.select(this.$refs.yAxisTitle).attr("opacity", 0)
    }
  },
  beforeCreate: function() {
    // initialize non-reactive data
    this.timestamp = null;
    this.histogram_data = [];
    this.histogram_window_size = 0;
    this.height = 70;
    this.color = '#ffa37c';
    this.drawing = null;
    this.histogram_g = null;
    this.variant_pointers_g = null;
    this.x_scale = null;
    this.y_axis = null;
    this.y_scale = null;
    this.y_axis_g = null;
  },
  mounted: function() {
    this.initializeSVG();
    this.load(this.givenWidth);
  },
  watch: {
    filters: function() {
      this.load(this.givenWidth)
    },
    visibleVariants: function() {
      this.drawVariants()
    },
    givenWidth: function(newVal, oldVal) {
      // only load data if resolution will increase (more display pixels)
      if(newVal > oldVal){
        this.load(newVal)
      }
      if(this.loaded && (this.histogram_data.length > 0)) {
        this.draw()
        this.drawHistogram()
        this.drawVariants()
      }
    }
  },
}
</script>
