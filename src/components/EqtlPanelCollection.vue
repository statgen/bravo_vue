<template>
  <div id="bravo-plot"> 
    <GeneInfo v-if="positionResolved" :geneData="geneData"/>
    <EqtlTable/>
  </div>
</template>

<script>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faWindowRestore, faDownload, faColumns } 
  from '@fortawesome/free-solid-svg-icons'
import GeneInfo from '@/components/infoblock/GeneInfo.vue'
import GeneSummary    from '@/components/summary/GeneSummary.vue'
import EqtlTable   from '@/components/table/EqtlTable.vue'

export default {
  name: 'EqtlPanelCollection',
  components: {
    FontAwesomeIcon,
    GeneInfo,
    GeneSummary,
    EqtlTable
  },
  inject: {
    geneId: {default: null},
    api: {default: ''}
  },
  provide: function() {
    return {
      // Wrap provided vals to make them reactive.
      ensemblId: computed( () => this.ensemblId),
    }
  },
  methods: {
    unwindGeneExons: function (gene) {
      gene.exons = [];
      gene.cds = [];
      gene.coding_regions = [];
      gene.features.sort((a, b) => a.start - b.start);
      gene.features.forEach(d => {
        if (d.feature_type == 'exon') {
          d.transcript_type = gene.transcripts.find(t => t.transcript_id == d.transcript_id).transcript_type;
          gene.exons.push(d);
        } else if (d.feature_type == 'CDS'){
          d.transcript_type = gene.transcripts.find(t => t.transcript_id == d.transcript_id).transcript_type;
          gene.cds.push(d);
        }
      });
      gene.exons.forEach(d => {
        if (gene.coding_regions.length == 0) {
          gene.coding_regions.push([d.start, d.stop]);
        } else {
          let last = gene.coding_regions[gene.coding_regions.length - 1];
          if (last[1] >= d.start) {
            if (last[1] < d.stop) {
              last[1] = d.stop;
            }
          } else {
            gene.coding_regions.push([d.start, d.stop]);
          }
        }
      });
    },
    loadGene: function() {
      axios
        .get(`${this.api}/genes/api/${this.geneId}`, {withCredentials: true})
        .then( response => {
          let payload = response.data
          if (payload.data.length > 0) {
            payload.data.forEach(d => {
              if ((d.gene_name === this.geneId) || (d.gene_id === this.geneId)) {
                // modify data in place
                this.unwindGeneExons(d);

                // set component data
                this.ensemblId = d.gene_id
                this.chrom = d.chrom
                this.start = d.start
                this.stop = d.stop
                this.geneData = d
                this.introns = true
              }
            })
          }
        })
    },

  }
}

</script>
