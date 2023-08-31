<template>
<div class="child-component">
  <div class="bravo-tooltip">
    <div v-html="tooltipHtml"></div>
  </div>
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color: transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <div id="info-popup" class="bravo-info-message">Displaying {{ numTranscripts }} transcript(s)</div>
  <div ref="scroller" style="max-height: 200px; display: block; overflow: hidden scroll;">
    <svg id="TxBarsSvg" style="display: block;" width="100%" preserveAspectRatio="none">
      <g id="TxBarsDrawing">
        <g id="transcriptSect"></g>
        <g id="exonSect"></g>
        <g id="cdsSect"></g>
        <g id="labelSect"></g>
      </g>
      <line id="TxHighlightLine" class="highlight_line" visibility="hidden"
        stroke-width="2" stroke-linecap="round" stroke="#e77f00"
        x1="0" y1="0" x2="0" y2="200"></line>
    </svg>
  </div>
  <!--
  <pre> {{geneData.transcripts[0]}} </pre>
  <pre> {{geneData.cds[0]}} </pre>
  <pre> {{geneData.exons}} </pre>
  -->
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
    return { scroller }
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
    segmentBounds: {
      type: Array,
      default: function(){return [0, 1000]}
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
      tooltipHtml: ""
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
    draw: function(){
      // Calc viewbox dimensions
      const row_height = 30
      const row_mid = Math.floor(row_height/2)
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
      const trxSect = svg.select("#transcriptSect")
      const cdsSect = svg.select("#cdsSect")
      const exnSect = svg.select("#exonSect")
      const lblSect = svg.select("#labelSect")

      // Set dimensions and scale x axis data to viewbox
      // Translate to align with figures that use left hand axis.
      svg.attr("viewBox", `0 0 ${container_width} ${container_height}`)
         .attr("transform", `translate(${axis_label_width}, 0)`)
      
      this.x_scale.domain(this.segmentRegions)
                  .range([0,x_range_limit])
      this.y_scale.domain(this.uniqTranscripts)
                  .range(y_discrete_range)

      // Remove any existing lines
      trxSect.selectAll("line").remove()
      cdsSect.selectAll("line").remove()
      exnSect.selectAll("line").remove()
      lblSect.selectAll("text").remove()

      // Draw transcripts
      trxSect
        .selectAll("line")
        .data(this.geneData.transcripts)
        .enter()
          .append("line")
          .attr("x1", (d,i) => this.x_scale(d.start))
          .attr("x2", (d,i) => this.x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.transcript_id)})`)
          .attr("stroke", "#008000")
          .attr("stroke-width", 3)
          .attr("stroke-opacity", "80%")

      // Draw coding sequences
      cdsSect.selectAll("line")
        .data(this.geneData.cds)
        .enter()
          .append("line")
          .attr("x1", (d,i) => this.x_scale(d.start))
          .attr("x2", (d,i) => this.x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.transcript_id)})`)
          .attr("stroke", "#008000")
          .attr("stroke-width", 10)
          .attr("stroke-opacity", "60%")

      // Draw exons
      exnSect.selectAll("line")
        .data(this.geneData.exons)
        .enter()
          .append("line")
          .attr("x1", (d,i) => this.x_scale(d.start))
          .attr("x2", (d,i) => this.x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.transcript_id)})`)
          .attr("stroke", "#008000")
          .attr("stroke-width", 8)
          .attr("stroke-opacity", "50%")

      // Draw labels
      lblSect.selectAll("text")
        .data(this.geneData.transcripts)
        .enter()
          .append("text")
          .attr("x", (d,i) => this.x_scale((d.start + d.stop) / 2) )
          .attr("y", 8)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", "11px")
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.transcript_id)})`)
          .text(this.txLabel)

    },
    debouncedDraw: debounce(function(){this.draw()}, 50)
  },
  beforeCreate: function() {
    // initialize non reactive data
  },
  mounted: function(){
    this.x_scale = d3.scaleLinear();
    this.y_scale = d3.scaleOrdinal();
    this.draw()
    window.addEventListener("resize", this.debouncedDraw);
  },
  unmounted: function(){
    window.removeEventListener("resize", this.debouncedDraw);
  },
}
</script>
