<template>
  <div class="child-component">
    <NumericSummaryCard title="Tissue" numericLabel="Credible Set Count" :state="loadingState" :summaryData="tissueSummary"/>
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
  },
  computed: {
    /* Needs to be overridden by the extending component */
    ajaxUrl() { return `${this.api}/example` },
    ajaxParams() {return null},
    /* Simple locking function that can be overridden by extending component
         in order to prevent loading when ajax parameters haven't been resolved. */
    ready_to_load() { return true },
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
      if(this.ready_to_load === false){ return }
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
