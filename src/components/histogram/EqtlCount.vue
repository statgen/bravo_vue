<template>
<div class="child-component">
  <div ref="scroller" style="max-height: 80px; display: block;">
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

    <div v-if="this.eqtlData" class="bravo-info-message">
      Displaying {{ this.eqtlData.length.toLocaleString() }} eQTLs
    </div>

    <svg id="eqtlHist" style="display: block;" width="100%" height="65px" preserveAspectRatio="xMinYMin"
      styel="overflow-x: hidden; overflow-y: visible">
      <g id="eqtlDrawing">
        <g id="eqtlMarks"></g>
        <g id="eqtlAggregated"></g>
        <g id="eqtlLabels"></g>
      </g>
      <text id="axis-label" x=0 y=0 dominant-baseline="mathematical" transform="translate(5,60) rotate(-90)"
        style="font-size: 11px; text-anchor: start;">eQTL Count</text>
      <line id="eqtlXAxis" v-bind:x1="this.leftMargin" x2="100%" y1="100%" y2="100%"
        style="stroke: black; stroke-width: 4px; visibility: hidden"/>
      <g id="eqtlYAxis" v-bind:transform="'translate('+ this.leftMargin +',0)'">
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
  name: "EqtlCount",
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
        this.eqtlDataBinned = this.bin_data(response.data, this.start, this.stop)
          .filter((ele) => ele.length > 0)
        this.eqtlDataBinned.forEach((ele, idx, arr)=> { 
          arr[idx].href=`region.html?chrom=${ele[0].chrom}&start=${ele.x0}&stop=${ele.x1}` 
        })
        
        this.draw()
      })
    },
    handleEqtlMouseover: function(evt, aggregate) {
      console.log("eqtl mouseover")
    },
    handleEqtlMouseout: function(evt, transcript) {
      this.infoPopup.style.display = "none"
    },
    calc_pos_thresholds: function(start, stop){
      let nbins = 200
      let x_step = Math.floor( (stop - start) / nbins)
      let bin_ends = Array(nbins-1)
      for(let i = 0; i < nbins -1; i++){
        bin_ends[i] = x_step * (i+1) + start
      }
      return(bin_ends)
    },
    bin_data: function(eqtl_data, start, stop){
      let pos_thresholds = this.calc_pos_thresholds(start, stop)
      let binner = d3.bin()
        .value((d) => d.pos)
        .domain([start, stop])
        .thresholds(pos_thresholds)
      let binned = binner(eqtl_data)
      return binned
    },
    fill_rect_attrs: function(rect, x_scale, y_scale){
        rect
          .attr("x", (d) => x_scale(d.x0))
          .attr("width", (d) => x_scale(d.x1) - x_scale(d.x0))
          .attr("y", (d) => `${100 - y_scale(d.length)}%`)
          .attr("height", (d) => `${y_scale(d.length)}%`)
          .style("stroke", "blue")
          .style("stroke-width", "1px")
          .style("fill", "lightblue")
    },
    draw: function(){
      const svg = d3.select("#eqtlHist")
      const aggs  = svg.select("#eqtlAggregated")
      const marks = svg.select("#eqtlMarks")
      const labs  = svg.select("#eqtlLabels")
      const y_axis_g = svg.select("#eqtlYAxis")

      const row_height = 28
      const row_mid = Math.floor(row_height * 0.7)
      const container_width = this.scroller?.offsetWidth || 1000
      const container_height = 30

      const x_range_begin = this.leftMargin
      const x_range_limit = container_width - this.rightMargin

      const x_scale = d3.scaleLinear()
      x_scale.domain([this.start, this.stop])
             .range([x_range_begin, x_range_limit])

      const y_scale = d3.scaleLinear()
      let max_count = this.eqtlDataBinned.reduce( (prev, curr) => (prev > curr.length) ? prev : curr.length, 1)
      let count_limit = Math.ceil(max_count / 10) * 10
      y_scale.domain([0, count_limit]).range([0, 100])

      const y_axis = d3.axisLeft(d3.scaleLinear([0, count_limit], [65,0]))
        .tickValues([Math.floor(count_limit/10),
                     Math.floor(count_limit/2),
                     Math.floor(9*count_limit/10)])
      y_axis_g.call(y_axis)

      svg.select("#eqtlXAxis")
        .attr("x1", x_scale(this.start))
        .attr("x2", x_scale(this.stop))
        .attr("y1", "100%")
        .attr("y2", "100%")
        .style("visibility", "visible")

      aggs.selectAll("rect")
        .data(this.eqtlDataBinned)
        .join(
          enter => {
            let sel = enter.append("a").attr("href", (d) => d.href)
            sel.append("rect").call(this.fill_rect_attrs, x_scale, y_scale)
            return sel
          },
          update => update,
          exit => exit.remove()
        )
        .join("rect")
          .attr("x", (d) => x_scale(d.x0))
          .attr("width", (d) => x_scale(d.x1) - x_scale(d.x0))
          .attr("y", (d) => `${100 - y_scale(d.length)}%`)
          .attr("height", (d) => `${y_scale(d.length)}%`)
          .style("stroke", "blue")
          .style("stroke-width", "1px")
          .style("fill", "lightblue")
    },
    debouncedDraw: debounce(function(){
      this.draw()
    }, 50),
  },
  mounted: function(){
    this.load_eqtl()
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  },
}
</script>
