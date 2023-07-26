<template>
  <NavBar style="margin-left: 5px;">
    <SearchBox :autofocus="false"/>
  </NavBar>

  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-11 col-md-11">
        <RegionDashboard/>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import SearchBox from '@/components/SearchBox.vue'
import RegionDashboard from '@/components/RegionDashboard.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    SearchBox,
    RegionDashboard
  },
  provide: function() {
    let urlParams = new URLSearchParams(window.location.search)
    return {
      chrom: urlParams.get('chrom'),
      start: parseInt(urlParams.get('start')),
      stop: parseInt(urlParams.get('stop')),
    }
  }
}
</script>

<style>
.bravo-tab {
   display: flex;
   flex-direction: row;
}
.bravo-tab-item {
   padding-left: 15px;
   padding-right: 15px;
}
.bravo-tab-item a {
   color: black;
   text-decoration: none;
}
.bravo-tab-item-unselected a {
   color: #757575;
}
.bravo-tab-item-unselected a:hover {
   color: black;
}
.bravo-tab-item-selected a {
   color: #0b66fe;
}
.bravo-tab-item-selected {
   border-bottom: 3px solid #0b66fe;
}
</style>
