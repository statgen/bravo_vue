import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import RegionDashboard from '@/components/RegionDashboard.vue'

describe('RegionDashboard components structure.', () => {
  const wrapper = shallowMount(RegionDashboard)

  it('has the dashboard div', () => {
    const bravoViz = wrapper.find('#dashboard')
    expect(bravoViz.exists()).to.be.true
  })

  it('has variant highlighting properties', () => {
    expect(wrapper.componentVM.hoveredVarPosition).to.not.be.undefined
    expect(wrapper.componentVM.visibleVariants).to.not.be.undefined
  })

  it('renames annotation filter field to region specific value on filter change', () => {
    let givenAnno = [
      {field: 'annotation', type: '=', value: 'stop_gained'},
      {field: 'annotation', type: '=', value: 'frameshift'},
      {field: 'annotation', type: '=', value: 'start_retained'}
    ]
    wrapper.vm.handleFilterChange('annotation', givenAnno)

    let storedAnno = wrapper.vm.filter['annotation']
    let fieldVals = storedAnno.map( e => e.field )
    fieldVals.forEach( v => expect(v).to.equal('annotation.region.consequence') )
  })

  it('renames loftee filter field to region specific value on filter change', () => {
    let givenLoftee = [
      {field: 'loftee', type: '=', value: 'HC'},
      {field: 'loftee', type: '=', value: 'LC'}
    ]
    wrapper.vm.handleFilterChange('loftee', givenLoftee)

    let storedLoftee = wrapper.vm.filter['loftee']
    let fieldVals = storedLoftee.map( e => e.field )
    fieldVals.forEach( v => expect(v).to.equal('annotation.region.lof') )
  })
})
