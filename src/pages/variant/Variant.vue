<template>
  <NavBar style="margin-left: 5px;">
    <SearchBox :autofocus="false"/>
  </NavBar>

  <div id="variantviz">
    <div v-if="this.ready && this.has_data">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <h1>{{ this.variant.variant_id }}</h1>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-md-6 mt-3">
            <VariantBasicInfo :variant="this.variant"/>
          </div>

          <div class="col-12 col-md-6 mt-3">
            <VariantCounts :variant="this.variant"/>
          </div>
        </div>

        <div class="row">
          <div v-for="ds in this.variant.pub_freq" class="col-12 col-md-6 mt-3">
            <VariantFrequency :ds="ds"/>
          </div>
        </div>

        <div class="row">
          <div class="col-12 col-md-6 mt-3">
            <VariantSusieEqtl :eqtl="this.eqtl_susie"/>
          </div>
        </div>

        <div class="row">
          <div class="col-12 mt-3">
            <VariantConsequences :variant="this.variant"/>
          </div>
        </div>


        <div class="row">
          <div class="col-md-4 mt-3">
            <VariantDepth :variant="this.variant"/>
          </div>
        </div>

        <div class="row">
          <div class="col-12 mt-3">
            <VariantMetrics :variant="this.variant"/>
          </div>
        </div>

        <div class="row">
          <div class="col-12 mt-3">
            <Reads :variant="this.variant"/>
          </div>
        </div>

      </div>
    </div>
    <div v-else-if="this.ready && !this.has_data">
      <div class="container">
        <div class="row">
          <div class="col-12 mt-3">
            <p>No variant data for {{ this.variantId }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import SearchBox from '@/components/SearchBox.vue'
import VariantBasicInfo from '@/components/VariantBasicInfo'
import VariantCounts from '@/components/VariantCounts'
import VariantFrequency from '@/components/VariantFrequency'
import VariantConsequences from '@/components/VariantConsequences'
import VariantDepth from '@/components/VariantDepth'
import VariantMetrics from '@/components/VariantMetrics'
import VariantSusieEqtl from '@/components/VariantSusieEqtl'
import Reads from '@/components/Reads'
import axios from 'axios'
import {inject} from 'vue'
axios.defaults.withCredentials=true

export default {
  name: 'App',
  components: {
    NavBar,
    SearchBox,
    VariantBasicInfo,
    VariantCounts,
    VariantFrequency,
    VariantConsequences,
    VariantDepth,
    VariantMetrics,
    VariantSusieEqtl,
    Reads
  },
  data: function() {
    return {
      api: inject('api'),
      variantId: null,
      ready: false,
      has_data: false,
      variant: {},
      eqtl_cond: {},
      eqtl_susie: {},
    }
  },
  methods : {
    loadEqtl: function() {
      axios({
        method: 'get',
        url: `${this.api}/eqtl/cond_by_id`,
        params: {cpra: this.variantId}
      }).then( response => {
        this.eqtl_cond = response.data.sort((lhs, rhs) => lhs.pval_beta - rhs.pval_beta)
      })

      axios({
        method: 'get',
        url: `${this.api}/eqtl/susie_by_id`,
        params: {cpra: this.variantId}
      }).then( response => {
        this.eqtl_susie = response.data.sort((lhs, rhs) => rhs.pip - lhs.pip)
      })
    },
    loadSnv: function() {
      axios
        .get(`${this.api}/variant/api/snv/${this.variantId}`)
        .then( response => {
          let payload = response.data

          if( payload.data[0] ){
            this.variant = payload.data[0]
            this.has_data = true
          }else{
            this.variant = {}
          }
          this.ready = true

          // provide default pub_freq
          if(!('pub_freq' in this.variant)){
            this.variant['pub_freq'] = []
          }

          // provide default 1000G data set
          if( !this.variant.pub_freq.some((x) => x.ds == '1000G')){
            this.variant.pub_freq.push({ds: '1000G'})
          }

          // provide default gnomAD data set
          if( !this.variant.pub_freq.some((x) => x.ds == 'gnomAD r2.1')){
            this.variant.pub_freq.push({ds: 'gnomAD r2.1'})
          }

        })
        .catch( error => {
          this.variant = {}
          console.log('variant data loading failed.');
        });
    }
  },
  created: function() {
    let urlParams = new URLSearchParams(window.location.search)
    let id = urlParams.get('id')
    if(id){
      this.variantId = urlParams.get('id')
    }else{
      let parts = [
        urlParams.get('chrom'), urlParams.get('pos'),
        urlParams.get('ref'), urlParams.get('alt')
      ]
      this.variantId = parts.join('-')
    }
  },
  mounted: function() {
    this.loadSnv();
    this.loadEqtl();
  }
}
</script>

<style>
</style>
