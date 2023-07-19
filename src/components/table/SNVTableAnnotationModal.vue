<template>
  <Teleport to="body">
    <div v-if="showModal" class="modal" id="modalAnnotations" role="dialog" style="z-index:99999;">
      <div class="modal-dialog modal-dialog-centered modal-sm" role="document">
         <div class="modal-content">
           <div class="modal-header">
             <div class="modal__titlebox">
               <h5 class="modal-title">{{ title }}</h5>
             </div>
             <button  @click="$emit('closeModal')" class="close" aria-label="Close">
               <span aria-hidden="true">&times;</span>
             </button>
           </div>
            <div class="modal-body">
              <CAccordion :flush="true">
                <div v-for="(txs, conseq) in consequences" :key="conseq">
                <CAccordionItem :item-key="conseq">
                  <CAccordionHeader :flush="true">
                    <span :class="badge_class(conseq)">&#9632;</span>
                    <span>{{snvConsequences.lookup(conseq).title}}</span>
                  </CAccordionHeader>
                  <CAccordionBody>
                    <ul class="list-unstyled">
                      <li v-for="transcript in txs">
                        <li><span>{{ transcript.name }}</span></li>
                        <ul>
                          <li><span style="color: #85144b;">{{ transcript.biotype }}</span></li>
                          <li v-if="transcript.HGVSc">HGVSc: <b>{{ transcript.HGVSc }}</b></li>
                          <li v-if="transcript.HGVSp">HGVSp: <b>{{ transcript.HGVSp}}</b></li>
                        </ul>
                      </li>
                    </ul>
                  </CAccordionBody>
                </CAccordionItem>
              </div>
              </CAccordion>
            </div>
            <div class="modal-footer">
              <button @click="$emit('closeModal')" class="btn btn-sm btn-primary">Close</button>
            </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import snvConsequences from '@/domainModel/snvConsequences'
import { CAccordion, CAccordionItem, CAccordionBody, CAccordionHeader } from '@coreui/vue'

export default {
  name: "SNVTableModalAnnotation",
  components: {
    CAccordion,
    CAccordionItem,
    CAccordionBody,
    CAccordionHeader
  },
  props: {
    showModal: {
      type: Boolean,
      default: function() {return false}
    },
    rowData: {
      type: Object,
      default: function() {return {}}
    },
  },
  emits: ['closeModal'],
  computed:{
    title() { return this.rowData.variant_id },
    consequences() {return this.distillConsequences(this.rowData)}
  },
  created: function() {
    // Hack to make imported constant available to template
    this.snvConsequences = snvConsequences
  },
  methods: {
    badge_class: function(consequenceKey) {
      return('badge badge-light ' + 'badge--' + consequenceKey)
    },
    fillConseqTrxMap: function(geneArr, uniqConseqs){
      // Get unique consequences
      let conseqNames = geneArr.reduce((acc, g) => acc.concat(g.consequence), [])

      // Use uniq Consequences as keys in the consequences-transcripts dict 
      let conseqs = {}
      uniqConseqs.forEach((c) => {conseqs[c] = []})
      
      // Stuff copy of transcript of each gene into appropriate consequence bins.
      geneArr.forEach( (gene) => {
        gene.transcripts.forEach( (trx) => {
          let trxCpy = Object.assign({}, trx)
          delete trxCpy.consequence
          delete trxCpy._consequence
          trx.consequence.forEach((c) => { conseqs[c].push(trxCpy) })
        })
      })

      return conseqs
    },
    distillConsequences: function(rowData) {
      // Handle difference between region and gene snv data
      let geneArr = rowData.annotation?.genes || new Array(rowData?.annotation?.gene)
      let uniqConseqs = rowData.annotation?.gene?.consequence || rowData.annotation?.region?.consequence

      let conseqTrxMap = this.fillConseqTrxMap(geneArr, uniqConseqs)

      // Handle regulaory_region consequence if present
      let regKey = Object.keys(conseqTrxMap)
        .find(ele => /regulatory_region/.test(ele))
      if(regKey && rowData.annotation?.regulatory){
        conseqTrxMap[regKey] = conseqTrxMap[regKey].concat(rowData.annotation.regulatory)
      }

      return(conseqTrxMap)
    },
    geneRowToConsequences: function(rowData) {
      // initialize consequences from gene annotation
      let conseqs = {}
      rowData.annotation.gene.consequence.forEach((c) => {conseqs[c] = []})

      // push copy of transcript data into each consequence lists it belongs to
      rowData.annotation.gene.transcripts.forEach((trx) => {
        let trxCpy = Object.assign({}, trx)
        delete trxCpy.consequence
        trx.consequence.forEach((c) => { conseqs[c].push(trxCpy) })
      })

      return conseqs
    }
  }
}
</script>
