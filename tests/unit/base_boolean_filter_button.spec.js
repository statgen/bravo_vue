import { expect } from 'chai'
import { config, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'
import clone from 'just-clone';
import {clickOutside} from '@/CustomDirectives'
import BaseBooleanFilterButton from '@/components/filter/BaseBooleanFilterButton.vue'

// Filter buttons rely on custom Vue directive to do show/hide.
config.global.directives = { 'click-outside': clickOutside }

const generateMembers = function(n){
  const nArr = Array.from(Array(n).keys())
  let membersObj = nArr.reduce(
    (acc,curr) => {
      acc['m'+curr]={title: 'Example', desc: 'Lorum ipsum'}; 
      return(acc)},
    {})
  return(membersObj)
}

/* 
 * Fixtures to compose into pFiltSets for testing 
*/
// leave vals for default
const filterGroupOne = {
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
}

// specify some filter members as true by default
const filterGroupTwo = {
  title: "Quality Control Failures",
  members: {
    mainQC: { 
      title: "Main Quality Control", 
      desc: "Failed primary quality control"
    },
    secondary: { 
      title: "Secondary", 
      val: true,
      desc: "Failed Secondary quality control"
    },
    alice: { 
      title: "Project alICE", 
      vale: true,
      desc: "Failed QC for the fictional alICE project"
    }
  }
}

const filterGroupThree = {
  title: "Default True Filter Group",
  members: {
    blue: { title: "Blue", desc: "Is Blue", val: true },
    cyan: { title: "Cyan", desc: "Is Cyan", val: true }
  }
}

// generate a large group of members to be hidden in a collapseable element
const filterGroupHidden = {
  title: "Quality Control Failures",
  collapseable: true,
  members: generateMembers(25)
}

const exFilter = {
  gOne:   filterGroupOne,
  gTwo:   filterGroupTwo,
  gThree: filterGroupThree
}

const exCollapseFilter = {
  gOne:   filterGroupOne,
  gTwo:   filterGroupTwo,
  gHide: filterGroupHidden
}

describe('BaseBooleanFilterButton setup', () => {
  const wrapper = shallowMount(BaseBooleanFilterButton, {
    data() {
      return {pFiltSet: clone(exFilter)}
    }
  })

  it('sets allTrue according to group values', () => {
    expect(wrapper.vm.pFiltSet.gOne.allTrue).to.be.false
    expect(wrapper.vm.pFiltSet.gTwo.allTrue).to.be.false
    expect(wrapper.vm.pFiltSet.gThree.allTrue).to.be.true
  })

  it('defaults collapseable to false', () => {
    let groups = Object.values(wrapper.vm.pFiltSet)
    expect(groups.every( g => g.collapseable == false )).to.be.true
  })

  it('defaults undefined member vals to false', () => {
    let groups = Object.values(wrapper.vm.pFiltSet)
    let allMembers = groups
      .map( g => g.members )
      .flatMap((m) => Object.values(m))

    expect(allMembers.every(m => m.val !== undefined)).to.be.true
  })

  it('clones eFiltSet from pFiltSet when created', () => {
    expect(wrapper.vm.eFiltSet).to.eql(wrapper.vm.pFiltSet)
  })

})

describe('BaseBooleanFilterButton rendering', () => {
  let wrapper = {}

  // Remount so these tests can mutate DOM
  beforeEach(function(){
    wrapper = shallowMount(BaseBooleanFilterButton, {
      data() {
        return {pFiltSet: clone(exFilter)}
      }
    })
  })

  it('shows/hides input form on click', () => {
    expect(wrapper.vm.showDropDown).to.be.false
    expect(wrapper.find('form').exists()).to.be.false

    wrapper.find('button').trigger('click')

    expect(wrapper.vm.showDropDown).to.be.true
    expect(wrapper.find('form').exists()).to.be.false
  })


  it('clones eFiltSet from pFiltSet on dropdown', async () => {
    wrapper.vm.eFiltSet.gOne.members.red.val = true
    expect(wrapper.vm.eFiltSet).to.not.eql(wrapper.vm.pFiltSet)

    wrapper.find('button').trigger('click')
    await nextTick()

    expect(wrapper.vm.eFiltSet).to.eql(wrapper.vm.pFiltSet)
  })

  it('renders groups from pFiltSet data', async () => {
    wrapper.find('button').trigger('click')
    await nextTick()

    let numGroups = Object.values(wrapper.vm.pFiltSet).length
    let numGroupItems = wrapper.findAll('form ul > .custom-checkbox').length

    expect(numGroupItems).to.equal(numGroups)
  })

  it('renders members from pFiltSet data', async () => {
    wrapper.find('button').trigger('click')
    await nextTick()

    let groups = Object.values(wrapper.vm.pFiltSet)
    let numAllMembers = groups
      .map( g => g.members )
      .flatMap((m) => Object.values(m))
      .length

    let numAllListItems = wrapper.findAll('form li').length
    expect(numAllListItems).to.equal(numAllMembers)
  })
})

describe('BaseBooleanFilterButton with collapseable groups', () => {
  let wrapper = {}

  // Remount so these tests can mutate DOM
  beforeEach(function(){
    wrapper = shallowMount(BaseBooleanFilterButton, {
      data() {
        return {pFiltSet: clone(exCollapseFilter)}
      }
    })
  })

  it('computes that there exists a collapseable group', () => {
    expect(wrapper.vm.isCollapseFiltSetPresent).to.be.true
  })

  it('computes an object of collaseable groups only', () => {
    const cfs = wrapper.vm.collapseFiltSet
    const groups = Object.values( cfs )

    expect(cfs).to.be.an('object')
    expect(groups.length).to.equal(1)
  })

  it('computes an object of non-collaseable groups only', () => {
    const fs = wrapper.vm.nonCollapseFiltSet
    const groups = Object.values( fs )

    expect(fs).to.be.an('object')
    expect(groups.length).to.equal(2)
  })

})
