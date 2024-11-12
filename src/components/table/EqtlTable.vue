<template>
<div class="child-component">
  <div v-if="loading" class="d-flex align-items-center statusMessage statusMessage--zTop">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="failed" class="statusMessage statusMessage--zTop">
    Error while loading eqtls
  </div>
  <div ref="eqtltable" class="table-sm">
  </div>
</div>
</template>

<script>
import Tabulator from 'tabulator-tables'

export default {
  name: "EqtlTable",
  inject: {
    api: {default: ''},
    geneId: {default: ''},
    ensemblId: {default: ''}
  },
  data: function() {
    return {
      loading: false,
      loaded:  false,
      empty:   true,
      failed:  false,
      tabulator: null,
      paginationSize: 100,
      downloadFileName: "eqtl.csv"
    }
  },
  computed: {
    ajaxUrl() {
      return(`${this.api}/eqtl/susie`)
    }
  },
  watch: {
    doDownload: function() {
      if(this.tabulator == null){ return }
      this.tabulator.download('csv', this.downloadFileName)
    }
  },
  methods:{
    tblAjaxError: function() {
        this.loading = false;
        this.loaded = false;
        this.failed = true;
    },
    tblDataLoaded: function(data){
      this.empty = data.length == 0
    },
    tblColumnDefs: function(){
      return([
        {
          title: "Variant Id",
          titleDownload: "Variant Id",
					headerTooltip: "chrom-position-ref-alt",
          minWidth: 130,
          widthGrow: 1,
          field: "variant_id",
          formatter: (cell) => { return `<a href='variant.html?id=${cell.getValue()}'>${cell.getValue()}</a>`; }
        },
        {
          title: "Tissue",
          titleDownload: "Tissue",
					headerTooltip: "Source tissue of rnaseq data",
          minWidth: 130,
          widthGrow: 1,
          field: "tissue",
        },
        {
          title: "PIP",
          titleDownload: "PIP",
					headerTooltip: "Probability the variant is causal for this eQTL signal",
          minWidth: 80,
          widthGrow: 1,
          field: "pip",
        }
      ])
    }
  },
  mounted: function() {
    this.tabulator = new Tabulator(this.$refs.eqtltable, {
      height: "150px",
      layout: "fitDataStretch",
      placeholder: "No eQTL Data",
      ajaxURL: this.ajaxUrl,
      ajaxParams: {gene: this.geneId },
      ajaxConfig: {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=utf-8",
        },
        credentials: "include"
      },
      ajaxContentType: "json",
      ajaxRequesting: () => {
        this.failed = false;
        this.loaded = false;
        this.loading = true;
        return true;
      },
      ajaxResponse: (url, params, response) => {
        this.failed = false;
        this.loading = false;
        this.loaded = true;
        return response;
      },
      columns: this.tblColumnDefs(),
      initialSort: [ { column: "tissue", dir: "asc" } ],

      // tabulator-table 4.9 options
      ajaxLoaderError: "",
      ajaxLoaderLoading: "",
      ajaxLoader:    false,
      ajaxSorting:   false,
      ajaxFiltering: false,
      ajaxError:      this.tblAjaxError,
      dataLoaded:     this.tblDataLoaded,
    })
  }
}
</script>
