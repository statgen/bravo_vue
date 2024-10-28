<template>
<div ref="scroller" style="max-height: 200px; display: block; overflow: hidden scroll;">
  <svg id="SegBars" style="display: block; overflow-x: visible; background-color: lightblue" width="100%" preserveAspectRatio="xMinYMin">
    <clipPath id="dataAreaClip">
      <rect id="clipRect" x="0%" y="0%" width="100%" height="100%"></rect>
    </clipPath>
    <g id="SegDrawing" clip-path="url(#data-area-clip)">
      <g id="backgroundBoxes" class="tx__background"></g>
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
import { debounce, partialRight } from 'lodash'
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
        {id: ENSG00000123456, start: 1001, stop: 1100, label: "🠈 ENSG00000123456",
         type: "protein_coding" ref: "gene.html?id=ENSG00000123456"},
        {id: ENSG00000555555, start: 3003, stop: 4500, label: "🠈 ENSG00000555555",
         type: "nonsense_mediated_decay", ref: "gene.html?id=ENSG00000555555"}]
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
      this.popupInfo.title = "title"
      this.popupInfo.desc = "type"
      this.popupInfo.loc = `${this.chrom}:${aggregate.start.toLocaleString()}-${aggregate.stop.toLocaleString()}`

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

      let y_scale = d3.scaleOrdinal();
      y_scale.domain(aggIds)
                  .range(yRange)

      // data area margins
      const left_margin = 40
      const right_margin = 10
      const x_range_begin = left_margin
      const x_range_limit = container_width - right_margin

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
          .attr("transform", (d,i) => `translate(0,${y_scale(d.id)})`)
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
          .attr("transform", (d,i) => `translate(0,${y_scale(d.id)})`)
          .attr("stroke-width", 7)
          .classed("tx__bars--coding", (d) => d.is_coding)

      // Generate Labels
      label_sect.selectAll("text")
        .data(this.inputData.aggregates)
        .join("text")
          .attr("x", (d,i) => this.x_scale((d.start + d.stop) / 2) )
          .attr("y", 12)
          .attr("text-anchor", "middle")
          .style("font-family", "sans-serif")
          .style("font-size", "11px")
          .attr("transform", (d,i) => `translate(0,${y_scale(d.id)})`)
          .text((d) => d.title)

      let bkgd_rect_attrs = function(rect, x_scale, y_scale){
        rect
          .attr("id", (d) => `box_${d.id}`)
          .attr("x", (d,i) => x_scale(d.start) - 2)
          .attr("width", (d,i) => x_scale(d.stop) - x_scale(d.start) + 4)
          .attr("y", 1)
          .attr("height", 30)
          .attr("rx", 3)
          .attr("ry", 3)
          .attr("transform", (d,i) => `translate(0,${y_scale(d.id)})`)
      }

      // Generate link and background boxes when reference IS available.
      bkgd_sect.selectChildren("a")
        .data(this.inputData.aggregates.filter(ele => ele.ref))
        .join(
          enter => {
            let sel = enter.append("a").attr("href", (d) => undefined)
            sel.append("rect").call(bkgd_rect_attrs, this.x_scale, y_scale)
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
            sel.call(bkgd_rect_attrs, this.x_scale, y_scale)
            return sel
          },
          update => update,
          exit => exit.remove()
        )

      // Adjust labels and background boxes cut off by edge of data area.
      label_sect.selectAll("text").each( function(d,i) {
        let bound_box = this.getBBox()
        bound_box.x_end = bound_box.x + bound_box.width

        if(bound_box.x < x_range_begin){
          this.setAttribute('x', parseFloat(this.attributes.x.value) + Math.abs(bound_box.x)  + left_margin)
        } else if(bound_box.x_end > x_range_limit) {
          this.setAttribute('x', parseFloat(this.attributes.x.value) - (bound_box.x_end - x_range_limit))
        }
      })
    },
    debouncedDraw: debounce(function(){this.draw()}, 50),
  },
  mounted: function(){
    this.hi_line   = d3.select("#SegHighlightLine")
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
