<script>
import BaseSNVTable from '@/components/table/BaseSNVTable.vue'
import lofCategories from '@/domainModel/lofCategories'
import snvConsequences from '@/domainModel/snvConsequences'

export default {
  name: "GeneSNVTable",
  extends: BaseSNVTable,
  inject: {
    geneId: {default: ''},
    ensemblId: {default: ''}
  },
  data: function(){
    return {
      // geneId injected from ancestor component
      downloadFileName: `variants_${this.geneId}.csv`
    }
  },
  emits: ['openModal'],
  computed: {
    // define url to get data appropriate for region snv table
    ajaxUrl() {
      return(`${this.api}/variants/gene/snv/${this.ensemblId}`)
    }
  },
  methods: {
    // add region implementation for consequence, annotation, and loftee
    tblColumnDefs: function(){
      let consequenceCol =  {
        title: "Consequence",
        titleDownload: "Consequence",
        field: "annotation.gene.hgvs",
        headerTooltip: "HGVSc/HGVSp nomenclature for the most severe variant effect (total number of HGVSc/HGVSp).",
        hozAlign: "left",
        headerSort: false,
        width: 150,
        minWidth: 100,
        visible: this.showCols.consequence,
        formatter: (cell, params, onrendered) => {
          let html = ""
          if ((cell.getValue() != undefined) && (cell.getValue().length > 0)) {
            html += '<div class="snvtable__cell--clickable" role="button">'
            html += cell.getValue()[0] + " (" + cell.getValue().length + ")"
            html += "</div>"
          }
          return html
        },
        cellClick: (e, cell) => {
          this.$emit("openModal", cell._cell.row.data)
        },
        accessorDownload: (value) => {
          if (value != null) {
            return value.join(';')
          } else {
            return ""
          }
        }
      }

      let annoCol =  {
        title: "Annotation",
        titleDownload: "Annotation",
        field: "annotation.gene.consequence",
        headerTooltip: "Variant annotation (defined by Sequence Onthology) with most severe effect (total number of annotations).",
        hozAlign: "left",
        width: 125,
        minWidth: 120,
        visible: this.showCols.annotation,
        formatter: (cell, params, onrendered) => {
          let html = ""
          let annotations = cell.getValue()
          if (annotations.length > 0) {
            let title = snvConsequences.lookup(annotations[0]).title
            let cssClass = `badge--${annotations[0]}`
            html += `<div class="snvtable__cell--clickable" role="button">`
            html += `<span class="badge badge-light clickable ${cssClass}" style="">${title} </span>`
            html += `<span>(${annotations.length})</span>`
            html += `</div>`
          }
          return html
        },
        cellClick: (e, cell) => {
          this.$emit('openModal', cell._cell.row.data)
        },
        accessorDownload: (value) => {
          if (value != null) {
            return value.join(';')
          } else {
            return ""
          }
        }
      }

      let lofteeCol = {
        title: "LOFTEE",
        titleDownload: "LOFTEE",
        headerTooltip: "Variant was predicted to be Loss-of-Function by LOFTEE.",
        field: "annotation.gene.lof",
        hozAlign: "left",
        width: 100,
        minWidth: 95,
        visible: this.showCols.LOFTEE.val,
        formatter: (cell, params, onrendered) => {
          let html = ""
          if (cell.getValue() != undefined) {
              cell.getValue().forEach(v => {
                let badge_type = v == "HC" ? "success" : "warning"
                let title = lofCategories[v].title
                html += `<span class="badge badge-${badge_type}" style="margin-right:1px">${title}</span>`
              });
          }
          return html;
        },
        accessorDownload: (value) => {
          if (value != null) {
            return value.join(';')
          } else {
            return ""
          }
        }
      }

      // Insert region specific columns into base columns
      let baseCols = this.baseColumnDefs()
      baseCols.splice(2, 0, consequenceCol, annoCol, lofteeCol)

      return baseCols
    },
  }
}
</script>
