import { createApp } from 'vue'
import App from './Home.vue'
import VueGtag from 'vue-gtag'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/bravo.css'
import { authAwareMount } from '@/AuthAwareMount'
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

authAwareMount(app, '#app')
