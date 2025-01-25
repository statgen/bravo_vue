<template>
  <div class="card shadow-sm" style="min-width: 300px">
    <div class="card-body">
      <div class="row">
        <div class="col-12">
          <h5>Conditional eQTL</h5>
        </div>
      </div>
      <div class="row">
        <span class="col-sm-4 text-left text-truncate">Tissue</span>
        <span class="col-sm-4 text-left text-truncate">Phenotype</span>
        <span class="col-sm-4 text-right">PIP</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantCondEqtl',
  props: ['eqtl'],
  data: function(){
    return { }
  },
}
</script>
