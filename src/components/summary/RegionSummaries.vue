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
      <div v-bind:class="{ 'cards': collapsed, 'card-columns': !collapsed }">

        <div class="card shadow-sm small">

          <div class="card-body">

            <div v-if="loading" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
                  <strong>&nbsp;Loading...</strong>
                </div>
              </div>
            </div>
            <div v-if="failed" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  Error while loading data
                </div>
              </div>
            </div>
            <div v-if="loaded" class="container-fluid">
              <div class="row">
                <div class="col-sm-12">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th scope="col" style="border-top:none;">Variant type</th>
                          <th scope="col" class="d-md-table-cell text-right" style="border-top:none;">Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>All</td>
                          <td class="d-md-table-cell text-right">{{(summary.all['total'] || 0).toLocaleString()}}</td>
                        </tr>
                        <tr>
                          <td>SNVs</td>
                          <td class="d-md-table-cell text-right">{{(summary.all['snv'] || 0).toLocaleString()}}</td>
                        </tr>
                        <tr>
                          <td>Indels</td>
                          <td class="d-md-table-cell text-right">{{(summary.all['indels'] || 0).toLocaleString()}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm small">
          <div class="card-body">
            <div v-if="loading" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
                  <strong>&nbsp;Loading...</strong>
                </div>
              </div>
            </div>
            <div v-if="failed" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  Error while loading data
                </div>
              </div>
            </div>
            <div v-if="loaded" class="container-fluid">
              <div class="row">
                <div class="col-sm-12">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th scope="col" style="border-top:none;">SNVs</th>
                          <th scope="col" class="d-md-table-cell text-right" style="border-top:none;">Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Synonymous</td>
                          <td class="d-md-table-cell text-right">{{this.count_synonymous('all')}}</td>
                        </tr>
                        <tr>
                          <td>Non-synonymous</td>
                          <td class="d-md-table-cell text-right">{{this.count_nonsynonymous('all')}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm small">
          <div class="card-body">
            <div v-if="loading" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
                  <strong>&nbsp;Loading...</strong>
                </div>
              </div>
            </div>
            <div v-if="failed" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  Error while loading data
                </div>
              </div>
            </div>
            <div v-if="loaded" class="container-fluid">
              <div class="row">
                <div class="col-sm-12">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th scope="col" style="border-top:none;">Indels</th>
                          <th scope="col" class="d-md-table-cell text-right" style="border-top:none;">Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Frameshifts</td>
                          <td class="d-md-table-cell text-right">{{this.count_frameshifts('all')}}</td>
                        </tr>
                        <tr>
                          <td>Inframe deletions</td>
                          <td class="d-md-table-cell text-right">{{this.count_inframe_deletions('all')}}</td>
                        </tr>
                        <tr>
                          <td>Inframe insertions</td>
                          <td class="d-md-table-cell text-right">{{this.count_inframe_insertions('all')}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm small">
          <div class="card-body">
            <div v-if="loading" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
                  <strong>&nbsp;Loading...</strong>
                </div>
              </div>
            </div>
            <div v-if="failed" class="container-fluid">
              <div class="row">
                <div class="col-sm-12 text-center">
                  Error while loading data
                </div>
              </div>
            </div>
            <div v-if="loaded" class="container-fluid">
              <div class="row">
                <div class="col-sm-12">
                  <div class="table-responsive">
                    <table class="table table-sm">
                      <thead>
                        <tr>
                          <th scope="col" style="border-top:none;">Putative Loss-of-Function (pLoF)</th>
                          <th scope="col" class="d-none d-md-table-cell text-right" style="border-top:none;">Number</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>High Confidence (HC)</td>
                          <td class="d-md-table-cell text-right">{{(summary.all['LoF (HC)'] || 0).toLocaleString()}}</td>
                        </tr>
                        <tr>
                          <td>Low Confidence (LC)</td>
                          <td class="d-md-table-cell text-right">{{(summary.all['LoF (LC)'] || 0).toLocaleString()}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default {
  name: "RegionSummaries",
  inject: {
    api: {default: ''},
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
    filters: {
      type: Array,
      default: function(){return []}
    },
    filterArray: {
      type: Array,
      default: function(){return []}
    },
  },
  components: {
    FontAwesomeIcon,
  },
  data: function() {
    return {
      tooltipHtml: "",
      closeIcon: faTimes,
      scrollRightIcon: faAngleRight,
      scrollLeftIcon: faAngleLeft,
      expandIcon: faPlusSquare,
      collapseIcon: faMinusSquare,
      hasLeftScroll: false,
      hasRightScroll: false,
      loading: false,
      loaded: false,
      failed: false,
      collapsed: true,
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
      var cards = this.$el.querySelector(".cards");
      this.hasLeftScroll = cards.scrollLeft != 0;
      this.hasRightScroll = Math.abs(cards.scrollWidth - cards.clientWidth - cards.scrollLeft) > 1;
    },
    load: function() {
      if ((this.chrom == null) || (this.start == null) || (this.stop == null)) {
        return;
      }
      let url = `${this.api}/variants/region/snv/${this.chrom}-${this.start}-${this.stop}/summary`;
      this.summary = null;
      this.loaded = false;
      this.failed = false;
      this.loading = true;
      axios
        .post(url, {
          filters: this.filterArray,
          introns: true,
        })
        .then(response => {
          var payload = response.data;
          this.summary = payload['data'];
          this.loading = false;
          this.failed = false;
          this.loaded = true;
          this.$nextTick(() => {
            this.updateHorizontalScroll();
          });
        })
        .catch(error => {
          console.log(error)
          this.loading = false;
          this.loaded = false;
          this.failed = true;
          this.summary = null;
        })
        .finally(() => { });
    },
  },
  watch: {
    filterArray: function() {
      this.load()
    },
  },
  mounted: function() {
    this.load();
  },
}
</script>
