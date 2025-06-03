<template>
    <div class="btn-group mr-1 mt-1 position-static" v-click-outside="handleClickAway">
      <div style="display: inline-block;">
        <button class="btn btn-sm dropdown-toggle" :class="activeClass" v-on:click="showDropDown = !showDropDown">
          {{compositeTitle}}
        </button>
        <div v-if="showDropDown" class="dropdown-menu shadow show">
          <form class="p-2">
            <div class="overflow-auto" style="min-width: 300px; max-height: 370px;">
                <!-- Non-Collapseable FiltSet Groups -->
                <template v-for="(group, groupKey) in nonCollapseFiltSet" :key="groupKey">
                  <ul style="list-style-type: none; padding-left: 0;">
                    <div class="custom-control custom-checkbox">
                      <input class="custom-control-input" type="checkbox" :value="groupKey"
                        :id="groupKey" v-model="group.allTrue" @change="handleGroupToggle(group)">
                      <label class="custom-control-label" :for="groupKey">{{group.title}}</label>
                    </div>
                    <ul style="list-style-type: none; padding-left: 1rem; padding-top: 0.2rem;">
                    <template v-for="(member, memberKey) in group.members" :key="memberKey">
                      <li>
                        <div class="custom-control custom-checkbox">
                          <input class="custom-control-input" type="checkbox" :value="memberKey" :id="memberKey"
                                 v-model="member.val" @change="handleMemberToggle(member, group)">
                          <label class="custom-control-label" :for="memberKey">{{member.title}}</label>
                          <small class="form-text text-muted">{{member.desc}}</small>
                        </div>
                      </li>
                    </template>
                    </ul>
                  </ul>
                </template>

                <!-- Collapseable FiltSet Groups -->
                <div v-if="isCollapseFiltSetPresent">
                  <button type="button" class="btn btn-link btn-sm" button v-on:click="showHidden = !showHidden">
                    <span>{{showHideText}}</span>
                  </button>

                  <template v-for="(group, groupKey) in collapseFiltSet" :key="groupKey">
                  <div v-if="showHidden">
                    <li>
                      <div class="custom-control custom-checkbox">
                        <input class="custom-control-input" type="checkbox" :value="groupKey"
                          :id="groupKey" v-model="group.allTrue" @change="handleGroupToggle(group)">
                        <label class="custom-control-label" :for="groupKey">{{group.title}}</label>
                      </div>
                      <ul style="list-style-type: none; padding-left: 1rem; padding-top: 0.2rem;">
                      <template v-for="(member, memberKey) in group.members" :key="memberKey">
                        <li>
                          <div class="custom-control custom-checkbox">
                            <input class="custom-control-input" type="checkbox" :value="memberKey" :id="memberKey"
                                   v-model="member.val" @change="handleMemberToggle(member, group)">
                            <label class="custom-control-label" :for="memberKey">{{member.title}}</label>
                            <small class="form-text text-muted">{{member.desc}}</small>
                          </div>
                        </li>
                      </template>
                      </ul>
                    </li>
                  </div>
                  </template>
                </div>
            </div>

            <!-- Apply & Cancel buttons -->
            <hr/>
            <div class="form-row">
              <div class="col mr-auto">
                <button type="button" class="btn btn-secondary btn-sm" v-on:click="clearEphemeralFilters">
                  Clear
                </button>
              </div>
              <div class="col mr-auto">
                <button type="button" class="btn btn-primary btn-sm float-right" v-on:click="applyFilters">
                  Apply
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
</template>

<script>
import clone from 'just-clone';

