<script>
import { pick } from 'lodash'
import BaseBooleanFilterButton from '@/components/filter/BaseBooleanFilterButton.vue'
import snvConsequences from '@/domainModel/snvConsequences'

export default {
  name: "AnnotationFilterButton",
  extends: BaseBooleanFilterButton,
  data: function() {
    return ({
      // Override default fieldVal
      fieldVal: "annotation.consequence",

      // Define filter groups and members
      pFiltSet: {
        gSynVariants: {
          title: "All synonymous variants",
          members: pick(snvConsequences.info, [
            "start_retained_variant",
            "stop_retained_variant",
            "synonymous_variant"])
        },
        gNonSynVariants:{
          title: "All non-synonymous variants",
          members: pick(snvConsequences.info, [
            "stop_gained",
            "frameshift_variant",
            "stop_lost",
            "start_lost",
            "inframe_insertion",
            "inframe_deletion",
            "missense_variant" ])
        },
        allConseqs:{
          title: "Others",
          collapseable: true,
          members: pick(snvConsequences.info, [
              "3_prime_UTR_variant",
              "5_prime_UTR_variant",
              "NMD_transcript_variant",
              "TFBS_ablation",
              "TFBS_amplification",
              "TF_binding_site_variant",
              "coding_sequence_variant",
              "coding_transcript_variant",
              "downstream_gene_variant",
              "feature_elongation",
              "feature_truncation",
              "incomplete_terminal_codon_variant",
              "intergenic_variant",
              "intron_variant",
              "mature_miRNA_variant",
              "non_coding_transcript_exon_variant",
              "non_coding_transcript_variant",
              "protein_altering_variant",
              "regulatory_region_ablation",
              "regulatory_region_amplification",
              "regulatory_region_variant",
              "sequence_variant",
              "splice_acceptor_variant",
              "splice_donor_5th_base_variant",
              "splice_donor_region_variant",
              "splice_donor_variant",
              "splice_polypyrimidine_tract_variant",
              "splice_region_variant",
              "transcript_ablation",
              "transcript_amplification",
              "upstream_gene_variant"
            ])
        }
      }
    })
  }
}
</script>

