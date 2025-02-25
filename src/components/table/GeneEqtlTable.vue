<script>
import BaseEqtlTable from '@/components/table/BaseEqtlTable.vue'

export default {
  name: "GeneEqtlTable",
  extends: BaseEqtlTable,
  inject: {
    geneId: {default: ''},
  },
  computed: {
    /* The override to get data from appropriate endpoint */
    ajaxUrl() { return(`${this.api}/eqtl/susie`) },
    ajaxParams(){return{gene: this.geneId} }
  },
}
</script>
