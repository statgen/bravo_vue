<template>
<div class="child-component" v-on:click-annotations="showAnnotationsModal">

  <div v-if="loading" class="d-flex align-items-center statusMessage statusMessage--zTop">
    <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
    <strong>&nbsp;Loading...</strong>
  </div>
  <div v-if="loaded && empty" class="statusMessage statusMessage--zTop">
    No variants
  </div>
  <div v-if="failed" class="statusMessage statusMessage--zTop">
    Error while loading variants
  </div>
  <!-- table managed by Tabulator -->
  <div ref="snvtable" class="table-sm">
  </div>

</div>
</template>

<script>
//import {TabulatorFull as Tabulator} from "tabulator-tables"
import Tabulator from 'tabulator-tables'

export default {
  name: "BaseSNVTable",
  inject: {
    api: {default: ''},
    chrom: {default: 0},
    start: {default: 0},
    stop: {default: 1},
  },
  emits: ["hover", "scroll"],
  props: {
    showCols: {
      type: Object,
      default: function(){
        return({
          variantID:   {val: true},
          rsID:        {val: true},
          consequence: {val: true},
          annotation:  {val: true},
          LOFTEE:      {val: true},
          quality:     {val: true},
          CADD:        {val: true},
          nAlleles:    {val: false},
          het:         {val: true},
          homAlt:      {val: true},
          frequency:   {val: true}
        })
      }
    },
    filters: {
      type: Array,
      default: function() { return [] }
    },
    doDownload: {
      type: Number,
      default: 0
    },
  },
  data: function() {
    return {
      loading: false,
      loaded:  false,
      empty:   true,
      failed:  false,
      selectedVariantId: "",
      selectedVariantAnnotations: [],
      tabulator: null,
      hoveredRowPosition: null,
      paginationSize: 100,
      downloadFileName: "variants.csv"
    }
  },
  computed: {
    // should be overridden by extending component
    ajaxUrl() { return(this.api) }
  },
  watch: {
    filters: function() {
      this.tabulator.setFilter(this.filters);
    },
    doDownload: function() {
      if(this.tabulator == null){ return }
      this.tabulator.download('csv', this.downloadFileName)
    }
  },
  methods:{
    getVisibleVariants: function() {
      let scrollDivHeight = this.tabulator.rowManager.height;
      let scrollDivPosition = this.tabulator.rowManager.scrollTop;
      let lastVisibleRowIndex = this.tabulator.rowManager.vDomBottom;
      let visibleRowsData = []
      while (lastVisibleRowIndex > 0) {
        const rowElement = this.tabulator.rowManager.displayRows[0][lastVisibleRowIndex].element;
        if (rowElement.offsetTop < scrollDivPosition + scrollDivHeight) {
          break;
        }
        lastVisibleRowIndex--;
      }
      let firstVisibleRowIndex = lastVisibleRowIndex;
      while (firstVisibleRowIndex > 0) {
        const rowElement = this.tabulator.rowManager.displayRows[0][firstVisibleRowIndex].element;
        if (rowElement.offsetTop < scrollDivPosition) {
          break;
        }
        firstVisibleRowIndex--;
      }
      if (this.tabulator.rowManager.displayRows[0].length > 0) {
        for (var i = firstVisibleRowIndex; i <= lastVisibleRowIndex; ++i) {
          visibleRowsData.push(this.tabulator.rowManager.displayRows[0][i].data);
        }
      }
      return { 
        firstRowIdx: firstVisibleRowIndex, 
        lastRowIdx:  lastVisibleRowIndex, 
        rowsData: visibleRowsData }
    },
    hover: function(variant, hovered) {
      this.tabulator.getRows().forEach(r => { // clean up all elements (just in case)
        r.getElement().classList.remove("hover");
      });
      if (hovered) {
        this.tabulator.getRowFromPosition(variant).getElement().classList.add("hover");
      }
    },
    //fomerly ajaxError callback
    tblAjaxError: function() {
        this.loading = false;
        this.loaded = false;
        this.failed = true;
    },
    //fomerly dataLoaded callback
    tblDataLoaded: function(data){
      this.empty = data.length == 0;
    },
    //formerly renderComplete callback
    tblRenderComplete: function(){
      if(this.tabulator == null){ return }
      let visVars = this.getVisibleVariants();

      // make sure that row is hovered after re-rendering on mobile touch screen
      if (this.hoveredRowPosition != null) { 
        var row = this.tabulator.getRowFromPosition(this.hoveredRowPosition);
        row.getElement().classList.add('row-hovered');
      }
      this.$emit("scroll", visVars.firstRowIdx, visVars.lastRowIdx, visVars.rowsData);
    },
    //formerly enterMouseEnter callback
    tblRowMouseEnter: function(e, row) {
      // row was hovered from before and mouseleave was never called
      if ((this.hoveredRowPosition != null) && (this.hoveredRowPosition != row.getPosition())) { 
        var hoveredRow = this.tabulator.getRowFromPosition(this.hoveredRowPosition);
        hoveredRow.getElement().classList.remove('row-hovered');
        this.$emit("hover", hoveredRow.getPosition(), hoveredRow.getData(), false);
        this.hoveredRowPosition = null;
      }

      this.hoveredRowPosition = row.getPosition();
      row.getElement().classList.add('row-hovered');
      this.$emit("hover", row.getPosition(), row.getData(), true);
    },
    //formerly rowMouseLeave callback
    tblRowMouseLeave: function(e, row) {
      row.getElement().classList.remove('row-hovered');
      this.$emit("hover", row.getPosition(), row.getData(), false);
      this.hoveredRowPosition = null;
    },
    formatCaddValue: function(cell) {
      return(cell.getValue() === null ? "" : cell.getValue().toFixed(2))
    },
    // function to override to customize column defs. 
    tblColumnDefs: function(){
      return this.baseColumnDefs()
    },
    // common column defs. 
    baseColumnDefs: function(){
      return([
        {
          title: "Variant Id",
          titleDownload: "Variant Id",
					headerTooltip: "chrom-position-ref-alt",
          width: 130,
          field: "variant_id",
          visible: this.showCols.variantID,
          formatter: (cell) => { return `<a href='variant.html?id=${cell.getValue()}'>${cell.getValue()}</a>`; }
        },
        {
          title: "rsId",
          titleDownload: "rsId",
					headerTooltip: "Reference SNP (rs) number is a locus accession for a variant type assigned by dbSNP.",
          width: 100,
          field: "rsids",
          visible: this.showCols.rsID.val,
          formatter: (cell) => {
            var html = "";
            cell.getValue().forEach(v => {
              html += `<a href='variant.html?id=${v}'>${v}</a>`;
            });
            return html;
          },
          accessorDownload: (value) => {
            if (value != null) {
              return value.join(';');
            } else {
              return "";
            }
          }
        },
        {
          title: "Quality",
          titleDownload: "Quality",
          field: "filter",
          width: 78,
          hozAlign: "left",
          visible: this.showCols.quality.val,
          formatter: (cell, params, onrendered) => {
            var html = "";
            cell.getValue().forEach( v => {
              var badge_type = v == "PASS" ? "success" : "danger";
              html += `<span class="badge badge-${badge_type}" style="margin-right:1px">${v}</span>`;
            });
            return html;
          },
          accessorDownload: (value) => {
            if (value != null) {
              return value.join(';');
            } else {
              return "";
            }
          }
        },
        {
          title: "CADD",
          titleDownload: "CADD",
					headerTooltip: "Variant deleteriousness score (PHRED-like scaled) computed with Combined Annoation Dependent Depletion (CADD) tool.",
          field: "cadd_phred",
          width: 80,
          hozAlign: "left",
          visible: this.showCols.CADD.val,
          formatter: this.formatCaddValue
        },
        {
          title: "N Alleles",
          titleDownload: "N Alleles",
          field: "allele_num",
          width: 88,
          hozAlign: "left",
          visible: this.showCols.nAlleles.val,
          formatter: (cell, params, onrendered) => cell.getValue().toLocaleString()
        },
        {
          title: "Het",
					headerTooltip: "Number of heterozygotes.",
          titleDownload: "Het",
          field: "het_count",
          width: 80,
          hozAlign: "left",
          visible: this.showCols.het.val,
          formatter: (cell, params, onrendered) => cell.getValue().toLocaleString()
        },
        {
          title: "Hom",
          titleDownload: "Hom",
					headerTooltip: "Number of homozygotes for alternate allele.",
          field: "hom_count",
          width: 90,
          hozAlign: "left",
          visible: this.showCols.homAlt.val,
          formatter: (cell, params, onrendered) => cell.getValue().toLocaleString()
        },
        {
          title: "Frequency %",
          titleDownload: "Frequency %",
          field: "allele_freq",
          width: 125,
          hozAlign: "left",
          visible: this.showCols.frequency.val,
          formatter: (cell, params, onrendered) => `${(cell.getValue() * 100).toPrecision(3)}%`,
        },
      ])
    }
  },
  mounted: function() {
    this.tabulator = new Tabulator(this.$refs.snvtable, {
      placeholder: null,
      ajaxURL: this.ajaxUrl,
      ajaxConfig: {
        method: "POST",
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
      ajaxURLGenerator: (url, config, params) => {
        // when 1st page is requested "next" must be null
        if (params.page == 1) {
          params.next = null;
        }
        return url;
      },
      ajaxResponse: (url, params, response) => {
        response.last_page = Math.ceil(response.total / response.limit);
        params.next = response.next;
        this.failed = false;
        this.loading = false;
        this.loaded = true;
        return response;
      },
      scrollVertical: (top) => {
        let visVars = this.getVisibleVariants();
        this.$emit("scroll", visVars.firstRowIdx, visVars.lastRowIdx, visVars.rowsData);
      },
      paginationSize: this.paginationSize,
      height: "600px",
      layout: "fitColumns",
      columns: this.tblColumnDefs(),
      initialSort: [ { column: "variant_id", dir: "asc" } ],
      initialFilter: this.filters,

      // tabulator-table 5.0 options
      //sortMode: "remote",
      //filterMode: "remote",
      //dataLoader: false,
      //dataLoaderLoading: "",
      //dataLoaderError: "",
      //progressiveLoad: "scroll",

      // tabulator-table 4.9 options
      ajaxProgressiveLoad: "scroll",
      ajaxLoaderError: "",
      ajaxLoaderLoading: "",
      ajaxLoader:    false,
      ajaxSorting:   true,
      ajaxFiltering: true,
      ajaxError:      this.tblAjaxError,
      dataLoaded:     this.tblDataLoaded,
      renderComplete: this.tblRenderComplete,
      rowMouseEnter:  this.tblRowMouseEnter,
      rowMouseLeave:  this.tblRowMouseLeave
    })
    // register event handlers tabulator 5.0
    //this.tabulator.on("ajaxError", this.tblAjaxError)
    //this.tabulator.on("dataProcessed", this.tblDataLoaded)
    //this.tabulator.on("renderComplete", this.tblRenderComplete)
    //this.tabulator.on("rowMouseEnter", this.tblRowMouseEnter)
    //this.tabulator.on("rowMouseLeave", this.tblRowMouseLeave)

  }
}
</script>
