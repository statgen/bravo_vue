<template>
  <div class="child-component">
    <div class="control-buttons">
      <button v-if="hasLeftScroll || hasRightScroll" class="control-button" v-on:click="collapsed = !collapsed">
        <div style="display: inline" v-if="collapsed">
          Expand <font-awesome-icon style="background-color: transparent;" :icon="expandIcon"></font-awesome-icon>
        </div>
        <div style="display: inline" v-else>
          Collapse <font-awesome-icon style="background-color: transparent;" :icon="collapseIcon"></font-awesome-icon>
        </div>
      </button>
      <button class="control-button" v-on:click="$emit('close')">
        <font-awesome-icon style="background-color: transparent;" :icon="closeIcon"></font-awesome-icon>
      </button>
    </div>
    <button v-if="collapsed && hasLeftScroll" class="hscroll-button scroll-left" v-on:click="scroll(-200)">
      <font-awesome-icon style="background-color: transparent;" :icon="scrollLeftIcon"></font-awesome-icon>
    </button>
    <button v-if="collapsed && hasRightScroll" class="hscroll-button scroll-right" v-on:click="scroll(200)">
      <font-awesome-icon style="background-color: transparent;" :icon="scrollRightIcon"></font-awesome-icon>
    </button>
    <div class="container-fluid">
      <div ref="summaryDeck" v-bind:class="{ 'cards': collapsed, 'card-columns': !collapsed }">
        <NumericSummaryCard title="Variant type" :state="loadingState" :summaryData="summaryDataVariantType"/>
        <NumericSummaryCard title="SNVs" :state="loadingState" :summaryData="summaryDataSNVs"/>
        <NumericSummaryCard title="Indels" :state="loadingState" :summaryData="summaryDataIndels"/>
        <NumericSummaryCard title="Putative Loss-of-Function" :state="loadingState" :summaryData="summaryDataPLoF"/>
      </div>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faPlusSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
axios.defaults.withCredentials=true

import NumericSummaryCard from '@/components/summary/NumericSummaryCard.vue'

export default {
  name: "GeneSummary",
  components: {
    FontAwesomeIcon,
    NumericSummaryCard
  },
  inject: {
    api: {default: ''},
    geneId: {default: ''},
    ensemblId: {default: ''},
    chrom: {default: 0},
    start: {default: 0},
    stop: {default: 1}
  },
  emits: ['close'],
  props: {
    region: {
      type: Object,
      default: function(){ return {} }
    },
    filterArray: {
      type: Array,
      default: function(){return []}
    },
  },
  data: function() {
    return {
      closeIcon: faTimes,
      scrollRightIcon: faAngleRight,
      scrollLeftIcon: faAngleLeft,
      expandIcon: faPlusSquare,
      collapseIcon: faMinusSquare,

      hasLeftScroll: false,
      hasRightScroll: false,
      collapsed: true,

      //states: loading, loaded, failed
      loadingState: "loading",

      // summary data loaded from API
      summary: null
    }
  },
  methods:{
    count_synonymous: function(category) {
      return (this.summary[category]['synonymous_variant'] || 0) +
        (this.summary[category]['start_retained_variant'] || 0) +
        (this.summary[category]['stop_retained_variant'] || 0);
    },
    count_nonsynonymous: function(category) {
      return (this.summary[category]['missense_variant'] || 0) +
        (this.summary[category]['start_lost'] || 0) +
        (this.summary[category]['stop_gained'] || 0) +
        (this.summary[category]['stop_lost'] || 0);
    },
    count_frameshifts: function(category) {
      return this.summary[category]['frameshift_variant'] || 0;
    },
    count_inframe_insertions: function(category) {
      return (this.summary[category]['inframe_insertion'] || 0);
    },
    count_inframe_deletions: function(category) {
      return (this.summary[category]['inframe_deletion'] || 0);
    },
    updateHorizontalScroll: function() {
      let cards = this.$refs.summaryDeck
      this.hasLeftScroll = cards.scrollLeft != 0
      this.hasRightScroll = Math.abs(cards.scrollWidth - cards.clientWidth - cards.scrollLeft) > 1
    },
    load: function() {
      if( this.ensembleId === "" ){ return }
      let url = `${this.api}/variants/gene/snv/${this.ensemblId}/summary`;
      this.summary = null;
      this.loadingState = "loading"
      axios
        .post(url, {
          filters: this.filterArray,
          introns: true,
        })
        .then(response => {
          var payload = response.data;
          this.summary = payload['data'];
          this.loadingState = "loaded"
          this.$nextTick(() => {
            this.updateHorizontalScroll();
          });
        })
        .catch(error => {
          console.log(error)
          this.loadingState = "failed"
          this.summary = null;
        })
        .finally(() => { });
    },
  },
  computed: {
    summaryDataVariantType() {
      if( this.summary === null ){ return {} }
      return {
        All:    this.summary.all['total'],
        SNVs:   this.summary.all['snv'],
        Indels: this.summary.all['indels']
      }
    },
    summaryDataSNVs() {
      if( this.summary === null ){ return {} }
      return {
        'Synonymous':     this.count_synonymous('all'),
        'Non-synonymous': this.count_nonsynonymous('all')
      }
    },
    summaryDataIndels() {
      if( this.summary === null ){ return {} }
      return {
        'Frameshifts':        this.count_frameshifts('all'),
        'Inframe deletions':  this.count_inframe_deletions('all'),
        'Inframe insertions': this.count_inframe_insertions('all')
      }
    },
    summaryDataPLoF() {
      if( this.summary === null ){ return {} }
      return {
        'High Confidence (HC)': this.summary.all['LoF (HC)'],
        'Low Confidence (LC)':  this.summary.all['LoF (LC)']
      }
    },
  },
  watch: {
    filterArray: function() {
      this.load()
    },
  },
  mounted: function() {
    this.load()
  }
}
</script>
