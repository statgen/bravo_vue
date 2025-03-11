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
  name: "BaseEqtlTable",
  inject: {
    api: {default: ''},
    /*
      Additional appropriate injects (e.g. geneId or chrom)
        need to be declared by the extending component
    */
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
    /* Needs to be overridden by the extending component */
    ajaxUrl() { return(`${this.api}/eqtl/susie`) },
    ajaxParams() {return{gene: this.geneId} }
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
      return this.baseColumnDefs()
    },
    baseColumnDefs: function(){
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
        },
        {
          title: "CS_Id",
          titleDownload: "cs_id",
					headerTooltip: "Credible set id",
          minWidth: 40,
          widthGrow: 0.5,
          field: "cs_id",
        }
      ])
    }
  },
  mounted: function() {
    this.tabulator = new Tabulator(this.$refs.eqtltable, {
      height: "250px",
      layout: "fitDataStretch",
      placeholder: "No SuSiE eQTL Data",
      ajaxURL: this.ajaxUrl,
      ajaxParams: this.ajaxParams,
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
      initialSort: [ { column: "tissue", dir: "asc" },
                     { column: "pip", dir: "desc"}],

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
