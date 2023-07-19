export default {
  lookup: function(name){
    let result = this.info[name];
    if(result === undefined){
      result = {"IMPACT": "", "SO accession": "", "desc": "", "title": name};
    }
    return(result);
  },
  info: {
    "3_prime_UTR_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001624",
      "desc": "A UTR variant of the 3' UTR",
      "title": "3 prime UTR variant"
    },
    "5_prime_UTR_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001623",
      "desc": "A UTR variant of the 5' UTR",
      "title": "5 prime UTR variant"
    },
    "NMD_transcript_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001621",
      "desc": "A variant in a transcript that is the target of NMD",
      "title": "NMD transcript variant"
    },
    "TFBS_ablation": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001895",
      "desc": "A feature ablation whereby the deleted region includes a transcription factor binding site",
      "title": "TFBS ablation"
    },
    "TFBS_amplification": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001892",
      "desc": "A feature amplification of a region containing a transcription factor binding site",
      "title": "TFBS amplification"
    },
    "TF_binding_site_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001782",
      "desc": "A sequence variant located within a transcription factor binding site",
      "title": "TF binding site variant"
    },
    "coding_sequence_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001580",
      "desc": "A sequence variant that changes the coding sequence",
      "title": "Coding sequence variant"
    },
    "coding_transcript_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001968",
      "desc": "A transcript variant of a protein coding gene",
      "title": "Coding transcript variant"
    },
    "downstream_gene_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001632",
      "desc": "A sequence variant located 3' of a gene",
      "title": "Downstream gene variant"
    },
    "feature_elongation": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001907",
      "desc": "A sequence variant that causes the extension of a genomic feature, with regard to the reference sequence",
      "title": "Feature elongation"
    },
    "feature_truncation": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001906",
      "desc": "A sequence variant that causes the reduction of a genomic feature, with regard to the reference sequence",
      "title": "Feature truncation"
    },
    "frameshift_variant": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001589",
      "desc": "A sequence variant which causes a disruption of the translational reading frame, because the number of nucleotides inserted or deleted is not a multiple of three",
      "title": "Frameshift variant"
    },
    "incomplete_terminal_codon_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0001626",
      "desc": "A sequence variant where at least one base of the final codon of an incompletely annotated transcript is changed",
      "title": "Incomplete terminal codon variant"
    },
    "inframe_deletion": {
      "IMPACT": "IMPACT: MODERATE",
      "SO accession": "SO:0001822",
      "desc": "An inframe non synonymous variant that deletes bases from the coding sequence",
      "title": "Inframe deletion"
    },
    "inframe_insertion": {
      "IMPACT": "IMPACT: MODERATE",
      "SO accession": "SO:0001821",
      "desc": "An inframe non synonymous variant that inserts bases into in the coding sequence",
      "title": "Inframe insertion"
    },
    "intergenic_variant": {
      "IMPACT": "MODIFIER",
      "SO accession": "SO:0001628",
      "desc": "A sequence variant located in the intergenic region, between genes",
      "title": "Intergenic variant"
    },
    "intron_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001627",
      "desc": "A transcript variant occurring within an intron",
      "title": "Intron variant"
    },
    "mature_miRNA_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001620",
      "desc": "A transcript variant located with the sequence of the mature miRNA",
      "title": "Mature miRNA variant"
    },
    "missense_variant": {
      "IMPACT": "IMPACT: MODERATE",
      "SO accession": "SO:0001583",
      "desc": "A sequence variant, that changes one or more bases, resulting in a different amino acid sequence but where the length is preserved",
      "title": "Missense variant"
    },
    "non_coding_transcript_exon_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001792",
      "desc": "A sequence variant that changes non-coding exon sequence in a non-coding transcript",
      "title": "Non coding transcript exon variant"
    },
    "non_coding_transcript_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001619",
      "desc": "A transcript variant of a non coding RNA gene",
      "title": "Non coding transcript variant"
    },
    "protein_altering_variant": {
      "IMPACT": "IMPACT: MODERATE",
      "SO accession": "SO:0001818",
      "desc": "A sequence_variant which is predicted to change the protein encoded in the coding sequence",
      "title": "Protein altering variant"
    },
    "regulatory_region_ablation": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001894",
      "desc": "A feature ablation whereby the deleted region includes a regulatory region",
      "title": "Regulatory region ablation"
    },
    "regulatory_region_amplification": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001891",
      "desc": "A feature amplification of a region containing a regulatory region",
      "title": "Regulatory region amplification"
    },
    "regulatory_region_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001566",
      "desc": "A sequence variant located within a regulatory region",
      "title": "Regulatory region variant"
    },
    "sequence_variant": {
      "IMPACT": "MODIFIER",
      "SO accession": "SO:0001060",
      "desc": "A sequence_variant is a non exact copy of a sequence_feature or genome exhibiting one or more sequence_alteration",
      "title": "Sequence variant"
    },
    "splice_acceptor_variant": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001574",
      "desc": "A splice variant that changes the 2 base region at the 3' end of an intron",
      "title": "Splice acceptor variant"
    },
    "splice_donor_5th_base_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0001787",
      "desc": "A sequence variant that causes a change at the 5th base pair after the start of the intron in the orientation of the transcript",
      "title": "Splice donor 5th base variant"
    },
    "splice_donor_region_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0002170",
      "desc": "A sequence variant that falls in the region between the 3rd and 6th base after splice junction (5' end of intron)",
      "title": "Splice donor region variant"
    },
    "splice_donor_variant": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001575",
      "desc": "A splice variant that changes the 2 base region at the 5' end of an intron",
      "title": "Splice donor variant"
    },
    "splice_polypyrimidine_tract_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0002169",
      "desc": "A sequence variant that falls in the polypyrimidine tract at 3' end of intron between 17 and 3 bases from the end (acceptor -3 to acceptor -17)",
      "title": "Splice polypyrimidine tract variant"
    },
    "splice_region_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0001630",
      "desc": "A sequence variant in which a change has occurred within the region of the splice site, either within 1-3 bases of the exon or 3-8 bases of the intron",
      "title": "Splice region variant"
    },
    "start_lost": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0002012",
      "desc": "A codon variant that changes at least one base of the canonical start codon",
      "title": "Start lost"
    },
    "start_retained_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0002019",
      "desc": "A sequence variant where at least one base in the start codon is changed, but the start remains",
      "title": "Start retained variant"
    },
    "stop_gained": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001587",
      "desc": "A sequence variant whereby at least one base of a codon is changed, resulting in a premature stop codon, leading to a shortened transcript",
      "title": "Stop gained"
    },
    "stop_lost": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001578",
      "desc": "A sequence variant where at least one base of the terminator codon (stop) is changed, resulting in an elongated transcript",
      "title": "Stop lost"
    },
    "stop_retained_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0001567",
      "desc": "A sequence variant where at least one base in the terminator codon is changed, but the terminator remains",
      "title": "Stop retained variant"
    },
    "synonymous_variant": {
      "IMPACT": "IMPACT: LOW",
      "SO accession": "SO:0001819",
      "desc": "A sequence variant where there is no resulting change to the encoded amino acid",
      "title": "Synonymous variant"
    },
    "transcript_ablation": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001893",
      "desc": "A feature ablation whereby the deleted region includes a transcript feature",
      "title": "Transcript ablation"
    },
    "transcript_amplification": {
      "IMPACT": "IMPACT: HIGH",
      "SO accession": "SO:0001889",
      "desc": "A feature amplification of a region containing a transcript",
      "title": "Transcript amplification"
    },
    "upstream_gene_variant": {
      "IMPACT": "IMPACT: MODIFIER",
      "SO accession": "SO:0001631",
      "desc": "A sequence variant located 5' of a gene",
      "title": "Upstream gene variant"
    }
  }
}
