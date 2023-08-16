<template>
<div>
  <h5 id="data-set">Data Set</h5>
  <p>This is freeze 1RNA for the TOPMed RNA-seq data, containing cis-eQTL analysis results for six tissues:</p>
  <ul>
    <li>Whole blood (N = 6,602)</li>
    <li>Lung (N = 1,360)</li>
    <li>PBMC (N = 1,265)</li>
    <li>T cells (N = 368)</li>
    <li>Nasal epithelial (N = 359)</li>
    <li>Monocytes (N = 352)</li>
  </ul>
  <h5 id="cis-eqtlsusie">cis-eqtl/susie</h5>
  <p>SuSiE fine-mapping results (using SuSiE [3] implementation in tensorQTL [2]). Data was used from the 95% credible sets discovered. Only genes for which the model converged and at least one credible set was discovered are included.</p>
  <p>By default the SNP posterior inclusion probabilities (PIP) values reported by SuSiE represent an aggregation across single effects; we therefore calculated single-effect PIP values using the Bayes factor matrix <code>(PIP_ij = BF_ij / sum(BF_j)</code>, for SNP i and single effect j, where BF represents Bayes factors and the sum is across SNPs. In practice the difference between the single-effect PIP values and the PIP values reported by SuSiE tends to be extremely minor. A small minority of credible sets were duplicates (credible sets containing the same SNPs and PIP values). Such duplicate credible sets were collapsed into single credible sets.</p>
  <h6 id="column-descriptions">Column descriptions:</h6>
  <ul>
    <li><strong>variant_id:</strong> genetic variant, in format {chromosome}_{position}_{ref_allele}_{alt_allele}</li>
    <li><strong>pip:</strong> SuSiE PIP (essentially, the probability the variant is a causal one for this eQTL signal)</li>
  </ul>
  <h5 id="references">References</h5>
  <ul>
    <li>[1] Ongen, H., Buil, A., Brown, A.A., Dermitzakis, E.T., Delaneau, O. (2016). Fast and efficient QTL mapper for thousands of molecular phenotypes. Bioinformatics 32, 1479–1485.</li>
    <li>[2] Taylor-Weiner, A., Aguet, F., Haradhvala, N.J., Gosai, S., Anand, S., Kim, J., Ardlie, K., Van Allen, E.M., and Getz, G. (2019). Scaling computational genomics to millions of individuals with GPUs. Genome Biol. 20, 228.</li>
    <li>[3] Wang, G., Sarkar, A., Carbonetto, P., and Stephens, M. (2020). A simple new approach to variable selection in regression, with application to genetic fine mapping. J. R. Stat. Soc. Ser. B Stat. Methodol. 82, 1273–1300.</li>
  </ul>
</div>
</template>

<script>
export default {
  name: "EqtlTableDescription"
}
</script>
