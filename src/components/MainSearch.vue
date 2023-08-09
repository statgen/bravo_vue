<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-10 col-sm-8 col-md-6">
        <div class="m-3 m-md-5 text-center">
          <img class="bo-big-logo" v-bind:src="logo" width="200"/>
          <template v-if="subtitle">
            <h5>{{ subtitle }}</h5>
            <template v-if="subtitle2">
              <small class="text-muted">{{ subtitle2 }}</small>
            </template>
          </template>
          <hr class="margin-centered" width="25%">
        </div>
      </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-10 col-sm-8 col-md-6">
        <div id="search-box">
          <SearchBox :autofocus="true" v-on:noSearchResults="handleNoResults"></SearchBox>
        </div>
      </div>
    </div>
    <div class="row justify-content-center mt-3">
      <div class="col-10 col-sm-8 col-md-6">
        <p class="text-center text-muted">
          <template  v-for="(value, name) in exampleLinks" v-bind:key="name">
            <a v-bind:href="publicPath + value">{{ name }}</a>{{', '}}
          </template>
        </p>
      </div>
    </div>
    <div class="row justify-content-center mt-3">
        <p class="text-center text-muted">
          {{message}}
        </p>
    </div>
  </div>
</template>

<script>
import logo from "../assets/bravo_title_logo.svg"
import SearchBox from '@/components/SearchBox.vue'

export default {
  name: 'MainSearch',
  components: { SearchBox },
  inject: {
    'subtitle': {default: ''},
    'subtitle2': {default: ''}
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      version: process.env.VUE_APP_VERSION,
      logo: logo,
      message: null,
      exampleLinks: {
        'HBB': 'gene.html?id=HBB',
        '11:5225000-5229000': 'region.html?chrom=11&start=5225000&stop=5229000',
        '22-16389447-A-G': 'variant.html?id=22-16389447-A-G',
        'rs193922562': 'variant.html?id=rs193922562'
      }
    }
  },
  methods: {
    handleNoResults(evtVal){
      this.message = "No search results for " + evtVal
    }
  }
}
</script>
