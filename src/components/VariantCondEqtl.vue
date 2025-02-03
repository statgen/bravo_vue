<template>
  <div class="info-card-medium--scrolling">
    <div class="row">
      <div class="col-12">
        <h5>Conditional eQTL</h5>
      </div>
    </div>
    <div v-if="eqtl.length > 0">
      <div class="row">
        <span class="col-sm-3 text-left text-truncate">Tissue</span>
        <span class="col-sm-4 text-left text-truncate">Transcript</span>
        <span class="col-sm-3 text-right">P-value beta</span>
        <span class="col-sm-2 text-right">Slope</span>
      </div>
      <!-- dummy testing rows -->
      <div class ="row" v-for="item in eqtl">
        <span class="col-sm-3 text-left text-truncate">{{item.tissue}}</span>
        <span class="col-sm-4 text-left text-truncate">{{item.phenotype_id}}</span>
        <span class="col-sm-3 text-right">{{item.pval_beta}}</span>
        <span class="col-sm-2 text-right">{{trucDecimal(item.slope)}}</span>
      </div>
    </div>
    <div v-else class="infocard__no-data-notice">
      <span>No conditional eQTL data.</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantCondEqtl',
  props: ['eqtl'],
  methods: {
    //https://stackoverflow.com/a/9232092
    trucDecimal: function(x, digits=4){
      let magnitude = Math.pow(10, digits)
      let shifted = x * magnitude
      let truncated = Math[shifted < 0 ? 'ceil' : 'floor'](shifted)
      return truncated / magnitude
    }
  },
}
</script>
