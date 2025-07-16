<template>
  <div style="display: inline-block;">
    <button class="parentMenu__button" v-on:click="showListDropDown = !showListDropDown">
      {{listTitle}} <font-awesome-icon style="background-color: transparent; display: inline-block; vertical-align: middle" :icon="icon"></font-awesome-icon>
    </button>
    <div v-if="showListDropDown" class="parentMenu__dropdown">
      <template v-for="(varContent, varKey) in listVars" :key='varKey' >
      <div>
        <a href="#" v-on:click.prevent="emitToggle(varKey)">
          <div v-bind:style="onOffStyle(varContent.val)">&#10004;</div>
          {{varContent.title}}
        </a>
      </div>
      </template>
    </div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

export default {
  name: "ToggleList",
  components: {FontAwesomeIcon},
  data: function() {
    return {
      showListDropDown: false
    }
  },
  props: {
    listTitle: {
      type: String,
      required: true
    },
    listGroup: {
      type: String,
      default: "varToggleGroup"
    },
    listVars: {
      type: Object,
      default() {
        return {
          var1: { title: 'Var One', val: true },
          var2: { title: 'Var Two', val: true },
          var3: { title: 'Var Tri', val: false }
        }
      }
    },
    icon: {
      default: faEllipsisV
    }
  },
  emits: ['varToggled'],
  methods: {
    emitToggle: function(varKey) {
      this.$emit('varToggled', this.listGroup, varKey)
      this.showListDropDown = false
    },
    onOffStyle: function(boolVar) {
      return boolVar ? 'display: inline;' : 'display: inline; visibility: hidden;'
    },
  }
}
</script>
