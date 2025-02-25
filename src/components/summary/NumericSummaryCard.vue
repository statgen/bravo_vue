<template>
<div class="card shadow-sm small">

  <div class="card-body">

    <div v-if="loading" class="container-fluid">
      <div class="row">
        <div class="col-sm-12 text-center">
          <div class="spinner-border spinner-border-sm text-primary ml-auto" role="status" aria-hidden="true"></div>
          <strong>&nbsp;Loading...</strong>
        </div>
      </div>
    </div>
    <div v-if="failed" class="container-fluid">
      <div class="row">
        <div class="col-sm-12 text-center">
          Error while loading data
        </div>
      </div>
    </div>
    <div v-if="loaded" class="container-fluid">
      <div class="row">
        <div class="col-sm-12">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th scope="col" style="border-top:none;">{{title}}</th>
                  <th scope="col" class="d-md-table-cell text-right" style="border-top:none;">{{numericLabel}}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(val, key) in summaryData" :key="key">
                  <tr>
                    <td>{{key}}</td>
                    <td class="d-md-table-cell text-right">{{(val || 0).toLocaleString()}}</td>
                  </tr>
                </template>
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
export default {
  name: "NumericSummaryCard",
  props: {
    title: {
      type: String,
      default: "Summary"
    },
    numericLabel: {
      type: String,
      default: "Number"
    },
    summaryData: {
      type: Object,
      default: function(){ 
        return {foo: 1, bar: 100} 
      }
    },
    state: {
      type: String,
      default: "loading"
    },
  },
  computed:{
    loading() { return(this.state === "loading") },
    failed()  { return(this.state === "failed")  },
    loaded()  { return(this.state === "loaded")  },
  },
}
</script>
