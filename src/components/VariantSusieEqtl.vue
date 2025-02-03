<template>
  <div class="info-card-medium--scrolling">
    <div class="row">
      <div class="col-12">
        <h5>SuSie eQTL</h5>
      </div>
    </div>
    <div v-if="eqtl.length > 0">
      <div class="row">
        <span class="col-sm-3 text-left text-truncate">Tissue</span>
        <span class="col-sm-4 text-left text-truncate">Transcript</span>
        <span class="col-sm-3 text-right">PIP</span>
        <span class="col-sm-2 text-right">CS_ID</span>
      </div>
      <!-- dummy testing rows -->
      <div class ="row" v-for="item in eqtl">
        <span class="col-sm-3 text-left text-truncate">{{item.tissue}}</span>
        <span class="col-sm-4 text-left text-truncate">{{item.phenotype_id}}</span>
        <span class="col-sm-3 text-right">{{item.pip}}</span>
        <span class="col-sm-2 text-right">{{item.cs_id}}</span>
      </div>
    </div>
    <div v-else class="infocard__no-data-notice">
      <span>No SuSiE eQTL data.</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantSusieEqtl',
  props: ['eqtl'],
}
</script>
