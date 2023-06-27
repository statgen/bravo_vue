<template>
  <div class="card shadow-sm">
    <div class="card-body">
      <div class="container-fluid">
        <div v-if="this.ready" class="row">
          <div class="col-sm-12">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th scope="col" style="border-top:none;">Quality metric</th>
                    <th scope="col" style="border-top:none;">Description</th>
                    <th scope="col" style="border-top:none;">Value</th>
                    <th scope="col" style="border-top:none;">Percentile</th>
                    <th scope="col" style="border-top:none;"><Percentile/></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="metric in metrics">
                    <td>{{ metric.name }}</td>
                    <td>{{ metric.description }}</td>
                    <!-- Problem with example data for Doped in SVM scores. Value is array.
                    <td>{{ variant.qc_metrics[metric.name][0]?.toPrecision(4) }}</td>
                    -->
                    <td>{{ variant.qc_metrics[metric.name][0] }}</td>
                    <td>{{ (variant.qc_metrics[metric.name][2] * 100)?.toFixed(2) }}</td>
                    <td><Percentile :variant="variant" :metric="metric"/></td>
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
import Percentile from '@/components/Percentile.vue'
import axios from "axios"
import { inject } from 'vue'
axios.defaults.withCredentials=true

export default {
  name: 'VariantMetrics',
  components: {
    Percentile
  },
  props: ['variant'],
  data: function () {
    return {
      api: inject('api'),
      loading: false,
      failed: false,
      ready: false,
      metrics: []
    }
  },
  methods: {
    load: function() {
      this.loading = true;
      axios
        .get(`${this.api}/qc/api`)
        .then( response => {
          var payload = response.data;
          this.metrics = payload.data;
          this.loading = false;
          this.ready = true;
        })
        .catch( error => {
          this.failed = true;
        });
    }
  },
  beforeCreate() {
    // initialize non-reactive data
    this.metrics = null;
  },
  created: function() {

  },
  mounted: function() {
    this.load();
  },
  computed: {
  }
}
</script>
