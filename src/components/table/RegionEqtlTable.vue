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
  methods: {
    tblColumnDefs: function(){

      let phenoCol = {
        title: "Phenotype Id",
        titleDownload: "Phenotype Id",
        headerTooltip: "affected phenotype",
        minWidth: 130,
        widthGrow: 1,
        field: "phenotype_id",
        formatter: (cell) => { return `<a href='gene.html?id=${cell.getValue()}'>${cell.getValue()}</a>`; }
        }

      let baseCols = this.baseColumnDefs()
      baseCols.push(phenoCol)

      return baseCols
    },
  }
}
</script>
