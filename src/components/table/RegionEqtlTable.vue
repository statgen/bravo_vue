<script>
import BaseEqtlTable from '@/components/table/BaseEqtlTable.vue'

export default {
  name: "RegionEqtlTable",
  extends: BaseEqtlTable,
  inject: {
    /* The override to inject appropriate provided data */
    chrom: {default: ''},
    start: {default: ''},
    stop:  {default: ''},
  },
  computed: {
    /* The override to get data from appropriate endpoint */
    ajaxUrl() { return(`${this.api}/eqtl/region`) },
    ajaxParams(){
      return {chrom: this.chrom, 
              start: this.start, 
              stop: this.stop} 
    }
  },
}
</script>
