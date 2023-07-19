<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="container-fluid">
        <div class="row">
          <div class="col-sm-12">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th scope="col" style="border-top:none;">Variant effect</th>
                    <th scope="col" style="border-top:none;">LOFTEE</th>
                    <th scope="col" style="border-top:none;">HGVS description</th>
                    <th scope="col" style="border-top:none;">Gene</th>
                    <th scope="col" style="border-top:none;">Transcript</th>
                    <th scope="col" style="border-top:none;">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="consequence in consequences" :key="consequence.transcript">
                    <td>
                      <span v-for="effect in consequence.effects" :key="effect" 
                        :class="effectBadge(effect)" style="'margin-right': '1px'">
                        {{ snvConsequences.lookup(effect).title }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="lofBadge(consequence.lof)">
                        {{ consequence.lof }}
                    </span>
                    </td>
                    <td>
                      <span v-for="hgvs in consequence.hgvs" :key="hgvs" style="margin-right:5px">{{ hgvs }}</span>
                    </td>
                    <td>
                      <a :href="`/gene.html?id=${consequence.gene}`" class="text-info">
                        {{ consequence.gene }} <span v-if="consequence.gene_other_name">(<i>{{ consequence.gene_other_name }}</i>)</span>
                      </a>
                    </td>
                    <td>{{ consequence.transcript }}</td>
                    <td><span class="badge">{{ consequence.biotype }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lofCategories from '@/domainModel/lofCategories'
import snvConsequences from '@/domainModel/snvConsequences'

export default {
  name: 'VariantConsequences',
  props: ['variant'],
  created: function() {
    // Hack to make imported constant available to template
    this.snvConsequences = snvConsequences
  },
  methods:{
    effectBadge: function(consequenceKey) {
      return('badge badge-light ' + 'badge--' + consequenceKey)
    },
    lofBadge: function(lof){
      if(lof == lofCategories['HC'].title){
        return('badge-success')
      }else if(lof == lofCategories['LC'].title){ 
        return('badge-warning')  
      }
      return('') 
    }
  },
  computed: {
    consequences: function() {
      let consequences = [];
      this.variant.annotation.genes.forEach( gene => {
        gene.transcripts.forEach( transcript => {
          let effects = []
          transcript.consequence.forEach(e => { effects.push(e) })

          let lof = null;
          if ("lof" in transcript) {
            lof = lofCategories[transcript.lof].title
          }

          let hgvs = []
          if ('HGVSp' in transcript) { hgvs.push(transcript.HGVSp); }
          if ('HGVSc' in transcript) { hgvs.push(transcript.HGVSc); }

          consequences.push({
            gene: gene.name,
            gene_other_name: gene.other_name,
            transcript: transcript.name,
            biotype: transcript.biotype.replace("_", " "),
            hgvs: hgvs,
            effects: effects,
            lof:  lof
          })
        })
      })
      return consequences
    }
  }
}
</script>
