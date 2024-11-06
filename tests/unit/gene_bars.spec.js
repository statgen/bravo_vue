import { expect } from 'chai'
import { mount, shallowMount } from '@vue/test-utils'
import GeneSegments from '@/components/GeneSegments.vue'
import sinon from 'sinon'
import axios from 'axios';

import regionGenes from '../fixtures/genes_in_region.json'

describe('GeneSegments Mounted.', () => {

  let wrapper 

  before(() => {
		const axiosStub = sinon.stub(axios, 'get')
    axiosStub.resolves(regionGenes)
    wrapper = mount(GeneSegments, { shallow: true })
  })

  it('contins a SegBar component', () => {
    const bars = wrapper.find("#geneSegBars")
    console.log(bars)
    expect(bars.exists()).to.be.true
  })

  after(() => { 
    axios.get.restore()
  })
})
