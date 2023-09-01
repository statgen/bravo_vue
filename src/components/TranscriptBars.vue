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
    <svg id="barsSvg">
      <g id="barsDrawing"></g>
    </svg>
  </div>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import * as d3 from "d3"
import axios from "axios"
axios.defaults.withCredentials=true

export default {
  name: "TranscriptBars",
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
      default: function(){return [0, 1000 ]}
    },
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
    givenWidth: {
      type: Number,
      default: 300
    },
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
    hoveredVarPosition: {
      type: Number,
      default: null
    }
  },
  data: function(){
    return {
      closeIcon: faTimes,
      tooltipHtml: "",
    }
  },
  watch: {
    hoveredVarPosition(newVal, oldVal) {
      if(newVal == null){
        this.highlight_line
          .attr("x1", 0)
          .attr("x2", 0)
          .attr("visibility", "hidden")
      } else {
        this.highlight_line
          .attr("x1", this.x_scale(newVal))
          .attr("x2", this.x_scale(newVal))
          .attr("visibility", "inherit")
      }
    },
  },
  beforeCreate: function() {
    // initialize non reactive data
    this.height = 200;
    this.step = 25; // distance between transcripts on y-axis (measured from the center)
    this.transcript_height = 3;
    this.cds_height = 11;
    this.exon_height = 7;
    this.font_size = 11;
    this.rects_transcripts = null;
    this.text_transcripts = null;
    this.rects_cds = null;
    this.rects_exons = null;
    this.rects_box = null;
  },
  mounted: function() {
    // Convenience for accessing svg elements
    this.svg = d3.select("#barsSvg")
    this.drawing = d3.select("#barsDrawing")
    // Initialize scale
    this.x_scale = d3.scaleLinear();

    this.initializeTranscriptsSVG();
    this.draw();
  },
  computed: {
    numTranscripts() { 
      let n_transcripts = this.geneData?.transcripts?.length
      return (n_transcripts ? n_transcripts : 0)
    }
  },
  methods: {
    handleBarMouseover: function(evt, transcript) {
      let rect = evt.target
      d3.select(evt.target)
        .style("fill", "#eeeeee")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("cursor", "pointer")

      // Calculate position of tooltip
      let x_mid = transcript.x_start + (transcript.x_stop - transcript.x_start) / 2.0 + this.givenMargins.left
      let y_mid = rect.getAttribute("y") - this.$refs.scroller.scrollTop - this.givenMargins.top - 8

      d3.select(".bravo-tooltip")
        .style("display", "block")
        .style("left", x_mid + "px")
        .style("top", y_mid + "px");

      this.tooltipHtml = `<ul><li>${transcript.transcript_id} (${transcript.strand})</li>
        <li style='color: #85144b'>${transcript.transcript_type}</li>
        <li>${this.chrom}:${transcript.start.toLocaleString()}-${transcript.stop.toLocaleString()}</li><ul>`
    },
    handleBarMouseout: function(evt) {
      d3.select(".bravo-tooltip")
        .style("display", "none");
      this.tooltipHtml = "";
      d3.select(evt.target)
        .style("fill", "white")
        .style("stroke", "none")
        .style("stroke-width", 0)
        .style("cursor", "default");
    },
    transcriptTypeColor: function(t){
      return(t.transcript_type === 'protein_coding' ? '#373994': '#999999')
    },
    initializeTranscriptsSVG: function() {
      this.rects_box = this.drawing.append("g").selectAll("rect")
         .data(this.geneData.transcripts)
         .enter()
         .append("rect")
         .attr("height", Math.max(this.cds_height, this.exon_height) + this.font_size + 1)
         .attr("shape-rendering", "geometricPrecision")
         .style("fill", "white")
         .style("stroke", "none")
         .style("stroke-width", 0)
         .style("rx", 3)
         .style("ry", 3)
         .attr("rx", 3) // for firefox & safari
         .attr("ry", 3); // for firefox & safari

      this.rects_transcripts = this.drawing.append("g").selectAll("rect")
        .data(this.geneData.transcripts)
        .enter()
        .append("rect")
        .attr("height", this.transcript_height)
        .attr("shape-rendering", "crispEdges")
        .style("pointer-events", "none")
        .style("fill", this.transcriptTypeColor);

      this.rects_cds = this.drawing.append("g").selectAll("rect")
        .data(this.geneData.cds)
        .enter()
        .append("rect")
        .attr("height", this.cds_height)
        .attr("shape-rendering", "crispEdges")
        .style("pointer-events", "none")
        .style("fill", this.transcriptTypeColor);

      this.rects_exons = this.drawing.append("g").selectAll("rect")
        .data(this.geneData.exons)
        .enter()
        .append("rect")
        .attr("height", this.exon_height)
        .attr("shape-rendering", "crispEdges")
        .style("pointer-events", "none")
        .style("fill", this.transcriptTypeColor);

      this.text_transcripts = this.drawing.selectAll("text")
        .data(this.geneData.transcripts)
        .enter()
        .append("text")
        .style("pointer-events", "none");

      this.highlight_line = this.drawing.append("line")
          .attr("class", "highlight_line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", this.height)
          .attr("stroke-width", 2)
          .attr("stroke-linecap", "round")
          .attr("stroke", "#e77f00")
          .attr("visibility", "hidden");

      this.rects_box.on("mouseover", this.handleBarMouseover)
      this.rects_box.on("mouseout", this.handleBarMouseout)
      this.rects_box.on("click", d => this.$emit("click", d));
    },
    draw: function () {
      this.x_scale.domain(this.segmentRegions).range(this.segmentBounds);

      // Scale data adding x_start and x_stop
      this.geneData.transcripts.forEach((transcript, i) => {
        transcript.x_start = this.x_scale(transcript.start);
        transcript.x_stop = this.x_scale(transcript.stop);
        transcript.y = i + 1;
        // very trivial calculation of text box size given that we use 11px font size (assume 0.7 ratio of height to width) of known font style! if you change font style or size, change this line as well.
        let label_width = (transcript.transcript_id.length + 2) * this.font_size * 0.7;
        let padding = label_width - (transcript.x_stop - transcript.x_start);
        padding = padding < 0 ? 0 : padding / 2.0;
        transcript.box_left = transcript.x_start - padding - 2;
        transcript.box_right = transcript.x_stop + padding + 2;
        this.geneData.exons.forEach( exon => {
          if (exon.transcript_id == transcript.transcript_id) {
            exon.x_start = this.x_scale(exon.start);
            exon.x_stop = this.x_scale(exon.stop);
            exon.y = transcript.y;
          }
        });
        this.geneData.cds.forEach( cds => {
          if (cds.transcript_id == transcript.transcript_id) {
            cds.x_start = this.x_scale(cds.start);
            cds.x_stop = this.x_scale(cds.stop);
            cds.y = transcript.y;
          }
        });
      });

      this.svg
        .attr("width", this.givenWidth)
        .attr("height", 12 + this.geneData.transcripts.length * this.step + (this.cds_height - this.transcript_height) / 2 + 2);

      this.drawing.attr("transform", "translate(40, 12)");
      this.rects_transcripts
        .attr("x", d => d.x_start)
        .attr("width", d => d.x_stop - d.x_start)
        .attr("y", d => d.y * this.step - this.transcript_height);
      this.rects_cds
        .attr("x", d => d.x_start)
        .attr("width", d => d.x_stop - d.x_start)
        .attr("y", d => d.y * this.step - this.transcript_height - (this.cds_height - this.transcript_height) / 2);
      this.rects_exons
        .attr("x", function(d) { return d.x_start; })
        .attr("width", function(d) { return d.x_stop - d.x_start; })
        .attr("y", d => d.y * this.step - this.transcript_height - (this.exon_height - this.transcript_height) / 2);
      this.text_transcripts
        .attr("x", d => d.x_start + (d.x_stop - d.x_start) / 2.0)
        .attr("y", d => d.y * this.step - this.transcript_height - (Math.max(this.cds_height, this.exon_height) - this.transcript_height) / 2 - 1)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "alphabetic")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .html(function(d) {
          if (d.strand == '+') {
            return d.transcript_id + "<tspan style=\"font-style: normal;\"> &rarr;</tspan>"
          } else {
            return "<tspan style=\"font-style: normal;\">&larr; </tspan>" + d.transcript_id;
          }
        });
      this.rects_box
        .attr("x", function(d) { return d.box_left; })
        .attr("width", function(d) { return d.box_right - d.box_left; })
        .attr("y", d => d.y * this.step - this.transcript_height - (Math.max(this.cds_height, this.exon_height) - this.transcript_height) / 2 - this.font_size);
    },
  }
}
</script>

<style scoped>
.bravo-tooltip :deep(div) {
  padding: 3px 3px 0px 3px;
}

.bravo-tooltip :deep(ul)  {
  list-style-type: none;
  margin: 0;
  padding: 0;
  white-space: nowrap;
}

.bravo-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: black transparent transparent transparent;
}
</style>
