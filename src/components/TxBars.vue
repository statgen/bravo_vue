<template>
<div class="child-component">
  <div ref="infoPopup" class="tx-popup">
    <ul class="tx-popup__list">
      <li>{{ popupInfo.title }}</li>
      <li>{{ popupInfo.desc }}</li>
      <li><pre>{{ popupInfo.loc }}</pre></li>
    </ul>
  </div>
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color: transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <div id="info-banner" class="bravo-info-message">Displaying {{ numTranscripts }} transcript(s)</div>
  <div ref="scroller" style="max-height: 100px; display: block; overflow: hidden scroll;">
    <svg id="TxBarsSvg" style="display: block; overflow-x: visible" width="100%" preserveAspectRatio="none">
      <g id="TxBarsDrawing">
        <g id="backgroundBoxes" class="tx__background"></g>
        <g id="transcriptSect" class="tx__bars"></g>
        <g id="exonSect" class="tx__bars"></g>
        <g id="cdsSect" class="tx__bars"></g>
        <g id="labelSect" class="tx__label"></g>
      </g>
      <line id="TxHighlightLine" class="highlight_line" visibility="hidden"
        stroke-width="2" stroke-linecap="round" stroke="#e77f00"
        x1="0" y1="0" x2="0" y2="200"></line>
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
  name: "TranscriptBars",
  setup() {
    const scroller = ref(null)
    const infoPopup = ref(null)
    return { scroller, infoPopup }
  },
  components: {
      FontAwesomeIcon,
  },
  inject: {
    chrom: {default: '11'},
  },
  props: {
    geneData: {
      type: Object,
      default: function(){return {}}
    },
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
    hoveredVarPosition: {
      type: Number,
      default: null
    }
  },
  data: function() {
    return {
      closeIcon: faTimes,
      popupInfo: {
        title: "foo",
        desc: "bar",
        loc: "baz"
      }
    }
  },
  computed: {
    numTranscripts() { 
      let n_transcripts = this.geneData?.transcripts?.length
      return(n_transcripts ? n_transcripts : 0)
    },
    uniqTranscripts() {
      return(this.geneData?.transcripts?.map(t => t.transcript_id))
    }
  },
  methods: {
    txLabel: function(d){
      // Use unicode arrows to indicate strand of transcript
      const pstrand = d.strand == '+'
      return(`${!pstrand ? "\uD83E\uDC08 " : ""}${d.transcript_id}${pstrand ? " \uD83E\uDC0A": ""}`)
    },
    handleTxMouseover: function(evt, transcript) {
      // Set the content of the popup
      this.popupInfo.title = transcript.transcript_id
      this.popupInfo.desc = transcript.transcript_type
      this.popupInfo.loc = `${this.chrom}:${transcript.start.toLocaleString()}-${transcript.stop.toLocaleString()}`

      // Set the position of the popup
      let bRect = evt.target.getBoundingClientRect()
      let x_pos = bRect.x + (bRect.width/2)
      let y_pos = bRect.top - 5

      this.infoPopup.style.display = "block"
      this.infoPopup.style.left = `${x_pos}px`
      this.infoPopup.style.top = `${y_pos}px`

      // Set the visibility of the popup
      evt.target.setAttribute("class", "tx__background--highlight")
    },
    handleTxMouseout: function(evt, transcript) {
      evt.target.setAttribute("class", "tx__background")
      this.infoPopup.style = null

    },
    draw: function(){
      let x_scale = d3.scaleLinear();
      let y_scale = d3.scaleOrdinal();

      // Calc viewbox dimensions
      const row_height = 28
      const row_mid = Math.floor(row_height * 0.7)
      const container_width = this.scroller?.scrollWidth || 1000
      const container_height = this.numTranscripts * row_height
      // Discrete range used in mapping transcript id to a specific y value
      const y_discrete_range = Array.from(Array(this.numTranscripts).keys()).map(v => v * row_height)

      // Alightment values for figures that use left hand axis.
      const axis_label_width = 40
      const right_margin = 10
      const x_range_limit = container_width - axis_label_width - right_margin

      // Relevant containers
      const svg = d3.select("#TxBarsSvg")
      const bkgds   = svg.select("#backgroundBoxes")
      const trxSect = svg.select("#transcriptSect")
      const cdsSect = svg.select("#cdsSect")
      const exnSect = svg.select("#exonSect")
      const lblSect = svg.select("#labelSect")

      // Set dimensions and scale x axis data to viewbox
      // Translate to align with figures that use left hand axis.
      svg.attr("viewBox", `-4 0 ${container_width} ${container_height + 4}`)
         .attr("transform", `translate(${axis_label_width}, 0)`)
      
      x_scale.domain(this.segmentRegions)
                  .range([0,x_range_limit])
      y_scale.domain(this.uniqTranscripts)
                  .range(y_discrete_range)

      // Remove any existing lines
      trxSect.selectAll("line").remove()
      cdsSect.selectAll("line").remove()
      exnSect.selectAll("line").remove()
      lblSect.selectAll("text").remove()

      // Draw transcript row boxes for handling highlight and mouseover
      bkgds
        .selectAll("rect")
        .data(this.geneData.transcripts)
        .enter()
          .append("rect")
          .attr("x", (d,i) => x_scale(d.start) - 2)
          .attr("width", (d,i) => x_scale(d.stop) - x_scale(d.start) + 4)
          .attr("y", 1)
          .attr("height", row_height-1)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("transform", (d,i) => `translate(0,${y_scale(d.transcript_id)})`)
          .on("mouseover", this.handleTxMouseover)
          .on("mouseout", this.handleTxMouseout)

      // Draw transcripts
      trxSect
        .selectAll("line")
        .data(this.geneData.transcripts)
        .enter()
          .append("line")
          .attr("x1", (d,i) => x_scale(d.start))
          .attr("x2", (d,i) => x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${y_scale(d.transcript_id)})`)
          .attr("stroke-width", 3)
          .classed("tx__bars--coding", (d,i) => d.transcript_type == 'protein_coding')

      // Draw coding sequences
      cdsSect.selectAll("line")
        .data(this.geneData.cds)
        .enter()
          .append("line")
          .attr("x1", (d,i) => x_scale(d.start))
          .attr("x2", (d,i) => x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${y_scale(d.transcript_id)})`)
          .attr("stroke-width", 10)
          .classed("tx__bars--coding", (d,i) => d.transcript_type == 'protein_coding')

      // Draw exons
      exnSect.selectAll("line")
        .data(this.geneData.exons)
        .enter()
          .append("line")
          .attr("x1", (d,i) => x_scale(d.start))
          .attr("x2", (d,i) => x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${y_scale(d.transcript_id)})`)
          .attr("stroke-width", 6)
          .classed("tx__bars--coding", (d,i) => d.transcript_type == 'protein_coding')

      // Draw labels
      lblSect.selectAll("text")
        .data(this.geneData.transcripts)
        .enter()
          .append("text")
          .attr("x", (d,i) => x_scale((d.start + d.stop) / 2) )
          .attr("y", 12)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", "11px")
          .attr("transform", (d,i) => `translate(0,${y_scale(d.transcript_id)})`)
          .text(this.txLabel)

    },
    debouncedDraw: debounce(function(){this.draw()}, 50),
  },
  beforeCreate: function() {
    // initialize non reactive data
  },
  mounted: function(){
    this.draw()
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  },
}
</script>
