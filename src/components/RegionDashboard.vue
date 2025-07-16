<template>
<div id="dashboard">
  <div class="container-fluid">
    <div class="row justify-content-center px-5">
      <div class="col-md">
        <RegionInfo v-if="positionResolved"/>
      </div>
    </div>

    <div id="tab-headers" class="row justify-content-center">
      <div class="col-md px-5">
        <ul class="nav nav-tabs" style="margin-bottom: 5px">

          <li class="nav-item">
            <a :class=tabClass(showTab.snv) href="#snv" @click="toggleTab('snv')">SNVs and Indels</a>
          </li>
          <li class="nav-item">
            <a :class=tabClass(showTab.eqtl) href="#eqtl" @click="toggleTab('eqtl')">eQTLs ({{eqtl_count}})</a>
          </li>

          <!-- Todo: Implement SV visualization
          <li class="nav-item">
            <a :class=tabClass(showTab.structvar) href="#structvar" @click="toggleTab('structvar')">Structural Variants</a>
          </li>
          -->

        </ul>
      </div>
    </div>

    <!-- strucvar tab
    <div id="structvar-tab" v-if="showTab.structvar">
      <div class="row justify-content-left px-5" >
        <div class="col-md-11">
          <h4>Structural Variants Visual</h4>
          <pre> Visualization Placeholder </pre>
        </div>
        <div class="col-md-11">
          <h4>Structural Variants Description</h4>
          <pre> Description Placeholder </pre>
        </div>
      </div>
    </div>
    -->

    <!-- SNVs tab -->
    <div id="snv-tab" v-if="showTab.snv">
      <div class="row justify-content-left px-5">
        <div class="col-md-5">
          <div >
            <ToggleList list-title="Panels" list-group="showPanels" :list-vars="showPanels"
              @varToggled="handleInfoViewToggle" :icon="panelsIcon"/>
            <ToggleList list-title="Columns" list-group="showCols" :list-vars="showCols"
              @varToggled="handleColumnVisToggle" :icon="columnsIcon"/>

            <div class="d-none d-sm-inline" style="display: inline-block;">
              <button type="button" class="parentMenu__button" v-on:click="doDownload++">
                CSV
                <font-awesome-icon style="background-color: transparent; display: inline-block; vertical-align: middle" :icon="downloadIcon"></font-awesome-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-content-left px-5">
        <div class="col-md" v-if="positionResolved">
          <RegionSummaries v-if="showPanels.summaries.val" :filterArray='filterArray'
            @close="showPanels.summaries.val = false"/>
        </div>
      </div>

      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <SeqDepth v-if="showPanels.seqDepth.val" @close="showPanels.seqDepth.val = false"
            :hoveredVarPosition="hoveredVarPosition"
            :segmentRegions="segmentRegions"/>
        </div>
      </div>

      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <GeneSegments v-if="showPanels.genes.val" @close="showPanels.genes.val = false"
            @gene-click="handleGeneBarClick" :hoveredVarPosition="hoveredVarPosition" />
        </div>
      </div>

      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <EqtlCount v-if="showPanels.genes.val" :hoveredVarPosition="hoveredVarPosition" />
        </div>
      </div>

      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <RegionSnvCount v-if="showPanels.snvCount.val" @close="showPanels.snvCount.val = false"
            :segmentRegions="segmentRegions" :filters="filterArray" :visibleVariants="visibleVariants"/>
        </div>
      </div>

      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <BpCoordBar :segmentRegions="segmentRegions"/>
        </div>
      </div>

      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <FilterBar @filterChange='handleFilterChange'/>
        </div>
      </div>
      <div class="row justify-content-left">
        <div class="col-md px-5" v-if="positionResolved">
          <RegionSNVTable :filters="filterArray" :doDownload="doDownload" 
            :initColVis="showCols" :colVisChange='colVisChange'
            @scroll='handleTableScroll' @hover='handleTableHover' @openModal="handleOpenModal"/>
        </div>
      </div>

    </div>
    <!-- SNVs tab end -->

    <!-- eQTL tab -->
    <div id="eqtl-tab" v-if="showTab.eqtl">
      <div class="row justify-content-left px-5" >
        <div class="col-md-6">
          <RegionEqtlTable/>
        </div>
        <div class="col-md-6">
          <RegionEqtlSummaries/>
        </div>
      </div>
      <div class="row justify-content-left px-5" >
        <div class="col-md-12">
          <EqtlTableDescription/>
        </div>
      </div>
    </div>
    <!-- eQTL tab end -->

  </div>
  <SNVTableAnnotationModal :showModal="showModal" :rowData="modalData" @closeModal="handleCloseModal"/>
</div>
</template>

<script>

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faWindowRestore, faDownload, faColumns }
  from '@fortawesome/free-solid-svg-icons'
import clone from 'just-clone'
import axios from "axios";
import RegionInfo      from '@/components/infoblock/RegionInfo.vue'
import RegionSummaries from '@/components/summary/RegionSummaries.vue'
import FilterBar       from '@/components/FilterBar.vue'
import ToggleList      from '@/components/ToggleList.vue'
import SeqDepth        from '@/components/SeqDepth.vue'
import GeneSegments    from '@/components/GeneSegments.vue'
import RegionSnvCount  from '@/components/histogram/RegionSnvCount.vue'
import BpCoordBar      from '@/components/BpCoordBar.vue'
import RegionSNVTable  from '@/components/table/RegionSNVTable.vue'
import EqtlCount       from '@/components/histogram/EqtlCount.vue'
import SNVTableAnnotationModal   from '@/components/table/SNVTableAnnotationModal.vue'
import EqtlTableDescription      from '@/components/table/EqtlTableDescription.vue'
import RegionEqtlTable from '@/components/table/RegionEqtlTable.vue'
import RegionEqtlSummaries from '@/components/summary/RegionEqtlSummaries.vue'

