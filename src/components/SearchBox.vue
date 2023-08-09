<template>
  <div id="bravosearch">
    <div class="div-shadow" v-bind:style="{ width: width + 'px', height: height + 'px' }"  v-bind:class="{ 'div-shadow-show': showShadow(), 'div-shadow-expand': isDropdownOpen }"> </div>

    <form id="form" class="search-box" @submit.prevent="doSearch()" @mouseover="isHovered = true" @mouseout="isHovered = false" :class="{ 'search-box-dropdown-open': isDropdownOpen }">

       <!-- v-once should make jQuery plugin to ignore any updates -->
      <AutoComplete ref="autocomplete" v-bind:autofocus="autofocus"
        v-on:inputfocus="isActive = true" v-on:inputfocusout="isActive = false"
        v-on:dropdownopen="openDropdown(true)" v-on:dropdownclose="openDropdown(false)"
        v-bind:width = "width" v-on:suggestionSelect="doSuggest">
      </AutoComplete>

      <button class="search-box-button" type="submit">
        <font-awesome-icon :icon="searchIcon"></font-awesome-icon>
      </button>
    </form>
  </div>
</template>

<script>
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { inject } from 'vue'
import AutoComplete from '@/components/Autocomplete.vue';
import axios from 'axios';

export default {
  name: 'SearchBox',
  components: {
    FontAwesomeIcon,
    AutoComplete
  },
  emits: ['noSearchResults'],
  props: {
    autofocus: {
      type: Boolean
    }
  },
  data: function() {
    return {
      width: 600, // arbitrary initial value. will be changed on "mounted" hook
      height: 10,
      isHovered: false,
      isActive: false,
      isDropdownOpen: false,
      searchIcon: faSearch,
      searchapi: inject('api') + '/autocomplete'
    };
  },
  methods: {
    suggestToResultTicket(suggestion){
      // Suggestions cover rsids and gene names
      let rTicket = {}

      if(suggestion.data.feature === 'snv'){
        rTicket.endpoint = 'variant';

        let var_id_parts = suggestion.data.variant_id.split('-')
        rTicket.chrom = var_id_parts[0]
        rTicket.pos   = var_id_parts[1]
        rTicket.ref   = var_id_parts[2]
        rTicket.alt   = var_id_parts[3]
      }else{
        // Default assumes gene endpoint
        rTicket.endpoint = 'gene'
        rTicket.id = suggestion.value
      }
      return(rTicket);
    },
    queryToResultTicket: function(query) {
      // Cover chrom-pos-ref-alt and chrom-start-end searches
      // Also fallback in even autocomplete isn't working.

      // pre-process query string
      const pQuery = query.replace(/,/g, '').trim();

      // check for empty or null query
      if(!pQuery){
        return {endpoint: 'notfound'};
      }

      // check query for DbSNP format
      const pattRsid = /^rs(\d+)$/i;
      if(pattRsid.test(pQuery)){
        return {
          endpoint: 'variant',
          rsId: pQuery
        }
      }

      // check query for region format
      //pattern parts:     chromsome-------------          start---          stop----
      const pattRegion = /^(?:CHR)?(\d+|X|Y|M|MT)\s*[-: ]\s*([\d,]+)\s*[-: ]\s*([\d,]+)$/i;
      const regionMatches = pQuery.match(pattRegion);
      if(regionMatches){
        return {
          endpoint: 'region',
          chrom: regionMatches[1],
          start: regionMatches[2],
          stop: regionMatches[3]
        }
      }

      // check query for VCF style variant format
      //pattern parts:         chromsome-------------          pos-----          ref------          alt------
      const vcfVariantPatt = /^(?:CHR)?(\d+|X|Y|M|MT)\s*[-: ]\s*([\d,]+)\s*[-: ]\s*([ATCG]+)\s*[-: ]\s*([ATCG]+)$/i;
      const vcfVariantMatches = pQuery.match(vcfVariantPatt);
      if(vcfVariantMatches){
        return {
          endpoint: 'variant',
          chrom: vcfVariantMatches[1],
          pos: vcfVariantMatches[2],
          ref: vcfVariantMatches[3],
          alt: vcfVariantMatches[4]
        }
      }

      // Default to notfound endpoint as suggestion covers gene names.
      return { endpoint: 'notfound', query: query}
    },
    resultTicketToHref: function(ticket) {
      // Append .html extension until dev server mime-type issue is resolved.
      let href = ticket.endpoint + '.html'
      delete ticket.endpoint

      let paramContent = []
      for(let p in ticket){
        if(Object.prototype.hasOwnProperty.call(ticket,p)){
          paramContent.push(
            encodeURIComponent(p) + "=" + encodeURIComponent(ticket[p])
          )
        }
      }

      if(paramContent.length){
        href += "?" + paramContent.join('&')
      }
      return href
    },
    doSuggest(suggestion){
      let resultTicket = this.suggestToResultTicket(suggestion)
      this.followResultTicket(resultTicket)
    },
    doSearch: function() {
      // Use first autocomplete result, or
      //   handle query matches region or snv format.
      let queryVal = this.$refs.autocomplete.qtext
      axios.get(this.searchapi, {params: {query: queryVal}})
        .then(resp => {
          let suggestion = resp.data.suggestions.shift()
          if(suggestion){
            let resultTicket = this.suggestToResultTicket(suggestion);
            this.followResultTicket(resultTicket)
          } else {
            let resultTicket = this.queryToResultTicket(queryVal);
            this.followResultTicket(resultTicket)
          }
        })
    },
    followResultTicket: function(ticket){
      if(ticket.endpoint == "noresult"){
        this.$emit("noSearchResults", ticket.queryVal)
      } else {
        let resultUrl = this.resultTicketToHref(ticket);
        window.location.assign(resultUrl);
      }
    },
    onResize: function() {
      var height = this.$el.querySelector("form").getBoundingClientRect().height;
      if (this.isDropdownOpen) {
        // extra 14 pixels to compensate rounded borders
        height += this.$el.querySelector(".autocomplete-suggestions")
          .getBoundingClientRect().height + 14;
      }
      this.width = this.$el.querySelector("form").getBoundingClientRect().width;
      this.height = height;
    },
    openDropdown: function(open) {
      var height = this.$el.querySelector("form").getBoundingClientRect().height;
      if (open) {
        // extra 14 pixels to compensate rounded borders
        height += this.$el.querySelector(".autocomplete-suggestions")
          .getBoundingClientRect().height + 14;
      }
      this.height = height;
      this.isDropdownOpen = open;
    },
    showShadow: function() {
      return this.isHovered || this.isActive;
    },
  },
  mounted: function() {
    this.width = this.$el.querySelector("form").getBoundingClientRect().width;
    this.height = this.$el.querySelector("form").getBoundingClientRect().height;
    window.addEventListener('resize', this.onResize);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize);
  }
}
</script>

<style scoped>
#bravosearch :deep(.autocomplete-suggestions) {
  background-color: transparent;
  border: 0px;
  overflow: auto;
  padding-bottom: 0px;
  padding-top: 0px;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
#bravosearch :deep(.autocomplete-suggestion) {
  padding: 2px 13px;
  white-space: nowrap;
  overflow: hidden;
  border-left: 1px solid transparent;
  border-right: 1px solid transparent;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
#bravosearch :deep(.autocomplete-selected) {
  background-color: #F0F0F0;
  border-left: 1px solid #ced4da;
  border-right: 1px solid #ced4da;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
}
</style>
