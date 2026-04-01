<template>
<div class="child-component">
  <div id="info-banner" class="bravo-info-message">Displaying {{ numStructVars }} structural variant(s)</div>

  <div ref="scroller" style="max-height: 200px; overflow-y: scroll;">
    <svg id="SvBarsSvg" style="display: block; overflow-x: visible" width="100%" preserveAspectRatio="xMinYMin">
      <defs>
        <pattern id="pINV" width="24" height="24" patternUnits="userSpaceOnUse">
            <rect x=0 y=0 height=24 width=24 class="sv__inv-box"/>
            <path class="sv__icon" d="M15.646 22.095v-3.601H3v-2.702h12.647V12.19l6.844 4.953zM8.64 12.095V8.494h12.647V5.792H8.64V2.19L1.796 7.143Z"/>
        </pattern>
        <pattern id="pDUP" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect x=0 y=0 height=24 width=24 class="sv__dup-box"/>
          <path class="sv__icon" d="M13.513 10.571h8.37v2.897h-8.37v8.414h-3.026V13.47h-8.37V10.57h8.37V2.118h3.026z"/>
        </pattern>
        <pattern id="pDEL" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect x=0 y=0 height=24 width=24 class="sv__del-box"/>
          <path class="sv__icon" d="M22 10v4H2v-4" style="stroke-width:1.0"/>
        </pattern>
        <filter id="bkgd-mask" x="0" y="0" width="1" height="1">
          <feFlood flood-color="white"/>
          <feComposite in="SourceGraphic"/>
        </filter>
      </defs>
      <clipPath id="sv-area-clip">
        <rect id="sv-clip-rect" x="0%" y="0%" width="100%" height="100%"></rect>
      </clipPath>
      <g id="SvBarsDrawing" clip-path="url(#sv-area-clip)">
        <g id="backgroundBoxes" class="sv__background"></g>
        <g id="variantsSection" class="sv__bars"></g>
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
    api: {default: ''},
    chrom: {default: '11'},
    start: {default: 200000},
    stop:  {default: 201000}
  },
  props: {
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
  },
  emits: ['svIdChange'],
  data: function() {
    return {
      structVarData: [],
      selectedSvRect: null
    }
  },
  computed: {
    numStructVars() {
      let n_variants = this.structVarData?.length
      return(n_variants ? n_variants : 0)
    },
  },
  methods: {
    make_sv_id: function(svInfo){
      return `${svInfo.sv_type}_${svInfo.chrom}:${svInfo.pos}-${svInfo.end}`
    },
    loadData: function(){
      return axios
        .get(`${this.api}/sv/region`,
          {params: {chrom: this.chrom, start: this.start, stop: this.stop}})
        .then( resp => {
          this.structVarData = resp.data
          this.draw()

        }).catch(error => {
          console.log("Error loading structvars:" + error)
          this.loaded = false;
          this.loading = false;
          this.failed = true;
        })
    },
    handleSvClick: function(evt){
      // structvar id is encoded as an attribute of the svg element being clicked.
      this.$emit("svIdChange", evt.target.attributes.sv_id.value)
      if(this.selectedSvRectId !== null){
        d3.select('#'+this.selectedSvRectId)
          .classed("sv__bar--selected", false)
      }
      this.selectedSvRectId = evt.target.id
      d3.select('#'+this.selectedSvRectId)
        .classed("sv__bar--selected", true)
    },
    draw: function(){
      let y_scale = d3.scaleOrdinal()
      let x_scale = d3.scaleLinear()

      // Calc viewbox dimensions
      const row_height = 28
      const row_mid = Math.floor(row_height * 0.7)
      const container_width = this.scroller?.scrollWidth || 1000
      const container_height = this.numStructVars * row_height
      const y_indexes = Array.from({length: this.numStructVars}, (_,i) => i)
      const y_discrete_range = Array.from(y_indexes, (_,i) => i * row_height)

      // Alightment values for figures that use left hand axis.
      const left_margin = 40
      const right_margin = 10
      const x_range_limit = container_width - right_margin

      // Relevant containers
      const svg = d3.select("#SvBarsSvg")
      const bkgds   = svg.select("#backgroundBoxes")
      const svSect = svg.select("#variantsSection")
      const lblSect = svg.select("#labelSection")

      x_scale.domain([this.start, this.stop])
                  .range([left_margin, x_range_limit])

      y_scale.domain(y_indexes)
                  .range(y_discrete_range)

      // Clip display from out of bounds data
      svg.select("#sv-clip-rect")
        .attr("x", x_scale(this.start))
        .attr("width", x_scale(this.stop) - x_scale(this.start))

      // Set dimensions and scale x axis data to viewbox
      svg.attr("viewBox", `0 0 ${container_width} ${container_height}`)

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

      svSect
        .selectAll("rect")
        .data(this.structVarData)
        .enter()
          .append("rect")
          .attr("fill", (d) => `url(#p${d.sv_type})`)
          .attr("id", (d,i) => `sv${d.pos}-${i}`)
          .attr("sv_id", (d,i) => `${d.sv_type}_${d.chrom}:${d.pos}-${d.end}`)
          .attr("x", (d,i) => x_scale(d.pos))
          .attr("width", (d,i) => x_scale(d.end) - x_scale(d.pos) + 4)
          .attr("height", row_height-4)
          .attr("transform", (d,i) => `translate(0,${y_scale(i)})`)
          .on("click", this.handleSvClick)

      // Generate Labels using the gene bounds or region bounds as appropriate.
      lblSect.selectAll("text")
        .data(this.structVarData)
        .join("text")
          .attr("id", (d) => `lab-${d.pos}`)
          .attr("x", (d,i) => x_scale( (Math.max(d.pos, this.start) + Math.min(d.end, this.stop))/2 ))
          .attr("y", row_mid-2)
          .attr("text-anchor", "middle")
          .attr("transform", (d,i) => `translate(0,${y_scale(i)})`)
          .attr("filter", "url(#bkgd-mask)")
          .text((d) => this.make_sv_id(d))
          .classed("sv__text", true)

    },
    debouncedDraw: debounce(function(){this.draw()}, 50),
  },
  mounted: function(){
    this.loadData()
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  }
}
</script>
