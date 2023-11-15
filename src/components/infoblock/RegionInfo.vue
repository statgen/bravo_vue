<template>
  <div class="child-component">
    <h1 class="display-5">{{regionTitle}}</h1>
    <ul class="list-unstyled">
      <li class="list-item">Region length: {{regionLength.toLocaleString()}} bp</li>
      <li class="list-item">External resources: 
        <span><a v-bind:href="extUrl">UCSC Browser</a></span>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: "RegionInfo",
    inject: {
      chrom: {default: 0},
      start: {default: 0},
      stop: {default: 1}
    },
    computed: {
      regionLength() { 
        return ((this.stop - this.start + 1).toLocaleString())
      },
      regionTitle() { 
        return (this.chrom + ':' + this.start.toLocaleString() + 
          '-' + this.stop.toLocaleString()) 
      },
      extUrl() { 
        return ('https://genome.ucsc.edu/cgi-bin/hgTracks?db=GRCh38&position=' + 
          this.chrom + ':' + this.start + '-' + this.stop)
      }
    },
  }
</script>
