import { createApp } from 'vue'
import App from './Terms.vue'
import VueGtag from 'vue-gtag'
import 'bootstrap/dist/css/bootstrap.min.css'
import { authAwareMount } from '@/AuthAwareMount'
import { api_url } from '@/ApiUrlResolution'

const app = createApp(App)
app.provide('api', api_url())

// Inject gtag header if config includes a non-blank google analyitics id
if(process.env.GA_ID){
  app.use(VueGtag, {
    property: {
      id: process.env.GA_ID,
      send_page_view: true
    }
  });
}

authAwareMount(app, '#app')
