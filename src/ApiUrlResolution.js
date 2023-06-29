/* Using build time env API_PATH and DOMAIN, deteriming url for api
 *   Default is expected to be api.<host>/ui
 */
function api_url(){
  let api_base = process.env.VUE_APP_BRAVO_API_DOMAIN 

  if(api_base === ""){
    api_base = "https://api." + window.location.host 
  }

  return("https://" + api_base + process.env.VUE_APP_BRAVO_API_PATH)
}

export {api_url}
