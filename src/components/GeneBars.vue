<template>
<div class="child-component">
  <div class="bravo-tooltip">
    <div v-html="tooltipHtml"></div>
  </div>
  <button class="close-button" v-on:click="$emit('close')">
    <font-awesome-icon style="background-color: transparent;" :icon="closeIcon"></font-awesome-icon>
  </button>
  <div v-if="loading" class="d-flex align-items-center statusMessage">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="failed" class="statusMessage">Error while loading genes data</div>
  <div v-if="loaded && (genes.length > 0)" class="bravo-info-message">Displaying {{ genes.length }} gene(s)</div>
  <div v-if="loaded && (genes.length == 0)" class="statusMessage">No genes in this region</div>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as d3 from "d3";
import axios from "axios";
axios.defaults.withCredentials=true

export default {
  name: "GeneBars",
  inject: {
    api: {default: ''},
    chrom: {default: '11'},
    start: {default: 200000},
    stop:  {default: 201000}
  },
  emits: ['geneClick', 'close'],
  props: {
    //formerly region.segments.plot
    segmentBounds: {
      type: Array,
      default: function(){return [0, 1000 ]}
    },
    //formerly region.segments.region
    segmentRegions: {
      type: Array,
      default: function(){return [100000, 101000]}
    },
    //formerly dimensions.width
    givenWidth: {
      type: Number,
      default: 300
    },
    //formerly dimensions.margin
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
    'hoveredVariant':{
      type: Object
    },
    hoveredVarPosition: {
      type: Number,
      default: null
    }
  },
  components: {
      FontAwesomeIcon,
  },
  data: function() {
    return {
      loading: false,
      loaded: false,
      failed: false,
      tooltipHtml: "",
      closeIcon: faTimes,
    }
  },
  methods: {
    load: function() {
      this.failed = false;
      this.loaded = false;
      this.loading = true;
      axios
        .get(`${this.api}/genes/${this.chrom}-${this.start}-${this.stop}`)
        .then( response => {
          var payload = response.data;
          if (payload.data.length > 0) {
            this.genes = payload.data;
            this.unwind_exons();
            this.initializeGenesSVG();
            this.draw();
          }
          this.loading = false;
          this.loaded = true;
        })
        .catch( error => {
          console.log("Genes loading failed: " + error)
          this.failed = true;
          this.loaded = false;
        });
    },
    unwind_exons: function () {
      this.exons = [];
      this.genes.forEach(function (gene) {
        gene.features.sort( function(a, b) { return a.start - b.start; });
        var last = { start: 0, stop: 0 };
        gene.features.forEach(function(feature) {
          if (feature.feature_type == 'exon') {
            if ((last.start != feature.start) || (last.stop != feature.stop)) { // remove identical regions e.g from different transcripts
              feature.gene_type = gene.gene_type;
              this.exons.push(feature);
              last = feature;
            }
          }
        }, this);
      }, this);
    },
    arrange_genes: function () {
      var buckets = [{ genes: [] }];
      var intersect = function(gene, start, stop) {
        if ((gene.box_right >= start) && (gene.box_left <= stop)) {
          return Math.min(gene.box_left, stop) - Math.max(gene.box_right, start) + 1;
        }
        return 0;
      }
      var put = function(gene) {
        for (var i = 0; i < buckets.length; ++i) {
          if (buckets[i].genes.length == 0) {
            gene.y = i;
            buckets[i].genes.push(gene);
            return;
          } else if (buckets[i].genes.every(function(gene2) { return intersect(gene, gene2.box_left, gene2.box_right) == 0; })) {
            gene.y = i;
            buckets[i].genes.push(gene);
            return;
          }
        }
        gene.y = buckets.length + 1;
        buckets.push({ genes: [gene] });
      }
      this.genes.forEach(function(gene) {
        // very trivial calculation of text box size given that we use 11px font size (assume 0.7 ratio of height to width) of known font style! if you change font style or size, change this line as well.
        var label_width = (gene.gene_name.length + 2) * 11 * 0.7;
        var padding = label_width - (gene.x_stop - gene.x_start);
        padding = padding < 0 ? 0 : padding / 2.0;
        gene.box_left = gene.x_start - padding - 2;
        gene.box_right = gene.x_stop + padding + 2;
        put(gene);
        gene.features.forEach(function(feature) {
          feature.y = gene.y;
        });
      });
    },
    handleBarMouseover: function(evt, gene) {
      let rect = evt.target
      d3.select(evt.target)
        .style("fill", "#eeeeee")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("cursor", "pointer")

      // Calculate position of tooltip
      let s = gene.start < this.start ? this.start : gene.start
      let e = gene.stop > this.stop ? this.stop : gene.stop
      let tooltip_x = this.x_scale(s + (e - s) / 2.0) + this.givenMargins.left
      let tooltip_y = rect.getAttribute("y") - this.$el.querySelector("#scroll").scrollTop - this.givenMargins.top - 16

      d3.select(this.$el.querySelector(".bravo-tooltip"))
        .style("display", "block")
        .style("left", tooltip_x + "px")
        .style("top", tooltip_y + "px")

      this.tooltipHtml = `<ul><li><i>${gene.gene_name}</i>(${gene.strand})</li>
        <li>${gene.gene_id}</li>
        <li style='color: #85144b'>${gene.gene_type}</li>
        <li>${gene.chrom}:${gene.start.toLocaleString()}-${gene.stop.toLocaleString()}</li><ul>`
    },
    handleBarMouseout: function(evt) {
      d3.select(this.$el.querySelector(".bravo-tooltip"))
        .style("display", "none");
      this.tooltipHtml = "";
      d3.select(evt.target)
        .style("fill", "white")
        .style("stroke", "none")
        .style("stroke-width", 0)
        .style("cursor", "default");
    },
    initializeSVG: function () {
      this.svg = d3.select(this.$el)
        .append("div")
          .attr("id", "scroll")
          .style("max-height", `${this.height}px`)
          .style("display", "block")
          .style("overflow-y", "scroll")
          .style("overflow-x", "hidden")
        .append("svg")
          .style("display", "block");
      this.drawing_clip = this.svg
        .append("clipPath")
          .attr("id", "genes-clip")
        .append("rect")
          .attr("x", 0)
          .attr("y", 0);
      this.drawing = this.svg.append("g");
      this.x_scale = d3.scaleLinear();
    },
    initializeGenesSVG: function() {
      this.rects_box = this.drawing.selectAll("rec")
        .data(this.genes)
        .enter()
        .append("rect")
        .attr("height", 21)
        .attr("shape-rendering", "geometricPrecision")
        .style("fill", "white")
        .style("stroke", "none")
        .style("stroke-width", 0)
        .style("rx", 3)
        .style("ry", 3)
        .attr("rx", 3) // for firefox & safari
        .attr("ry", 3); // for firefox & safari
      this.rects_genes = this.drawing.selectAll("rec")
        .data(this.genes)
        .enter()
        .append("rect")
        .attr("height", 3)
        .attr("shape-rendering", "crispEdges")
        .style("pointer-events", "none")
        .style("fill", d => this.color[d.gene_type] || '#999999');
      this.rects_exons = this.drawing.selectAll("rec")
        .data(this.exons)
        .enter()
        .append("rect")
        .attr("height", 7)
        .attr("shape-rendering", "crispEdges")
        .style("pointer-events", "none")
        .style("fill", d => this.color[d.gene_type] || '#999999');
      this.text_genes = this.drawing.selectAll("text")
        .data(this.genes)
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
      this.rects_box.on("click", d => this.$emit("geneClick", d));
    },
    draw: function () {
      this.x_scale.range(this.segmentBounds).domain(this.segmentRegions);
      this.genes.forEach(function(gene) {
        gene.x_start = this.x_scale(gene.start);
        gene.x_stop = this.x_scale(gene.stop);
        gene.features.forEach(function(feature) {
          feature.x_start = this.x_scale(feature.start);
          feature.x_stop = this.x_scale(feature.stop);
        }, this);
      }, this);
      this.arrange_genes();
      var max_y = d3.max(this.genes, function(gene) { return gene.y; }) + 1;
      this.svg
        .attr("width", this.givenWidth)
        .attr("height", this.givenMargins.top + max_y * 22 + 2);
      this.drawing
        .attr("transform", `translate(${this.givenMargins.left}, ${this.givenMargins.top})`);
      this.drawing_clip
        .attr("width", this.givenWidth - this.givenMargins.left - this.givenMargins.right)
        .attr("height", max_y * 22 + 2);
      this.rects_genes
        .attr("clip-path", "url(#genes-clip)")
        .attr("x", function(d) { return d.x_start; })
        .attr("width", function(d) { return d.x_stop - d.x_start; })
        .attr("y", function(d) { return d.y * 22 + 22 - 3 - 2; });
      this.rects_exons
        .attr("clip-path", "url(#genes-clip)")
        .attr("x", function(d) { return d.x_start; })
        .attr("width", function(d) { return d.x_stop - d.x_start; })
        .attr("y", function(d) { return d.y * 22 + 22 - 5 - 2; });
      this.text_genes
        .attr("clip-path", "url(#genes-clip)")
        .attr("x", d => {
          var s = Math.max(this.start, d.start);
          var e = Math.min(this.stop, d.stop);
          return this.x_scale(s + (e - s) / 2.0);
        })
        .attr("y", function(d) { return d.y * 22 + 22 - 3 - 2 - 3; })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "alphabetic")
        .style("font-family", "sans-serif")
        .style("font-style", "italic")
        .style("font-size", "11px")
        .html(function(d) {
          if (d.strand == '+') {
            return d.gene_name + " →"
          } else {
            return "← " + d.gene_name;
          }
        });
      this.rects_box
        .attr("clip-path", "url(#genes-clip)")
        .attr("x", function(d) { return d.box_left; })
        .attr("width", function(d) { return d.box_right - d.box_left; })
        .attr("y", function(d) { return d.y * 22 + 22 - 18 - 2; });
    },
  },
  beforeCreate: function() {
    // initialize non reactive data
    this.genes = [];
    this.exons = [];
    this.height = 200;
    this.color = {
      'protein_coding': '#373994'
    };
    this.svg = null;
    this.drawing = null;
    this.drawing_clip = null;
    this.drawing_x_axis = null;
    this.x_scale = null;
    this.rects_genes = null;
    this.rects_exons = null;
    this.rects_box = null;
    this.tip = null;
  },
  created: function() {
  },
  mounted: function() {
    this.initializeSVG();
    this.load();
  },
  watch: {
    givenWidth: function() {
      if ((!this.loading) && (!this.failed)) {
        if (this.genes.length > 0) {
          this.draw()
        }
      }
    },
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
