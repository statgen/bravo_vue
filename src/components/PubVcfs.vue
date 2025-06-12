<template>
<div class="child-component">
  <h1>Public VCFs</h1>
  <div v-if="showVcfs">
    Public VCFs derived from the BRAVO backing data are subsets that provide the allele counts and allele frequencies for variants.
    <ul class="list-group">
      <li v-for="vcf in vcfLinks"  :id="'btn-' + vcf" :ref="'btn-' + vcf" class="list-group-item">
        <button type="button" class="btn btn-outline-primary btn-sm" @click="getVcf(vcf.chrom)"
                :style="{visibility: vcf.url ? 'hidden' : 'visible'}">
          Generate {{vcf.chrom}} link
        </button>
        <a :href="vcf.url" :style="{visibility: vcf.visibility}">{{vcf.chrom}} gzipped vcf</a>
      </li>
    </ul>
  </div>
  <div v-else-if="!loginDisabled">
    Public VCFs providing allele counts and frequencies are available to logged in users who have agreed to <a href="terms.html">BRAVO's terms of service.</a>
  </div>
</div>
</template>

<script>
import axios from "axios";
axios.defaults.withCredentials=true

export default {
  name: "PubVcfs",
  inject: {
    api: {default: ''},
    user: {default: ''},
    loginDisabled: {default: false},
    agreedToTerms: {default: false}
  },
  data: function() {
    return {
      availableVcfs: [],
      vcfLinks: {},
    }
  },
  computed: {
    showVcfs: function(){ return this.loginDisabled || (this.user && this.agreedToTerms) }
  },
  methods: {
    load: function(){
      axios.get(`${this.api}/available`)
        .then( response => {
          this.availableVcfs = response.data

          let chrom
          for(let i=0; i<response.data.length; i++){
            chrom = response.data[i]
            this.vcfLinks[chrom] = {chrom: chrom, visibility: "hidden", url: ""}
          }
        })
    },
    getVcf: function(chrom){
      axios({
        method: "get",
        url: `${this.api}/link`,
        params: {chrom: chrom}
      }).then( response => {
        this.vcfLinks[chrom].url = response.data.url 
        this.vcfLinks[chrom].visibility = "visible" 
      })
    }
  },
  mounted: function() {
    if(this.user){ this.load() }
  },
}

</script>
