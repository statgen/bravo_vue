<script>
import BaseEqtlSummaries from '@/components/summary/BaseEqtlSummaries.vue'

export default {
  name: "RegionEqtlSummaries",
  extends: BaseEqtlSummaries,
  inject: {
    /* The override to inject appropriate provided data */
    chrom: {default: 0},
    start: {default: 0},
    stop: {default: 1}
  },
  computed: {
    /* Needs to be overridden by the extending component */
    ajaxUrl() { return `${this.api}/eqtl/region_tissue_count` },
    ajaxParams() {return {chrom: this.chrom, start: this.start, stop: this.stop} }
  },
}
</script>
