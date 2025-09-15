<template>
<div class="child-component">
  <div id="info-banner" class="bravo-info-message">Displaying {{ numStructVars }} structural variant(s)</div>
  <div ref="scroller" style="max-height: 200px; display: block; overflow: hidden scroll;">
    <svg id="SvBarsSvg" style="display: block; overflow-x: visible" width="100%" preserveAspectRatio="xMinYMin">
      <g id="SvBarsDrawing">
        <g id="backgroundBoxes" class="tx__background"></g>
        <g id="variantsSection" class="tx__bars"></g>
        <g id="labelSection" class="tx__label"></g>
      </g>
    </svg>
  </div>
</div>
</template>

<script>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import * as d3 from "d3"
import axios from "axios"
axios.defaults.withCredentials=true

export default {
  name: "StructVarBars",
  setup() {
    const scroller = ref(null)
    return { scroller }
  },
  components: {
      FontAwesomeIcon,
  },
  inject: {
    chrom: {default: '11'},
    start: {default: 200000},
    stop:  {default: 201000}
  },
  props: {
    structVarData: {
      type: Array,
      default: function(){return []}
    },
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
  },
  data: function() {
    return {}
  },
  computed: {
    numStructVars() {
      let n_variants = this.structVarData?.length
      return(n_variants ? n_variants : 0)
    },
  },
  methods: {
    draw: function(){
      let y_scale = d3.scaleOrdinal()
      let x_scale = d3.scaleLinear()

      // Calc viewbox dimensions
      const row_height = 28
      const row_mid = Math.floor(row_height * 0.7)
      const container_width = this.scroller?.scrollWidth || 1000
      const container_height = this.numStructVars * row_height
      // Discrete range used in mapping transcript id to a specific y value
      //const y_discrete_range = Array.from(Array(this.numTranscripts).keys()).map(v => v * row_height)
      const y_indexes = Array.from({length: this.numStructVars}, (_,i) => i)
      const y_discrete_range = Array.from(y_indexes, (_,i) => i * row_height)

      // Alightment values for figures that use left hand axis.
      const axis_label_width = 40
      const right_margin = 10
      const x_range_limit = container_width - axis_label_width - right_margin

      // Relevant containers
      const svg = d3.select("#SvBarsSvg")
      const bkgds   = svg.select("#backgroundBoxes")
      const trxSect = svg.select("#variantsSection")
      const lblSect = svg.select("#labelSection")

      x_scale.domain([this.start, this.stop])
                  .range([0,x_range_limit])

      y_scale.domain(y_indexes)
                  .range(y_discrete_range)

      // Set dimensions and scale x axis data to viewbox
      svg.attr("viewBox", `-4 0 ${container_width} ${container_height + 4}`)

      bkgds
        .selectAll("rect")
        .data(this.structVarData)
        .enter()
          .append("rect")
          .attr("x", (d,i) => x_scale(d.pos) - 2)
          .attr("width", (d,i) => x_scale(d.end) - x_scale(d.pos) + 4)
          .attr("y", 1)
          .attr("height", row_height-1)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("transform", (d,i) => `translate(0,${y_scale(i)})`)

      trxSect
        .selectAll("line")
        .data(this.structVarData)
        .enter()
          .append("line")
          .attr("x1", (d,i) => x_scale(d.pos))
          .attr("x2", (d,i) => x_scale(d.end))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${y_scale(i)})`)
          .attr("stroke-width", 12)
          .attr("class", (d,i) => `sv-bars__variant--${d.sv_type}`)

    },
    debouncedDraw: debounce(function(){this.draw()}, 50),
  },
  mounted: function(){
    this.draw()
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  }
}
</script>
