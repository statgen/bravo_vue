<template>
  <div class="child-component">
    <NumericSummaryCard title="Tissue" numericLabel="eQTL Count" :state="loadingState" :summaryData="tissueSummary"/>
  </div>
</template>

<script>
import axios from "axios";
import NumericSummaryCard from '@/components/summary/NumericSummaryCard.vue'

export default {
  name: "RegionEqtlSummaries",
  components: {
    NumericSummaryCard
  },
  inject: {
    api: {default: ''},
    chrom: {default: 0},
    start: {default: 0},
    stop: {default: 1}
  },
  data: function() {
    return {
      //states: loading, loaded, failed
      loadingState: "loading",
      tissueSummary: {}
    }
  },
  methods: {
    load: function() {
      console.log("loading eqtl tissue summary")
      axios
        .get(`${this.api}/eqtl/region_tissue_count`, 
          {params: {chrom: this.chrom, start: this.start, stop: this.stop}})
        .then( resp => { 
          this.tissueSummary = resp.data 
          this.loadingState = "loaded"
        })
        .catch(error => { 
          console.log("Error loading region tissue count:" + error) 
          this.loadingState = "failed"
        })

    }
  },
  mounted: function() {
    this.load()
  }
}
</script>
