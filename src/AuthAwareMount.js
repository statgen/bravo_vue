/* Mount Vue app with respect to auth status
 * When:
 *  - login disabled: mount app normally
 *  - authenticated: set user and loginDisabled props.
 *  - unauthenticated: redirect to API login endpoint.
 *  - agreed_to_terms: set user and loginDisabled props.
 *  - unauthenticated agreed_to_terms: redirect to UI login endpoint.
 *
 * Expected use:
 *   var authProps = { z_user: null, z_login_disabled: true }
 *   const app = createApp(App, authProps);
 *   authAwareMount(app, '#app')
 */

import axios from 'axios'
import { api_url } from '@/ApiUrlResolution'

// Redirect to login passing current location as the eventual destination
function redirectToLogin(){
  let dest = encodeURIComponent(window.location.href)
  window.location.href = api_url() + '/login?dest=' + dest
}

// Pre-emptive redirect for pages expected to have backend auth requirement.
// Auth redirect if auth being used by API
function authExpectedMount(app, mountPoint){
  axios.get(api_url() + '/auth_status', {withCredentials: true})
    .then(function(resp){
      if(resp.data.login_disabled){
        app.mount(mountPoint)
      }else if(resp.data.authenticated){
        app.provide('user', resp.data.user)
        app.provide('loginDisabled', resp.data.login_disabled)
        app.mount(mountPoint)
      }else{
        redirectToLogin()
      }
    })
}

// Redirect for pages using api endpoints expected to have a terms agreement requirement.
function agreementExpectedMount(app, mountPoint){
  axios.get(api_url() + '/auth_status', {withCredentials: true})
    .then(function(resp){
      if(resp.data.login_disabled){
        app.mount(mountPoint)

      }else if(!resp.data.authenticated){
        redirectToLogin()

      }else if(resp.data.authenticated && !resp.data.agreed_to_terms){
        // Redirect to terms passing current location as the eventual destination
        let dest = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = '/terms.html?dest=' + dest

      }else if(resp.data.authenticated && resp.data.agreed_to_terms){
        // Load app when user is authenticated and has agreed to terms.
        app.provide('user', resp.data.user)
        app.provide('loginDisabled', resp.data.login_disabled)
        app.mount(mountPoint)

      }else{
        console.log("Error determining authentication and terms agreement.")
        window.location.href = '/'
      }
    })
}


// Provide information from auth endpoint to application,
//   but do not pre-emptively route to login if unathenticated
function authAwareMount(app, mountPoint){
  axios.get(api_url() + '/auth_status', {withCredentials: true})
    .then(function(resp){
      app.provide('user', resp.data.user)
      app.provide('loginDisabled', resp.data.login_disabled)
      app.provide('agreedToTerms', resp.data.agreed_to_terms)
      app.mount(mountPoint)
    })
}

export {authAwareMount, authExpectedMount, agreementExpectedMount}
