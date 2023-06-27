<template>
  <NavBar style="margin-left: 5px;"/>

  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-10 col-sm-8 col-md-6">
        <div class="m-3 m-md-5 text-center">
          <h2>BRAVO Log Out</h2>
          <hr class="margin-centered" width="25%">
          <div class="row justify-content-center">
            <div class="col-10 col-sm-8 col-md-6">
              <p>{{statusText}}</p>
              <p>{{message}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import axios from 'axios'
import {inject} from 'vue'
axios.defaults.withCredentials=true

export default {
  name: 'App',
  components: {
    NavBar,
  },
  data: function(){
    return {
      api: inject('api'),
      authenticated: true,
      message: null,
    }
  },
  methods:{
    set_state: function(state){
      this.qInfo = state
      this.qUser = state.user
      this.qActive = state.active
      this.qAuthenticated = state.authenticated
    },

    handle_logout: function(){
      axios.post(this.api + '/logout')
        .then(resp => {
          this.authenticated = resp.data.authenticated
          this.message = "Redirecting in 5 seconds"
          setTimeout(function(){
            window.location.href = '/'
          }, 5000)
        })
        .catch(err => {
          this.message = "Error while attempting to log out."
        })
    },
  },
  computed: {
    statusText: function(){
      if(this.authenticated){
        return 'Logged in'
      }else{
        return 'Logged out'

      }
    }
  },
  mounted () {
    this.handle_logout()
  }
}
</script>

