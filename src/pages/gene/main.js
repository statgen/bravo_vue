import { createApp } from 'vue'
import App from './GenePage.vue'
import VueGtag from 'vue-gtag'
import 'bootstrap/dist/css/bootstrap.css'
import 'tabulator-tables/dist/css/bootstrap/tabulator_bootstrap.css'
import '@/assets/bravo.css'
import '@/assets/snv_consequences.css'
import '@/assets/snv_tabulator_table.css'
import {clickOutside} from '@/CustomDirectives'
import { agreementExpectedMount } from '@/AuthAwareMount'
import { api_url } from '@/ApiUrlResolution'
import * as Sentry from '@sentry/vue'

const app = createApp(App)
if("VUE_SENTRY_DSN" in process.env){
  Sentry.init({ app, dsn: process.env.VUE_SENTRY_DSN, sendDefaultPii: false })
}else{
  console.log("Sentry.io not enabled for non-production build")
}
app.provide('api', api_url())

// Inject gtag header if config includes a non-blank google analyitics id
if(process.env.VUE_APP_GA_ID){
  app.use(VueGtag, {
    config: {
      id: process.env.VUE_APP_GA_ID,
      send_page_view: true
    }
  });
}

app.directive('click-outside', clickOutside)

// Temporary config for refs in provide/inject.
//   see: https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity
app.config.unwrapInjectedRef = true

agreementExpectedMount(app, '#app')
