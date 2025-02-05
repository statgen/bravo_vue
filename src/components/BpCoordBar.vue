<template>
  <div id="holder" ref="holder" class="child-component"
    style="max-height: 20px; display: block; overflow-y: hidden; overflow-x: hidden;">
    <svg id="bp-coord-bar" style="display: block;" height="100px" width="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
      <g id="x-axis-container"></g>
    </svg>
</div>
</template>

<script>
import { ref } from 'vue'
import { debounce } from 'lodash'
import * as d3 from "d3"

export default {
  name: "BpCoordBar",
  setup() {
    const holder = ref(null)
    return { holder }
  },
  props: {
    //formerly region.segments.region
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
    tickQuantity: {
      type: Number,
      default: function(){return 10}
    },
  },
  methods: {
    format_position_ticks: function(value) {
      return d3.format('~s')(value) + "bp";
    },
    position_ticks: function() {
      const tickDilineations = [...Array(this.tickQuantity).keys()];
      let ticks = [];
      for(const td of tickDilineations){
        ticks.push(Math.floor(this.x_scale(td)))
      }
      return ticks
    },
    tickPositions(min, max, qty=10){
      const step_size = Math.floor((max-min)/qty)
      return [...Array(qty).keys()].map(val => min+(val*step_size))
    },
    init: function () {
      this.x_axis_g = d3.select("#x-axis-container")

      this.x_axis = d3.axisBottom();
      this.x_scale = d3.scaleLinear();
    },
    draw: function () {
      const container_width = this.holder.scrollWidth || 1000
      const axis_label_width = 40
      const right_margin = 10
      const x_range_limit = container_width - axis_label_width -right_margin;

      let svg = d3.select("#bp-coord-bar")
        .attr("viewBox",`0 0 ${container_width} 100`)
      this.x_axis_g.attr("transform", "translate(40, 0)");
      this.x_scale.domain(this.segmentRegions)
                  .range([0,x_range_limit]);

      this.x_axis
        .scale(this.x_scale)
        .ticks(5)
        .tickFormat(this.format_position_ticks);
      this.x_axis_g.call(this.x_axis);
    },
    debouncedDraw: debounce(function(){this.draw()}, 50)
  },
  beforeCreate() {
    // initialize non reactive data
    this.x_axis = null;
    this.x_axis_g = null;
    this.x_scale = null;
  },
  mounted: function() {
    this.init();
    if ((this.segmentRegions.every(d => d != null))) {
      this.draw();
    }
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  }
}
</script>

<style scoped>
.child-component {
  position: relative;
  min-height: 20px;
  margin-top: 5px;
}
</style>

