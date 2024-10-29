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
  <div v-if="loaded && (geneSegsData.aggregates.length > 0)" class="bravo-info-message">
    Displaying {{ geneSegsData.aggregates.length }} gene(s)
  </div>
  <div v-if="loaded && (geneSegsData.aggregates.length == 0)" class="statusMessage">No genes in this region</div>
  <SegBars :highlightGenomePosition="hoveredVarPosition" :segmentRegion="[start, stop]" :inputData="geneSegsData"/>
</div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import * as d3 from "d3";
import axios from "axios";
axios.defaults.withCredentials=true

import SegBars from '@/components/SegBars.vue'

export default {
  name: "GeneSegments",
  inject: {
    api: {default: ''},
    chrom: {default: '11'},
    start: {default: 200000},
    stop:  {default: 201000}
  },
  components: {
    SegBars,
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
  props: {
    hoveredVarPosition: {
      type: Number,
      default: 0
    }
  },
  beforeCreate: function() {
    // initialize non reactive data
    this.geneSegsData = {"segments": [], "aggregates":[]};
  },
  methods: {
    gene_to_aggregate: function(gene){
      return {
        start: gene.start, stop: gene.stop,
        id: gene.gene_id,
        type: gene.gene_type,
        is_coding: gene.gene_type === "protein_coding",
        title: gene.strand === '+' ? gene.gene_name + " →" : "← " + gene.gene_name,
        desc: gene.gene_name + '(' + gene.strand + ')',
        ref: `gene.html?id=${gene.gene_id}`
      }
    },
    feature_to_segment: function(feat, id, is_coding){
      return {
        start: feat.start,
        stop: feat.stop,
        id: id,
        is_coding: is_coding
      }
    },
    gene_to_segments: function(gene){
      /* Subset to exons and reduce number of overlapping segments
         Use gene_id as identifier for group membership
       */
      return gene.features
        .filter((feat) => feat.feature_type === "exon")
        .sort((lhs, rhs) => lhs.start - rhs.start)
        .filter((ele,idx,arr) => arr[idx-1]?.stop === undefined ? true : ele.stop > arr[idx-1]?.stop)
        .map((x) => {return this.feature_to_segment(x, gene.gene_id, gene.gene_type === "protein_coding")})
    },
    load: function() {
      this.failed = false;
      this.loaded = false;
      this.loading = true;
      axios
        .get(`${this.api}/genes/${this.chrom}-${this.start}-${this.stop}`)
        .then( response => {
          let genes = response.data.data;
          if (genes.length > 0) {
            let agg = genes.map(this.gene_to_aggregate)
            let segs = genes.map(this.gene_to_segments).flat()

            this.geneSegsData.aggregates.push(...agg)
            this.geneSegsData.segments.push(...segs)
          }
          this.loading = false;
          this.loaded = true;
        })
        .catch( error => {
          console.log("Genes loading failed: " + error)
          this.failed = true;
          this.loaded = false;
        })
    },
  },
  mounted: function() {
    this.load();
  },
}
</script>
