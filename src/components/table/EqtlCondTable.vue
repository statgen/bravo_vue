<template>
<div class="child-component">
  <div v-if="loading" class="d-flex align-items-center statusMessage statusMessage--zTop">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="failed" class="statusMessage statusMessage--zTop">
    Error while loading conditional eqtls
  </div>
  <div ref="eqtltable" class="table-sm">
  </div>
</div>
</template>

<script>
import Tabulator from 'tabulator-tables'

export default {
  name: "EqtlCondTable",
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
      downloadFileName: "eqtl.all.csv"
    }
  },
  computed: {
    ajaxUrl() {
      return(`${this.api}/eqtl/cond`)
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
      this.empty = data.length == 0;
    },
    tblColumnDefs: function(){
      /*
        "true_df" : 264.215,
        "variant_id" : "chr10_816107_T_C",
        "tss_distance" : -115598,
        "slope" : -0.215315,
        "pval_perm" : "9.999e-05",
        "tissue" : "Monocyte"
       */
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
          title: "True DF",
          titleDownload: "True DF",
					headerTooltip: "Estimated true degrees of freedom",
          minWidth: 130,
          widthGrow: 1,
          field: "true_df",
        },
        {
          title: "Distance",
          titleDownload: "Distance",
					headerTooltip: "Distance from the gene transcription start site",
          minWidth: 130,
          widthGrow: 1,
          field: "tss_distance",
        },
        {
          title: "Slope",
          titleDownload: "Slope",
					headerTooltip: "Linear regression estimated slope for the allele dosage term",
          minWidth: 130,
          widthGrow: 1,
          field: "slope",
        },
        {
          title: "Emp. p-val",
          titleDownload: "Emp. p-val",
					headerTooltip: "Empirical p-value for association between the gene expression and genetic variant",
          minWidth: 130,
          widthGrow: 1,
          field: "pval_perm",
        },
        {
          title: "Tissue",
          titleDownload: "Tissue",
					headerTooltip: "Source tissue of rnaseq data",
          minWidth: 130,
          widthGrow: 1,
          field: "tissue",
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
        //credentials: "include"
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
