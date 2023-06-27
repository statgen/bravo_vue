<template>
  <input ref="acInput" class="search-box-input" name="value" type="text" autocomplete="off" 
    v-model="qtext" placeholder="Search for gene or region" v-bind:autofocus="autofocus"
    @focus="$emit('inputfocus')" @focusout="$emit('inputfocusout')"
  />
</template>

<script>
import $ from "jquery";
import "devbridge-autocomplete";
import { inject } from 'vue';

export default {
  name: 'AutoComplete',
  props: ['width', 'autofocus'],
  emits: ['inputfocus', 'inputfocusout', 'dropdownopen', 'dropdownclose', 'suggestionSelect'],
  data: function() {
    return {
      ready: false,
      qtext: ''
    };
  },
  mounted: function() {
    var self = this;
    $(this.$el).autocomplete({
      serviceUrl: inject('api') + '/autocomplete',
      dataType: "json",
      width: this.width,
      maxHeight: 250,
      appendTo: this.$parent.$el,
      triggerSelectOnValidInput: false,
      formatResult: function(suggestion, currentValue) {
        var value = "<div class='autocomplete-suggestion-item'>";
        value += "<div>" + $.Autocomplete.defaults.formatResult(suggestion, currentValue) + "</div>"
        value += "<div style='font-size: 0.75em; color: #85144b'>" + suggestion.data.type + "</div>"
        if (suggestion.data.feature == 'gene') {
          let chrom = suggestion.data.chrom;
          if (chrom.substring(0, 3) != "chr") {
            chrom = "chr" + chrom;
          }
          value += "<div style='font-size: 0.75em;'>" + chrom +
            ":" + parseInt(suggestion.data.start).toLocaleString() +
            "-" + parseInt(suggestion.data.stop).toLocaleString() + "</div>"
        } else if (suggestion.data.feature == 'snv') {
          let [chrom, pos, ref, alt] = suggestion.data.variant_id.split('-');
          if (chrom.substring(0, 3) != "chr") {
            chrom = "chr" + chrom;
          }
          value += "<div style='font-size: 0.75em;'>" + chrom +
            ":" + parseInt(pos).toLocaleString() +
            " " + ref + "/" + alt + "</div>";
        }
        value += "</div>"
        return value;
      },
      onSearchComplete: function(query, suggestions) {
        if (suggestions.length > 0) {
          self.$emit('dropdownopen');
        }
      },
      onHide: function() {
        self.$emit('dropdownclose');
      },
      onSelect: function (suggestion) {
        // Let parent component handle what to do with selected suggestion.
        self.$emit('suggestionSelect', suggestion);
      }
    });
    this.ready = true;
  },
  beforeUnmount: function() {
    $(this.$el).autocomplete().hide();
    $(this.$el).autocomplete().dispose();
    this.ready = false;
  },
  watch: {
    width: function() {
      if (this.ready) {
        $(this.$el).autocomplete().setOptions({ width: this.width });
      }
    }
  }
}
</script>
