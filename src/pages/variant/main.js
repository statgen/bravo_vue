import { createApp } from 'vue'
import App from './Variant.vue'
import VueGtag from 'vue-gtag'
import 'bootstrap/dist/css/bootstrap.css'
import '@/assets/bravo.css'
import {clickOutside} from '@/CustomDirectives'
import { agreementExpectedMount } from '@/AuthAwareMount'
import { api_url } from '@/ApiUrlResolution'

const app = createApp(App)
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

app.directive('click-outside', clickOutside);

agreementExpectedMount(app, '#app')
