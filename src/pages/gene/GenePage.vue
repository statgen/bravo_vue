<template>
  <NavBar style="margin-left: 5px;">
    <SearchBox :autofocus="false"/>
  </NavBar>
  <GeneDashboard/>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import SearchBox from '@/components/SearchBox.vue'
import GeneDashboard from '@/components/GeneDashboard.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    SearchBox,
    GeneDashboard
  },

  data: function(){
    return {
      showDashboard: {
        snv:   true,
        eqtl:  false
      },
    }
  },
  provide: function() {
    let urlParams = new URLSearchParams(window.location.search)
    return {
      geneId: urlParams.get('id')
    }
  },
  methods: {
    displayTab: function(tabname){
    }
  }
}
</script>

