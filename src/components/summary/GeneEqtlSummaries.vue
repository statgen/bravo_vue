<script>
import BaseEqtlSummaries from '@/components/summary/BaseEqtlSummaries.vue'

export default {
  name: "GeneEqtlSummaries",
  extends: BaseEqtlSummaries,
  inject: {
    ensemblId: {default: null},
  },
  methods: {
  },
  computed: {
    ajaxUrl() { return `${this.api}/eqtl/ensembl_tissue_count` },
    ajaxParams() { return {ensembl: this.ensemblId} },
    ready_to_load() { return this.ensemblId !== null }
  },
  watch: {
    ensemblId: function() {
      // Handles the case where the ensemblId was not available at mount time.
      this.load()
    }
  }
}
</script>
