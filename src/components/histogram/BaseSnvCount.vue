<template>
<div ref="holderDiv" class="child-component">
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
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color: transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <div>
    <svg id="snvCountFig" width="100%" height=100px style="display: block">
      <g id="drawing" class="hist__bars" transform="translate(40,0)">
        <g id="histogram" transform="translate(0,10)"></g>
        <g id="variantPointers"></g>
      </g>
      <g id="axisGroup" class="hist__axis-label" transform="translate(40,10)"></g>
      <text id="yAxisTitle" transform="translate(10,50) rotate(-90)" 
        class="hist__axis-title">Variants Count</text>
    </svg>
  </div>
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
  name: "SnvCount",
  setup() {
    const holderDiv = ref(null)
    return { holderDiv }
  },
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
    //formerly region.segments.region
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
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
  },
  methods: {
    containerWidth: function(){
      return( this.$refs.holderDiv.getBoundingClientRect().width )
    },
    load: function() {
      this.dataState = "loading"

      var timestamp = Date.now();
      this.timestamp = timestamp;
      axios
        .post(this.url, {
          filters: this.filters,
          introns: this.includeIntrons,
          //windows: width - this.givenMargins.left - this.givenMargins.right
          windows: this.containerWidth()
        })
        .then(response => {
          var payload = response.data;
          if (timestamp == this.timestamp) {
            this.histogram_window_size = payload.data["window-size"];
            this.histogram_data = payload.data.windows;
            this.variants = this.histogram_data.reduce((total, entry) => total + entry.count, 0);
            this.sketch()
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
    setSvgScaling: function(){
      // Use template ref, holder, to access the width of the holding div.
      const x_range_limit = this.containerWidth() - 50;
      this.xx_scale.domain(this.segmentRegions).range([0,x_range_limit])

      // Calc viewbox dimensions setting the aspect ratio at draw time.
      // Match viewbox to containing element width.
      this.svg.attr("viewBox", `0 0 ${this.containerWidth()} 100`)
    },
    sketch: function() {
      // Scale width and viewbox to match container size.
      this.setSvgScaling()

      // Scale y-axis for drawing counts
      const max_count = d3.max(this.histogram_data, function(d) { return d.count; })

      let y_scale = d3.scaleLinear()
      y_scale.domain([max_count,0])
             .range([10,80])

      // Calc the size in pixels of the window_size given in base pairs.
      // ensure bars are at least 2px wide
      const hist_window_width = this.xx_scale(this.segmentRegions[0] + this.histogram_window_size)
      const nice_bar_width = Math.max( Math.round(10 * hist_window_width)/10, 2)

      // Draw y-axis
      const axis_g = this.svg.select("#axisGroup")
      let y_axis = d3.axisLeft()

      y_axis.scale(y_scale)
        .ticks(Math.min(max_count, 4))
        .tickFormat(d3.format(".0s"))
      axis_g.call(y_axis)

      // Clear and re-draw histogram
      const histogram = this.svg.select("#histogram")

      histogram.selectAll("rect").remove()
      histogram.selectAll("rect")
        .data(this.histogram_data)
        .enter()
        .append("rect")
        .attr("x", (d) => this.xx_scale(d.start))
        .attr("y", (d) => y_scale(d.count))
        .attr("width", nice_bar_width)
        .attr("height", d => 80 - y_scale(d.count))
        .attr("debug", d => d.count)
    },
    sketchPointers: function(){
      const pointers = this.svg.select("#variantPointers")
      pointers.selectAll("path").remove()

      if (this.visibleVariants.data != null) {
        pointers.selectAll("path")
          .data(this.visibleVariants.data)
          .enter()
          .append("path")
          .attr("d", d3.symbol().size(40).type(d3.symbolTriangle))
          .attr("transform", d => `translate(${this.xx_scale(d.pos)},100)`)
          .attr("stroke", "black")
          .attr("fill", "green")
          .attr("opacity", 0.3)
      }
    },
    debouncedSketch: debounce(function(){this.sketch()}, 50),
    debouncedPointers: debounce(function(){this.sketchPointers()}, 10),
  },
  beforeCreate: function() {
    // initialize non-reactive data
    this.timestamp = null;
    this.histogram_data = [];
    this.histogram_window_size = 0;
    this.xx_scale = d3.scaleLinear();
  },
  mounted: function() {
    this.svg = d3.select("#snvCountFig")
    this.load();
    window.addEventListener("resize", this.debouncedSketch);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedSketch);
  },
  watch: {
    filters: function() {
      this.load(this.givenWidth)
    },
    visibleVariants: function() {
      this.debouncedPointers()
    },
  },
}
</script>
