<template>
  <NavBar/>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <PubVcfs/>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import PubVcfs from '@/components/PubVcfs.vue'
import axios from 'axios'
import {inject} from 'vue'

export default {
  name: 'App',
  components: {NavBar, PubVcfs},
  data() {
    return {
      uiVersion: process.env.VUE_APP_VERSION,
      apiVersionURL: inject('api') + '/version',
      apiVersion: ""
    }
  },
  mounted: function() {
    axios.get(this.apiVersionURL)
      .then(resp => {
        this.apiVersion = resp.data.version
      })
  }
}
</script>
