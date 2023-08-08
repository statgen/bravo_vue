/* Using build time env API_PATH and DOMAIN, deteriming url for api
 *   Default is expected to be api.<host>/ui
 */
function api_url(){
  let api_base 

  if(process.env.VUE_APP_BRAVO_API_DOMAIN === ""){
    api_base = window.location.protocol + "//api." + window.location.host 
  } else {
    api_base = window.location.protocol + "//" + process.env.VUE_APP_BRAVO_API_DOMAIN
  }
  return(api_base + process.env.VUE_APP_BRAVO_API_PATH)
}

export {api_url}
