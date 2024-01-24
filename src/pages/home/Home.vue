<template>
  <NavBar style="margin-left: 5px;"/>
  <MainSearch/>
  <NewsBox/>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import MainSearch from '@/components/MainSearch.vue'
import NewsBox from '@/components/NewsBox.vue'

export default {
  name: 'App',
  components: {
    MainSearch,
    NavBar,
    NewsBox
  },
  provide:{
    subtitle: process.env.VUE_APP_SUBTITLE,
    subtitle2: process.env.VUE_APP_SUBTITLE2,
  }
}
</script>
