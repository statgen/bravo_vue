<template>
  <NavBar/>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-10 col-sm-8 col-md-6">
      <h1 style="margin-bottom: 1em">Terms of Use</h1>
      <p>To use this site, you must agree with all of the following:</p>
        <ul>
          <li>You will not attempt to download any dataset in bulk from this website.</li>
          <li>You will not attempt to re-identify or contact research participants.</li>
          <li>You will protect data confidentiality.</li>
          <li>You will report any inadvertent data release,
          security breach or other data management incident of which you become aware.</li>
          <li>You will abide by all applicable laws and regulations for handling genomic data.</li>
          <li>You will not share data from this site with others.
        Instead, please direct them to this site, dbGaP, or elsewhere to view this data.</li>
        </ul>
        <div v-if="promptAgreement">
          <p>Click to indicate you agree to the above terms.</p>
          <button id="agreeBtn" class="btn btn-outline-primary" v-on:click="handleAgree">
            Agree to terms
          </button>
        </div>
        <p id="agreeMsg" v-if="hasAgreed">You have agreed to the terms.</p>
        <p id="errorMsg" v-if="errorSavingAgreement">
          There was an error persisting your agreement to the terms.  Please try again later.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
axios.defaults.withCredentials=true
import NavBar from '../../components/NavBar.vue'

export default {
  name: 'App',
  components: {NavBar},
  inject: {
    api: {default: ''},
    user: {default: null},
    agreedToTerms: {default: null}
  },
  data: function(){
    return {
      errorSavingAgreement: false
    }
  },
  computed: {
    promptAgreement: function() {
      return(this.user !== null &&
             this.agreedToTerms === false &&
             !this.errorSavingAgreement)
    },
    hasAgreed: function() {
      return(this.user !== null &&
             this.agreedToTerms === true &&
             !this.errorSavingAgreement)
    },
    dest: function() {
      let urlParams = new URLSearchParams(window.location.search)
      let decodedDest = decodeURIComponent(urlParams.get('dest'))
      if(decodedDest[0] === '/'){
        return(decodedDest)
      } else {
        return('/')
      }
    }
  },
  methods: {
    handleAgree: function() {
      axios
        .post(`${this.api}/agree_to_terms`)
        .then(response => {
          window.location.href = this.dest
        })
        .catch(error => {
          this.errorSavingAgreement = true;
        });
    }
  }
}
</script>
