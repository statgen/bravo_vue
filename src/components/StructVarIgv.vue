<template>
  <div ref="igvDiv" class="child-component">
  </div>
</template>

<script setup>
import {inject, onMounted, onUnmounted, ref, watch} from 'vue'
import axios from "axios"
import igv from "igv/dist/igv.esm.min.js" 
axios.defaults.withCredentials=true

/* Injects */
const api = inject('api')
const region_start = inject('start')
const region_end   = inject('stop')
const chrom = inject('chrom')

/* Props */
const props = defineProps({svId: String})

/* Component vars */
const igvDiv = ref(null)
let igvBrowser = null
let currTrackName = ""

/* Component methods */
watch( () => props.svId, handle_sv_id_change, {immediate: false})

function handle_sv_id_change() {
  if(currTrackName === props.svId){ return }
  // Remove existing track
  igvBrowser.removeTrackByName(currTrackName)
  // Record selected structural variant Id as the current track.
  currTrackName = props.svId

  let crai_url = `${api}/sv/crai?svid=${props.svId}`
  let cram_url = `${api}/sv/cram?svid=${props.svId}`
  //debug
  let cramfile = "file:///mnt/bravo/data/runtime/structvar/crams/chr11_selected_p023.cram"
  let craifile = "file:///mnt/bravo/data/runtime/structvar/crams/chr11_selected_p023.cram.crai"
  let cram_local = "http://localhost/crams/chr11_selected_p023.cram"
  let crai_local = "http://localhost/crams/chr11_selected_p023.cram.crai"
  console.log(crai_url)
  console.log(cram_url)

  igvBrowser.loadTrack({
    type: "alignment",
    format: "cram",
    name: props.svId,
    colorBy: "strand",
    url: cram_url,
    indexURL: crai_url,
    indexed: true,
    withCredentials: true,
    showCoverage: false
  });
}

/* Lifecycle hooks */
onMounted(() => {
  console.log("debug: SV IGV")

  const igvConfig = {
      reference: {
        fastaURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa",
        indexURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/hg38/hg38.fa.fai",
        cytobandURL: "https://s3.amazonaws.com/igv.org.genomes/hg38/annotations/cytoBandIdeo.txt.gz",
        samplingDepth: 2
      },
    flanking: 100,
    locus: `${chrom}:${region_start}-${region_end}`,
    loadDefaultGenomes: false,
    showAllChromosomes: false,
    showChromosomeWidget: false,
    genomeList: []
  }
  igvBrowser = igv.createBrowser(igvDiv.value, igvConfig).then( browser => igvBrowser = browser)
})

onUnmounted(() => {
  igv.removeBrowser(igvBrowser)
})

</script>
