<template>
  <NavBar style="margin-left: 5px;"/>

  <div class="LoginStatus">
    <h2>Queried Login Status</h2>
    <ul>
      <li>user: {{qUser}}</li>
      <li>active: {{qActive}}</li>
      <li>authenticated: {{qAuthenticated}}</li>
    </ul>
    <pre>{{qInfo}}</pre>
    <h2>App Injected/Provided Login Status</h2>
    <ul>
      <li>user: {{user}}</li>
      <li>login disabled: {{loginDisabled}}</li>
    </ul>
    <h2> Login/Logout </h2>
    <button v-if="user == null" v-on:click="handle_login()">Login</button>
    <button v-else v-on:click="handle_logout()">Logout</button>
    <p>
    End
    </p>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import axios from 'axios';
axios.defaults.withCredentials=true

export default {
  name: 'App',
  components: {
    NavBar,
  },
  inject: {
    api: {default: ''},
    user: {default: null},
    loginDisabled: {default: true}
  },
  data: function(){ 
    return {
      qUser: null,
      qActive: false,
      qAuthenticated: false,
      qInfo: ''
    }
  },
  methods:{
    update_api_auth_status: function() {
      axios
        .post(this.api + '/auth_status')
        .then( resp => { 
          this.set_state(resp.data) 
        })
    },

    set_state: function(state){
      this.qInfo = state
      this.qUser = state.user
      this.qActive = state.active
      this.qAuthenticated = state.authenticated
    },

    handle_logout: function(){ 
      axios.post(this.api + '/logout')
        .then(response => { this.set_state(response.data) })
    },

    handle_login: function() {
      this.$gAuth
        .getAuthCode()
        .then((authCode) => {
          axios.post(this.api +  '/auth_code',
            {code: authCode, redirect_uri: 'postmessage'}, 
            {headers: {'X-Requested-With': 'XMLHttpRequest'} })
            .then( resp => {
              this.set_state(resp.data)
            })
        })
        .catch((error) => {
          this.info = error
        });
    }
  },
  mounted () {
    this.update_api_auth_status()
  }
}
</script>

