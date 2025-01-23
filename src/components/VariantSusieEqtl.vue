<template>
  <div class="card shadow-sm" style="min-width: 300px">
    <div class="card-body">
      <div class="row">
        <div class="col-12">
          <h5>SuSie eQTL</h5>
        </div>
      </div>
      <div class="row">
        <div class="col-5 col-sm-7 text-left text-truncate">Susie Measure</div>
        <div class="col-7 col-sm-5 text-right">Value</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantSusieEqtl',
  props: ['eqtl'],
  data: function(){
    return { }
  },
}
</script>
