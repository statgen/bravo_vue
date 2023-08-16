<template>
  <div class="child-component">
    <h1 class="display-5"><i>{{geneData.gene_name}}</i></h1>
    <h6>{{geneData.full_gene_name}}</h6>
    <ul class="list-unstyled">
      <li class="list-item">
        Ensembl ID: <a v-bind:href="ensemblUrl">{{geneData.gene_id}}</a>
      </li>
      <li class="list-item">
        Gene type: <span style="color:#85144b;">{{geneData.gene_type}}</span>
      </li>
      <li class="list-item">
        Region: <a :href="bravoRegionUrl">{{chrom}}:{{start.toLocaleString()}}-{{stop.toLocaleString()}}</a></li>
      <li class="list-item">Total length: {{regionLength.toLocaleString()}} bp</li>
      <li class="list-item">Exonic length: {{exonicLength.toLocaleString()}} bp</li>
      <li class="list-item">External resources:
        <span><a v-bind:href="phewebUrl">UK Biobank PheWeb</a></span>
        <span>, <a v-bind:href="omimUrl">OMIM</a></span>
        <span>, <a v-bind:href="geneCardUrl">GeneCards</a></span>
        <span>, <a v-bind:href="ucscUrl">UCSC Browser</a></span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "GeneInfo",
  inject: {
    chrom: {default: 0},
    start: {default: 0},
    stop: {default: 1},
  },
  props: {
    geneData: {
      type: Object,
      default: function() {
        return {
          full_gene_name: "",
          gene_name: "",
          gene_type: "",
          gene_id: "",
          omim_accession: "",
          coding_regions: [],
        }
      }
    },
  },
  methods: {
    exonicAccumulator: function(acc, region){
      return(acc + (region[1] - region[0]) + 1)
    }
  },
  computed: {
    exonicLength() {
      if(this.geneData.coding_regions === undefined){return(0)}
      return( this.geneData.coding_regions.reduce( this.exonicAccumulator, 0) )
    },
    regionLength() {
      return ((this.stop - this.start + 1))
    },
    bravoRegionUrl(){
      return(`/region.html?variant_type=snv&chrom=${this.chrom}&start=${this.start}&stop=${this.stop}`)
    },
    ucscUrl() {
      return ('https://genome.ucsc.edu/cgi-bin/hgTracks?db=GRCh38&position=' +
        this.chrom + ':' + this.start + '-' + this.stop)
    },
    geneCardUrl() {
      return('https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + this.geneData.gene_id)
    },
    phewebUrl() {
      return('http://pheweb.sph.umich.edu/SAIGE-UKB/gene/' + this.geneData.gene_name)
    },
    omimUrl() {
      return('https://omim.org/entry/' + this.geneData.omim_accession)
    },
    ensemblUrl() {
      return('http://www.ensembl.org/Homo_sapiens/geneview?gene=' + this.geneData.gene_id)
    },
  },
}
</script>
