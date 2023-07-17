<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white">
    <a class="navbar-brand" v-bind:href="publicPath">
      <img class="bo-small-logo" width="34" v-bind:src="logo"/>
    </a>

    <!-- Slot for search box -->
    <slot>
    </slot>

    <div class="collapse navbar-collapse">
      <ul class="navbar-nav ml-auto">
        <div v-if="this.user">
          <li class="nav-item">
            <span class="navbar-text btn-sm">{{user}}</span>
          </li>
        </div>
        <div v-if="!this.loginDisabled">
          <li class="nav-item"><a class="nav-link btn-sm" :href="this.logInOutUrl">{{logInOutText}}</a></li>
        </div>
        <li class="nav-item"><a class="nav-link btn-sm" href="/about.html">About</a></li>
        <li class="nav-item"><a class="nav-link btn-sm" href="/terms.html">Terms</a></li>
        <li class="nav-item"><a class="nav-link btn-sm" href="/privacy.html">Privacy</a></li>
      </ul>
    </div>
  </nav>
</template>

<script>
import logo from "../assets/b_icon.svg"

export default {
  name: 'NavBar',
  inject: {
    api: {default: ''},
    user: {default: null},
    loginDisabled: {default: true}
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      logo: logo
    };
  },
  computed: {
    logInOutUrl: function(){
      if(this.user){
        return('/logout.html')
      } else {
        let dest = encodeURIComponent(window.location.href)
        return(this.api + '/login?dest=' + dest)
      }
    },
    logInOutText: function(){
      if(this.user){
        return('Logout')
      } else {
        return('Login')
      }
    }
  }
}
</script>
