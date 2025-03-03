<script>
import BaseEqtlSummaries from '@/components/summary/BaseEqtlSummaries.vue'

export default {
  name: "GeneEqtlSummaries",
  extends: BaseEqtlSummaries,
  inject: {
    /* The override to inject appropriate provided data */
    ensemblId: {default: 0},
  },
  computed: {
    /* Needs to be overridden by the extending component */
    ajaxUrl() { return `${this.api}/eqtl/gene_tissue_count` },
    ajaxParams() {return {ensemblId: this.ensemblId} }
  },
}
</script>
