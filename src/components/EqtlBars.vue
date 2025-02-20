<template>
<div class="child-component">
  <div ref="scroller" style="max-height: 80px; display: block; overflow: hidden;">
    <div ref="infoPopup" class="seg__popup">
      <ul class="seg__popup-list">
        <li>{{ popupInfo.title }}</li>
        <li>{{ popupInfo.identifier }}</li>
        <li>{{ popupInfo.type }}</li>
        <li>
          <pre class="seg__popup-loc">{{ popupInfo.loc }}</pre>
        </li>
      </ul>
    </div>

    <svg id="EqtlBars" style="display: block;" width="100%" height="40px" preserveAspectRatio="xMinYMin">
      <g id="EqtlDrawing">
        <rect x="0%" y="0%" height="100%" width="100%" style="fill:#beebee"></rect>
        <g id="eqtlMarks"></g>
        <g id="eqtlAggregated"></g>
        <g id="eqtlLabels"></g>
      </g>
      <g id="EqtlAxis">
        <text id="axis-title" x="0%" y="50%" dominant-baseline="mathematical"
          style="font-size: 10px; text-anchor: start;">eQTLs:</text>
      </g>
    </svg>
  </div>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { debounce } from 'lodash'
import { ref } from 'vue';
import * as d3 from "d3"
import axios from "axios";

export default {
  name: "EqtlBars",
  setup() {
    const scroller = ref(null)
    const infoPopup = ref(null)
    return { scroller, infoPopup }
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
  data: function() {
    return {
      /*
      {"af": 0.24289773,
       "alt": "T",
       "chrom": "11",
       "cs_id": 1,
       "phenotype_id": "ENSG00000196565",
       "pip": 0.014421277,
       "pos": 5268823,
       "ref": "C",
       "tissue": "Monocyte",
       "variant_id": "11-5268823-C-T"}
      */
      eqtlData: [],
      eqtlDataBinned: [],
      popupInfo: {
        title: "11-5268823-C-T",
        identifier: "11-5268823-C-T",
        type: "Monocyte",
        loc: "11:5268823"
      },
      leftMargin: 40,
      rightMargin: 10
    }
  },
  methods: {
    load_eqtl: function() {
      axios({
        method: 'get',
        url: `${this.api}/eqtl/region`,
        params: {chrom: this.chrom, start: this.start, stop: this.stop}
      }).then( response => { 
        this.eqtlData = response.data 
        this.draw()
      })
    },
    handleEqtlMouseover: function(evt, aggregate) {
      console.log("eqtl mouseover")
    },
    handleEqtlMouseout: function(evt, transcript) {
      this.infoPopup.style.display = "none"
    },
    calc_pos_thresholds: function(){
      let nbins = 50
      let x_step = Math.floor( (this.stop - this.start) / nbins)
      let result = Array(nbins-1)
        .keys()
        .map((b) => this.start + (b+1) * x_step)
        .toArray()
      return(result)

    },
    bin_data: function(){
      let pos_thresholds = this.calc_pos_thresholds()
      let binner = d3.bin()
        .value((d) => d.pos)
        .domain([this.start, this.stop])
        .thresholds(pos_thresholds)
      let binned = binner(this.eqtlData)
      return binned
    },
    draw: function(){
      // Relevant containers
      const svg = d3.select("#EqtlBars")
      const clip_rect = svg.select("#EqtlClipRect")
      const aggs  = svg.select("#eqtlAggregated")
      const marks = svg.select("#eqtlMarks")
      const labs  = svg.select("#eqtlLabels")

      // Calc viewbox dimensions
      const row_height = 28
      const row_mid = Math.floor(row_height * 0.7)
      const container_width = this.scroller?.offsetWidth || 1000
      const container_height = 30

      // data area margins
      const x_range_begin = this.leftMargin
      const x_range_limit = container_width - this.rightMargin

      const x_scale = d3.scaleLinear();
      x_scale.domain([this.start, this.stop])
                  .range([x_range_begin, x_range_limit])

      // Handle out of bounds data by clipping range to genomic range
      clip_rect.attr("x", x_range_begin).attr("width", x_range_limit)

        /*
      marks.selectAll("rect")
        .data(this.eqtlData)
        .join("rect")
        .attr("x", (d) => x_scale(d.pos))
        .attr("y", 0)
        .attr("height", "100%")
        .attr("width", "1px")
        .style("stroke", "blue")
        .style("fill", "green")
         */

      svg.append("line")
        .attr("x1", x_scale(this.start)).attr("y1", "0%")
        .attr("x2", x_scale(this.start)).attr("y2", "100%")
        .style("stroke-width", "3px")
        .style("stroke", "red")

      /*let bins = [...Array(100).keys()]
      let bins = [0,10,20,30,40,50,60,70,80,90]
      marks.selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", (d) => `${d}%`)
        .attr("y", 0)
        .attr("height", "100%")
        .attr("width", "1%")
        .style("stroke", "green")
        .style("fill", "none")
        */

      let binned_data = this.bin_data().filter((ele) => ele.length > 0)
      console.log(binned_data)

      aggs.selectAll("rect")
        .data(binned_data)
        .join("rect")
          .attr("x", (d) => x_scale(d.x0))
          .attr("y", "20%")
          .attr("ry", "10%")
          .attr("width", (d) => x_scale(d.x1) - x_scale(d.x0))
          .attr("height", "60%")
          .style("stroke", "red")
          .style("fill", "none")

      labs.selectAll("text")
        .data(binned_data)
        .join("text")
          .attr("x", (d) => Math.floor((x_scale(d.x0) + x_scale(d.x1))/2))
          .attr("y", "48%")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "mathematical")
          .text((d) => d.length)
          .style("font-size", "10px")
      

    },
    debouncedDraw: debounce(function(){
      this.draw()
      console.log("debounced eqtl draw")
    }, 50),
  },
  mounted: function(){
    this.load_eqtl()
    window.addEventListener("resize", this.debouncedDraw);
  },
  beforeUpdate: function(){
    // TODO: only update highlight line
    //console.log("eqtl updated")
    //this.draw()
  },
  updated: function(){
    //console.log("updated")
    //this.draw()
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  },
}
</script>