export default {
  name: "BaseBooleanFilterButton",
  props: {
    title: {
      type: String,
      default: "Filters"
    },
    givenCategory: {
      type: String,
      default: "base"
    }
  },
  data: function() {
    return {
      // persisted form values. Loaded on show. Updated on save.
      pFiltSet: {
        gColorFilter: {
          title: "Example Filter Group",
          members: {
            red: {
              title: "Red",
              desc: "Is red."
            },
            green: {
              title: "Green",
              desc: "Is green"
            }
          }
        },
        gQCFails:{
          title: "Quality Control Failures",
          members: {
            mainQC: {
              title: "Main Quality Control",
              desc: "Failed primary quality control"
            },
            secondary: {
              title: "Secondary",
              desc: "Failed Secondary quality control"
            },
            alice: {
              title: "Project alICE",
              desc: "Failed QC for the fictional alICE project"
            }
          }
        }
      },
      // default filter field value
      fieldVal: "default",
      // ephemeral filter model the form edits directly
      eFiltSet: {},
      filterVals: [{field: "filter", type: "=", value: "PASS"}],
      showDropDown: false,
      showHidden: false
    }
  },
  emits: ['filterChange'],
  created: function() {
    //Explicitly set defaults: val, allTrue, and collapseable
    let groups = Object.values(this.pFiltSet)
    for( let g of groups){
      //g.allTrue = (g.allTrue === undefined) ? false : g.allTrue
      g.collapseable = (g.collapseable === undefined) ? false : g.collapseable
      for( let m of Object.values(g.members)){
        m.val = (m.val === undefined) ? false: m.val
      }
      //set allTrue based on member vals
      g.allTrue = this.isEntireGroupTrue(g)
    }
    //ensure ephemeral filters are never empty.
    this.eFiltSet = clone(this.pFiltSet)
  },
  computed: {
    activeClass() {
      if(this.appliedFiltersCount > 0){
        return('btn-primary')
      }
      else {
        return('btn-outline-primary')
      }
    },
    compositeTitle() {
      if( this.appliedFiltersCount > 0 ) {
        return( this.title + ` (${this.appliedFiltersCount})`)
      } else {
        return( this.title )
      }
    },
    appliedFiltersCount() {
      let vals = Object.values(this.pFiltSet)
        .map(g => Object.values(g.members))
        .flat()
        .map(m => m.val)
      let sum = vals.reduce((acc, curr) => acc + curr, 0)
      return(sum)
    },
    nonCollapseFiltSet() {
      return(
        Object.fromEntries(
          Object.entries(this.eFiltSet).filter(e => e[1].collapseable === false))
      )
    },
    collapseFiltSet() {
      return( Object.fromEntries(
        Object.entries(this.eFiltSet).filter(e => e[1].collapseable === true))
      )
    },
    isCollapseFiltSetPresent(){
      return(Object.values(this.eFiltSet).some(g => g.collapseable === true))
    },
    showHideText(){
      return(this.showHidden ? "Show less" : "Show more")
    }
  },
  watch: {
    // When showing the drop down, load the persistent filters.
    showDropDown: function(val){
      if(val){
        this.eFiltSet = clone(this.pFiltSet)
      }
    }
  },
  methods: {
    isEntireGroupTrue: function(filterGroup){
      let verdict = Object.values(filterGroup.members)
        .map(m => m.val)
        .every(v => v)
      return verdict
    },
    filterGroupToArray: function(filterGroup){
      let arr = []
      Object.entries(filterGroup.members).forEach( ([key, content]) => {
        if(content.val === true){
          arr.push({ field: this.fieldVal, type: '=', value: key})
        }
      })
      return(arr)
    },
    filterToArray: function(filter){
      let arr = Object.values(filter)
        .map(g => this.filterGroupToArray(g))
        .flat()
      return(arr)
    },
    emitFilterChange: function (){
      this.$emit('filterChange', this.givenCategory, this.filterToArray(this.pFiltSet))
    },
    applyFilters: function() {
      this.showDropDown = false

      // If selection changed, make ephemeral selection persistent
      if( JSON.stringify(this.pFiltSet) === JSON.stringify(this.eFiltSet)){
        return
      }
      this.pFiltSet = clone(this.eFiltSet)
      this.emitFilterChange()
    },
    setGroupVals: function(filterGroup, val){
      for(let member of Object.values(filterGroup.members)){
        member.val = val
      }
    },
    clearEphemeralFilters: function() {
      for(let group of Object.values(this.eFiltSet)){
        group.allTrue = false
        this.setGroupVals(group, false)
      }
    },
    handleClickAway: function(){
      this.showDropDown = false
    },
    handleGroupToggle: function(group){
      // v-model fires after on click, so eventual value is opposite of observed here.
      // set group to match eventual value
      this.setGroupVals(group, group.allTrue)
    },
    handleMemberToggle: function(member, group){
      group.allTrue = this.isEntireGroupTrue(group)
    }
  }
}
</script>