export default {
  name: 'RegionDashboard',
  components: {
    FontAwesomeIcon,
    RegionInfo,
    RegionSummaries,
    FilterBar,
    ToggleList,
    SeqDepth,
    GeneSegments,
    RegionSnvCount,
    BpCoordBar,
    RegionSNVTable,
    EqtlCount,
    SNVTableAnnotationModal,
    EqtlTableDescription,
    RegionEqtlTable,
    RegionEqtlSummaries
  },
  inject: {
    chrom: {default: null},
    start: {default: null},
    stop: {default: null},
    api: {default: ''}
  },
  data: function(){
    return {
      panelsIcon: faWindowRestore,
      columnsIcon: faColumns,
      downloadIcon: faDownload,
      doDownload: 0,

      showTab: {
        structvar: false,
        snv: true
      },

      showPanels: {
        summaries: {title: "Summary", val: true},
        seqDepth:  {title: "Avg. Depth", val: true},
        genes:     {title: "Genes", val: true},
        snvCount:  {title: "Variants Count", val: true},
      },
      showCols: {
        variantID:   { title: "Variant ID",    field: "variant_id",  val: true},
        rsID:        { title: "rsID",          field: "rsids",       val: true},
        consequence: { title: "Consequence",   field: "annotation.gene.hgvs",        val: true},
        annotation:  { title: "Annotation",    field: "annotation.gene.consequence", val: true},
        LOFTEE:      { title: "LOFTEE",        field: "annotation.gene.lof",         val: true},
        quality:     { title: "Quality",       field: "filter",      val: true},
        CADD:        { title: "CADD",          field: "cadd_phred",  val: true},
        nAlleles:    { title: "N Alleles",     field: "allele_num",  val: false},
        het:         { title: "Het",           field: "het_count",   val: true},
        hom:         { title: "Hom",           field: "hom_count",   val: true},
        frequency:   { title: "Frequency (%)", field: "allele_freq", val: true}
      },
      colVisChange: {column: null, visible: false},
      showTableMenuDropDown: false,
      showModal: false,
      modalData: {},

      // keys are category of filter,
      // values are array of mongo-like filters.
      filter: {},

      //formerly dimensions.margin
      // standard margins for child component calculations
      childMargins: {
        left:   40,
        right:  15,
        top:    12,
        bottom: 5
      },
      // genomic position of variant under the mouse in the table.
      hoveredVarPosition: null,

      // which variants are appearing in the variants table.
      visibleVariants: {
        start_index: null,
        stop_index: null,
        data: null
      },
      // genomic bounds for child elements in base pairs
      //formergly region.segments.region
      segmentRegions: [this.start, this.stop],
      eqtl_count: 0
    }
  },
  computed: {
    filterArray: function() {
      return(Object.values(this.filter).flat(1))
    },
    positionResolved: function() {
      return( this.chrom && this.start && this.stop )
    },
  },
  methods: {
    load_eqtl_count: function(ensembl_id){
      axios
      .get(`${this.api}/eqtl/region_count`, {params: {chrom: this.chrom, start: this.start, stop: this.stop}})
        .then( resp => { this.eqtl_count = resp.data })
        .catch(error => { console.log("Error loading region count:" + error) })
    },
    handleOpenModal: function(rowData){
      this.modalData = rowData
      this.showModal = true
    },
    handleCloseModal: function(){
      this.showModal = false }
    ,
    handleGeneBarClick: function(evt){
      console.log("geneClick")
      console.log("gene.html?id="+evt.target.__data__.gene_name)
      window.location.href="gene.html?id="+evt.target.__data__.gene_name
    },
    togglePanelAttr: function(attrName) {
      this[attrName] = !this[attrName]
      this.showMenuDropDown = !this.showMenuDropDown
    },
    toggleColAttr: function(attrName) {
      this[attrName] = !this[attrName]
      this.showTableMenuDropDown = !this.showTableMenuDropDown
    },
    toggleTab: function(tabName) {
      this.showTab.snv = false
      this.showTab.structvar = false
      this.showTab.eqtl = false
      this.showTab[tabName] = true
    },
    tabClass: function(isActive) {
      return isActive ? 'nav-link active' : 'nav-link'
    },
    onOffStyle: function(boolVar){
      return boolVar ? 'display: inline;' : 'display: inline; visibility: hidden;'
    },
    handleFilterChange: function(filterCategory, filtArr){
      // Handle API's region specific names for annotation and loftee
      if(filterCategory === 'annotation'){
        filtArr.forEach( e => e.field = 'annotation.region.consequence')
      }
      if(filterCategory === 'loftee'){
        filtArr.forEach( e => e.field = 'annotation.region.lof')
      }

      this.filter[filterCategory] = filtArr
    },
    handleInfoViewToggle: function(listGroup, varKey){
      this[listGroup][varKey].val = !this[listGroup][varKey].val
    },
    handleColumnVisToggle: function(listGroup, varKey){
      this.handleInfoViewToggle(listGroup, varKey)
      this.colVisChange = {column: this[listGroup][varKey].field,
                           visible: this[listGroup][varKey].val}
    },
    handleTableScroll: function(start_idx, end_idx, rows_data){
      this.visibleVariants = {
        start_index: start_idx,
        stop_index: end_idx,
        data: rows_data}
    },
    handleTableHover: function(idx, data, hovered){
      this.hoveredVarPosition = data.pos
    },
  },
  beforeMount: function() {
    // Respect links to specific tab
    if(window.location.hash === "#eqtl"){ this.toggleTab("eqtl") }
  },
  mounted: function() {
    this.load_eqtl_count()
  },
  beforeUnmount: function() {
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>
