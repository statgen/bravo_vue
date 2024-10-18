<template>
<div ref="scroller" style="max-height: 200px; display: block; overflow: hidden scroll;">
  <svg id="SegBars" style="display: block; overflow-x: visible; background-color: lightblue" width="100%" preserveAspectRatio="xMinYMin">
    <g id="SegDrawing">
      <g id="backgroundBoxes" class="tx__background"></g>
      <g id="aggregateSection" class="tx__bars"></g>
      <g id="exonSection" class="tx__bars"></g>
      <g id="cdsSection" class="tx__bars"></g>
      <g id="labelSection" class="tx__label"></g>
    </g>
    <line id="SegHighlightLine" class="tx__hi-line"
      x1="0" y1="0" x2="0" y2="200" visibility=hidden></line>
  </svg>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import { ref } from 'vue';
import * as d3 from "d3"

export default {
  name: "SegBars",
  setup() {
    const scroller = ref(null)
    return { scroller }
  },
  components: {
      FontAwesomeIcon,
  },
  props: {
    /* Collection of segment aggregations. e.g. transcripts for a gene view
    inputData:{
      segments: [
        {id: ENST00000123456, start: 1001, stop: 2002},
        {id: ENST00000123456, start: 1050, stop: 1200},
        {id: ENST00000123456, start: 1075, stop: 1100}],
        {id: ENST00000555555, start: 3003, stop: 4002},
        {id: ENST00000555555, start: 4050, stop: 4200},
        {id: ENST00000555555, start: 4275, stop: 4500}],
      aggregates: [
        {id: ENST00000123456, start: 1001, stop: 1100, label: "🠈 ENST00000123456", type: "protein_coding"},
        {id: ENST00000555555, start: 3003, stop: 4500, label: "🠈 ENST00000555555", type: "nonsense_mediated_decay"}]
      }
    */
    inputData: {
      type: Object,
      default: function(){
        return {"segments": [], "aggregates":[]}
      }
    },
    segmentRegion: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
    highlightGenomePosition: {
      type: Number,
      default: 0
    }
  },
  methods: {
    draw: function(){
      // Relevant containers
      const svg = d3.select("#SegBars")
      const aggSect = svg.select("#aggregateSection")

      // Calc viewbox dimensions
      const row_height = 28
      const row_mid = Math.floor(row_height * 0.7)
      const container_width = this.scroller?.offsetWidth || 1000
      const container_height = this.inputData.aggregates.length * row_height

      // Scale y axis
      let aggIds = []
      let yRange = []
      for( let i = 0; i < this.inputData.aggregates.length; i++){
        aggIds.push(this.inputData.aggregates[i].id)
        yRange.push(i * row_height)
      }

      let y_scale = d3.scaleOrdinal();
      y_scale.domain(aggIds)
                  .range(yRange)

      /* Scale x axis
           Set dimensions and scale x axis data to viewbox
           Translate to align with figures that use a left hand axis.
      */
      const axis_label_width = 40
      const right_margin = 10
      const x_range_limit = container_width - axis_label_width - right_margin
      this.x_scale.domain(this.segmentRegion)
                  .range([0,x_range_limit])

      svg.attr("viewBox", `0 0 ${container_width} ${container_height + 4}`)
         .attr("transform", `translate(${axis_label_width}, 0)`)

      console.log(`segBars container_width ${container_width}`)
      console.log(`segBars x_left_offset ${axis_label_width} + ${right_margin}`)
      // Generate aggregate elements
      aggSect
        .selectAll("line")
        .data(this.inputData.aggregates)
        .join("line")
          .attr("x1", (d,i) => this.x_scale(d.start))
          .attr("x2", (d,i) => this.x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("fake", (d) => console.log(`${d.id} - ${y_scale(d.id)} - ${d.type}`))
          .attr("transform", (d,i) => `translate(0,${y_scale(d.id)})`)
          .attr("stroke-width", 3)
          .classed("tx__bars--coding", (d) => d.is_coding)

      // Generate segment elements

    },
    debouncedDraw: debounce(function(){this.draw()}, 50),
  },
  mounted: function(){
    this.hi_line   = d3.select("#TxHighlightLine")
    // x-axis scale is used outside of draw()
    this.x_scale = d3.scaleLinear();
    this.draw()
    window.addEventListener("resize", this.debouncedDraw);
  },
  beforeUpdate: function(){
    this.draw()
  },
  updated: function(){
    this.draw()
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  },
}
</script>
