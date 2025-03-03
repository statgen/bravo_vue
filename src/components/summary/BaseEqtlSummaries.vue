<template>
  <div class="child-component">
    <NumericSummaryCard title="Tissue" numericLabel="eQTL Count" :state="loadingState" :summaryData="tissueSummary"/>
  </div>
</template>

<script>
import axios from "axios";
import NumericSummaryCard from '@/components/summary/NumericSummaryCard.vue'

export default {
  name: "BaseEqtlSummaries",
  components: {
    NumericSummaryCard
  },
  inject: {
    api: {default: ''},
    /* May need additional injects by the extending component */
  },
  computed: {
    /* Needs to be overridden by the extending component */
    ajaxUrl() { return `${this.api}/example` },
    ajaxParams() {return {param1: "foo"} }
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
        .get(this.ajaxUrl, 
          {params: this.ajaxParams})
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
