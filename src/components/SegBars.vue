<template>
<div ref="scroller" style="max-height: 200px; display: block; overflow: hidden scroll;">
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
  <svg id="SegBars" style="display: block; overflow-x: visible;" width="100%" preserveAspectRatio="xMinYMin">
    <clipPath id="dataAreaClip">
      <rect id="clipRect" x="0%" y="0%" width="100%" height="100%"></rect>
    </clipPath>
    <g id="SegDrawing" clip-path="url(#data-area-clip)">
      <g id="backgroundBoxes"></g>
      <g id="aggregateSection"  class="tx__bars"></g>
      <g id="segmentsSection"  class="tx__bars"></g>
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
    const infoPopup = ref(null)
    return { scroller, infoPopup }
  },
  components: {
      FontAwesomeIcon,
  },
  inject: {
    chrom: {default: '0'},
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
        {id: ENSG00000123456, start: 1001, stop: 1100, label: "🠈 ENSG00000123456",
         type: "protein_coding" ref: "gene.html?id=ENSG00000123456", is_coding: true},
        {id: ENSG00000555555, start: 3003, stop: 4500, label: "🠈 ENSG00000555555",
         type: "nonsense_mediated_decay", ref: "gene.html?id=ENSG00000555555", is_coding: false}]
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
  data: function() {
    return {
      popupInfo: {
        title: "GENE(-)",
        identifier: "ENSG0000001234",
        type: "protein_coding",
        loc: "1:1000000-1001000"
      },
      leftMargin: 40,
      rightMargin: 10
    }
  },
  watch: {
    highlightGenomePosition(newVal, oldVal) {
      if(newVal == null){
        this.hi_line
          .attr("visibility", "hidden")
      } else {
        this.hi_line
          .attr("x1", this.x_scale(newVal))
          .attr("x2", this.x_scale(newVal))
          .attr("visibility", "inherit")
      }
    },
  },
  methods: {
    handleSegMouseover: function(evt, aggregate) {
      // Set the content of the popup
      this.popupInfo.title = aggregate.desc
      this.popupInfo.identifier = aggregate.id 
      this.popupInfo.type = aggregate.type
      this.popupInfo.loc = `${this.chrom}:${aggregate.start.toLocaleString()}-${aggregate.stop.toLocaleString()}`

      // Get DOM coordinates of background rectangle and enclosing svg
      let box_rect = evt.target.getBoundingClientRect()
      let svg_rect = evt.target.ownerSVGElement.getBoundingClientRect()

      // Determine if background box is overhanging either side
      let overhang_left = box_rect.x < svg_rect.x
      let overhang_right = box_rect.right > svg_rect.right

      // Position the popup box accounting for which side(s) of the background box are visible. 
      let y_pos = box_rect.top - 5
      let x_pos
      if(overhang_left && overhang_right){
        x_pos = svg_rect.x + (svg_rect.width / 2)
      }
      else if(overhang_left){
        x_pos = (this.leftMargin + box_rect.right + svg_rect.left) / 2
      }
      else if(overhang_right) {
        x_pos = (box_rect.left + svg_rect.right) / 2
      }else {
        x_pos = (box_rect.left + box_rect.right) / 2
      }

      this.infoPopup.style.display = "block"
      this.infoPopup.style.left = `${x_pos}px`
      this.infoPopup.style.top = `${y_pos}px`

    },
    handleSegMouseout: function(evt, transcript) {
      this.infoPopup.style.display = "none"
    },
    calc_bkgd_rect_width: function(id, start, stop){
      // Ensure backround box is large enough to encompass label
      const label_width = d3.select(`#SegBars #labelSection #lab-${id}`).node().getBBox().width
      const gene_width = this.x_scale(stop) - this.x_scale(start)
      return Math.max(label_width, gene_width)
    },
    calc_bkgd_rect_x: function(id, start){
      // Ensure backround box x encompasses label
      const label_x = d3.select(`#SegBars #labelSection #lab-${id}`).node().getBBox().x
      const gene_x = this.x_scale(start)
      return Math.min(label_x, gene_x)
    },
    bkgd_rect_attrs: function(rect){
      const label_sect = d3.select("#SegBars #labelSection")
      rect
        .classed("seg__background", true)
        .attr("id", (d) => `box_${d.id}`)
        .attr("x", (d,i) => this.calc_bkgd_rect_x(d.id, d.start) - 2)
        .attr("width", (d,i) => this.calc_bkgd_rect_width(d.id, d.start, d.stop) + 4)
        .attr("y", 1)
        .attr("height", 30)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("transform", (d,i) => `translate(0,${this.y_scale(d.id)})`)
        .on("mouseover", this.handleSegMouseover)
        .on("mouseout", this.handleSegMouseout)
    },
    draw: function(){
      // Relevant containers
      const svg = d3.select("#SegBars")
      const agg_sect = svg.select("#aggregateSection")
      const seg_sect = svg.select("#segmentsSection")
      const clip_rect = svg.select("#clipRect")
      const label_sect = svg.select("#labelSection")
      const bkgd_sect  = svg.select("#backgroundBoxes")

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

      this.y_scale.domain(aggIds)
                  .range(yRange)

      // data area margins
      const x_range_begin = this.leftMargin
      const x_range_limit = container_width - this.rightMargin

      this.x_scale.domain(this.segmentRegion)
                  .range([x_range_begin, x_range_limit])

      svg.attr("viewBox", `0 0 ${container_width} ${container_height + 4}`)

      // Handle out of bounds data by clipping range to genomic range
      clip_rect.attr("x", x_range_begin).attr("width", x_range_limit)

      // Generate aggregate elements
      agg_sect
        .selectAll("line")
        .data(this.inputData.aggregates)
        .join("line")
          .attr("x1", (d,i) => this.x_scale(d.start))
          .attr("x2", (d,i) => this.x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.id)})`)
          .attr("stroke-width", 3)
          .classed("tx__bars--coding", (d) => d.is_coding)

      // Generate segment elements
      seg_sect
        .selectAll("line")
        .data(this.inputData.segments)
        .join("line")
          .attr("x1", (d,i) => this.x_scale(d.start))
          .attr("x2", (d,i) => this.x_scale(d.stop))
          .attr("y1", row_mid)
          .attr("y2", row_mid)
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.id)})`)
          .attr("stroke-width", 7)
          .classed("tx__bars--coding", (d) => d.is_coding)

      // Generate Labels using the gene bounds or region bounds as appropriate.
      label_sect.selectAll("text")
        .data(this.inputData.aggregates)
        .join("text")
          .attr("id", (d) => `lab-${d.id}`)
          .attr("x", (d,i) => 
            this.x_scale((Math.max(d.start, this.segmentRegion[0]) + Math.min(d.stop, this.segmentRegion[1])) / 2) )
          .attr("y", 12)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", "11px")
          .attr("transform", (d,i) => `translate(0,${this.y_scale(d.id)})`)
          .text((d) => d.title)

      // Generate link and background boxes when reference IS available.
      bkgd_sect.selectChildren("a")
        .data(this.inputData.aggregates.filter(ele => ele.ref))
        .join(
          enter => {
            let sel = enter.append("a").attr("href", (d) => d.ref)
            sel.append("rect").call(this.bkgd_rect_attrs)
            return sel
          },
          update => update,
          exit => exit.remove()
        )

      // Generate only background boxes when reference NOT available.
      bkgd_sect.selectChildren("rect")
        .data(this.inputData.aggregates.filter(ele => !ele.ref))
        .join(
          enter => {
            let sel = enter.append("rect")
            sel.call(this.bkgd_rect_attrs, this.x_scale, this.y_scale)
            return sel
          },
          update => update,
          exit => exit.remove()
        )
    },
    debouncedDraw: debounce(function(){this.draw()}, 50),
  },
  mounted: function(){
    this.hi_line   = d3.select("#SegHighlightLine")
    // x-axis scale is used outside of draw()
    this.x_scale = d3.scaleLinear();
    this.y_scale = d3.scaleOrdinal();
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
