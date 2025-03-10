<template>
<div>
  <h5 id="data-set">Data Set</h5>
  <p>This is containing cis-eQTL analysis of freeze2 RNA for the TOPMed RNA-seq data. The preprint, <a href="https://doi.org/10.1101/2025.02.19.25322561">"Cross-cohort analysis of expression and splicing quantitative trait loci in TOPMed"</a>, describes the research in detail.  Results presented here are for the following six tissues:</p>
  <ul>
    <li>Whole blood (N = 6,454)</li>
    <li>Lung (N = 1,291)</li>
    <li>PBMC (N = 1,265)</li>
    <li>T cells (N = 368)</li>
    <li>Nasal epithelial (N = 355)</li>
    <li>Monocytes (N = 352)</li>
  </ul>

  <h5 id="cis-eqtlsusie">Cis-eQTL/SuSiE</h5>
  <p>The eQTL table shows the variants in the 95% credible sets from fine-mapping eQTL signals using SuSiE [3] (as implemented in tensorQTL [2]). Here, a 95% credible set is the set of variants that is estimated to contain a causal variant for the eQTL signal with 95% probability. For a given tissue and gene, all variants with the same cs_id are in the same credible set, and variants with greater posterior inclusion probabilities (PIP) are more likely to be the causal variant(s); PIP values range between 0 (unlikely to be the causal variant) and 1 (likely to be the causal variant).</p>
  <h6 id="column-descriptions">Data descriptions:</h6>
  <ul>
    <li><strong>phenotype_id:</strong> gene identifier affected by eQTL</li>
    <li><strong>variant_id:</strong> genetic variant, in format <code>{chromosome}_{position}_{ref}_{alt}</code></li>
    <li><strong>pip:</strong> SuSiE posterior inclusion probability. Essentially, the probability the variant is a causal one for this eQTL signal</li>
    <li><strong>cs_id:</strong> Credible set identfier within a tissue and phenotype. The cs_id together with the tissue and phenotype_id (Ensembl id) uniquely identify a credible set. A credible set containing more than one genetic variant will have multiple records.</li>
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
