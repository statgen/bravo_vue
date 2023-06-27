<template>
  <NavBar/>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-10 col-sm-8 col-md-6">
        <h1 style="margin-bottom: 1em">About BRAVO</h1>
        <p>
        This version of BRAVO variant browser shows chromosome locations, alleles, functional annotations, and allele frequencies for 705 million variants observed in 132,345 deeply sequenced (&gt;38x) genomes from the <a href="https://www.nhlbiwgs.org">TOPMed</a> data freeze 8.
        </p>
        <p>
        The information is shared by TOPMed <a href="https://www.nhlbiwgs.org/group/project-studies">studies</a> from Phases 1, 2, and 3, and is available for users that agree to the <a href="{{ url_for('.terms') }}">terms</a>.
        </p>
        <p>
        The sequencing analysis pipeline consists of two major processes:
        <ul>
          <li>
            Harmonization of read alignments form the sequence data provided by the sequencing centers;
          </li>
          <li>
            Joint variant discovery and genotype calling across studies using the <a href="https://genome.sph.umich.edu/wiki/GotCloud">GotCloud</a> pipeline.
          </li>
        </ul>
        More detailed description of data processing methods for each data freeze is available on the TOPMed <a href="https://www.nhlbiwgs.org/data-sets">page</a>.
        </p>
        <p>
        If you have a question about BRAVO, contact <a href="mailto:bravo-group@umich.edu">bravo-group@umich.edu</a>
        </p>
        <p>
          <small>Bravo UI version: {{uiVersion}}</small>, <small>Bravo API version: {{apiVersion}}</small>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '../../components/NavBar.vue'
import axios from 'axios'
import {inject} from 'vue'

export default {
  name: 'App',
  components: {NavBar},
  data() {
    return {
      uiVersion: process.env.VUE_APP_VERSION,
      apiVersionURL: inject('api') + '/version',
      apiVersion: ""
    }
  },
  mounted: function() {
    axios.get(this.apiVersionURL)
      .then(resp => {
        this.apiVersion = resp.data.version
      })
  }
}
</script>
