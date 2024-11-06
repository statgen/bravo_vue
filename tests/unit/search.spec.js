import { expect } from 'chai'
import sinon from 'sinon'
import { mount, shallowMount } from '@vue/test-utils'
import SearchBox from '@/components/SearchBox.vue'
import axios from 'axios';

// Example search results
import hbbSearch from '../fixtures/search_result_hbb.json'
import rs19392256Search from '../fixtures/search_result_rs19392256.json'
import emptySearch from '../fixtures/search_result_empty.json'

describe('SearchBox.vue components structure.', () => {
  var wrapper
  before(() => {
    wrapper = mount(SearchBox, { 
      shallow: false,
      props: { autofocus: true } 
    })
  })

  it('uses a form', () => {
    const form = wrapper.find('form')
    expect(form.exists()).to.be.true
  })

  it('has an AutoComplete input component', () => {
    const autoc = wrapper.findComponent({name: 'AutoComplete'})
    const input = wrapper.get('input')
    expect(autoc.exists()).to.be.true
    expect(input.exists()).to.be.true
  })

})

describe('SearchBox.vue doSearch.', () => {
  //Avoid changes to window.location and REST requests

  let wrapper 
  let axios_stub

  before(() => {
    sinon.stub(SearchBox.methods, "followResultTicket")
    axios_stub = sinon.stub(axios, 'get')

    wrapper = mount(SearchBox, { 
      shallow: true,
      props: { autofocus: true } 
    })

    sinon.spy(wrapper.vm, 'suggestToResultTicket')
    sinon.spy(wrapper.vm, 'queryToResultTicket')
  })

  beforeEach(() => {
    sinon.resetHistory()
  })

  after(() => {
    SearchBox.methods.followResultTicket.restore()
    axios.get.restore()
  })

  
  it('Uses autocomplete suggests result', async () => {
    axios_stub.resolves(hbbSearch)
    wrapper.vm.$refs.autocomplete.qtext = 'hbb'

    await wrapper.vm.doSearch()
    expect(wrapper.vm.suggestToResultTicket.called).to.be.true
    expect(wrapper.vm.queryToResultTicket.called).to.be.false
  })

  it('Lacking a suggestion, matches query to pattern', async () => {
    axios_stub.resolves(emptySearch)
    wrapper.vm.$refs.autocomplete.qtext = '11-5002000-5003000'

    await wrapper.vm.doSearch()
    expect(wrapper.vm.suggestToResultTicket.called).to.be.false
    expect(wrapper.vm.queryToResultTicket.called).to.be.true
  })

})

describe('SearchBox.vue queryToResultTicket parsing.', () => {

  // Instantiate component once only to access the methods
  const wrapper = shallowMount(SearchBox, { props: { autofocus: true } })

  const testFun = ({input, expected}) =>
    function () {
      const result = wrapper.vm.queryToResultTicket(input);
      expect(result.endpoint).to.equal(expected)
    };

  // Test variant queries
  it('handles chr11:10,500,100-A-T', testFun({input: 'chr11:10,500,100-A-T', expected: 'variant'}));
  it('handles chr11:10500100-A-T',   testFun({input: 'chr11:10500100-A-T',   expected: 'variant'}));
  it('handles chr11 10500100 A T',   testFun({input: 'chr11 10500100 A T',   expected: 'variant'}));
  it('handles 11:10,500,100-A-T',    testFun({input: 'chr11 10500100 A T',   expected: 'variant'}));
  it('handles 11:10500100-A-T',      testFun({input: 'chr11 10500100 A T',   expected: 'variant'}));
  it('handles 11 10500100 A T',      testFun({input: 'chr11 10500100 A T',   expected: 'variant'}));

  it('handles 11:10500100 - A - T',  testFun({input: '11:10500100 - A - T', expected: 'variant'}));
  it('handles 11 10500100- A- T',    testFun({input: '11 10500100- A- T',   expected: 'variant'}));
  it('handles 11 10500100 -A -T',    testFun({input: '11 10500100 -A -T',   expected: 'variant'}));

  // Test empty queires
  it("handles ''",      testFun({input: '',        expected: 'notfound'}));
  it("handles '     '", testFun({input: '     ',   expected: 'notfound'}));
  it("handles ',,   '", testFun({input: ',,   ',   expected: 'notfound'}));


  // Test variant queires
  it('tickets a dbSNP reference query with endpoint: variant', () => {
    const rsid_result = wrapper.vm.queryToResultTicket('rs12345678')
    expect(rsid_result.endpoint).to.equal('variant')
  })

  // Test region queries
  it('chr11:10,500,100-10,503,000', testFun({input: 'chr11:10,500,100-10,503,000', expected: 'region'}));
  it('chr11:10500100-10,503,000',   testFun({input: 'chr11:10500100-10,503,000',   expected: 'region'}));
  it('chr11:10500100-10503000',     testFun({input: 'chr11:10500100-10503000',     expected: 'region'}));
  it('chr11 10500100 10503000',     testFun({input: 'chr11 10500100 10503000',     expected: 'region'}));
  it('chr11:10500100 -10503000',    testFun({input: 'chr11:10500100-10503000',     expected: 'region'}));
  it('chr11: 10500100 - 10503000',  testFun({input: 'chr11:10500100-10503000',     expected: 'region'}));
  it('11 10500100 10503000',        testFun({input: 'chr11 10500100 10503000',     expected: 'region'}));
  it('9 10500100 10503000',         testFun({input: 'chr11 10500100 10503000',     expected: 'region'}));
  it('X 10500100 10503000',         testFun({input: 'chr11 10500100 10503000',     expected: 'region'}));

  // Test default query
  it('defaults to ticket query with endpoint: notFound', () => {
    const range_result = wrapper.vm.queryToResultTicket('foobar')
    expect(range_result.endpoint).to.equal('notfound')
  })
})

describe('SearchBox.vue query route result via resultTicketToHref', () => {
  /*
   * Cannot directly verify window.location.href is set as expected.
   * jsdom does not implment nor handle location changes 
   *   e.g.: window.location.href = 'http://example.com'
   *
   * Error: Not implemented: navigation (except hash changes)
   * at module.exports (.../node_modules/jsdom/lib/jsdom/browser/not-implemented.js:9:17)
   * at navigateFetch (.../node_modules/jsdom/lib/jsdom/living/window/navigation.js:77:3)
  */

  // Instantiate component once only to access the methods
  const wrapper = shallowMount(SearchBox, { props: { autofocus: true } })

  it('Uses endpoint as the base href', () => {
    const ticket = {endpoint: 'foo'}
    const href_result = wrapper.vm.resultTicketToHref(ticket)

    expect(href_result).to.equal('foo.html')
  })

  it('URL encodes and appends other ticket properties ', () => {
    const ticket = {endpoint: 'foo', geneName: 'duq', }
    const href_result = wrapper.vm.resultTicketToHref(ticket)

    expect(href_result).to.contain('foo.html?')
    expect(href_result).to.contain('geneName=duq')
  })
})

describe('SearchBox.vue suggestion routing', () => {
  // representative responses from api autocomplete endpoint
  const rsid_suggest = {
    "data": {
      "feature": "snv",
      "type": "missense_variant",
      "variant_id": "8-19959376-A-G"
    },
    "value": "rs300"
  }

  const gene_suggest = {
    "data": {
      "chrom": "11",
      "feature": "gene",
      "start": 5225464,
      "stop": 5229395,
      "type": "protein_coding"
    },
    "value": "HBB"
  }
  
  // Instantiate component once only to access the methods
  const wrapper = shallowMount(SearchBox, { props: { autofocus: true } })

  it('Converts suggestion feature to result ticket', () => {
    const result = wrapper.vm.suggestToResultTicket(gene_suggest);

    expect(result).to.have.property('endpoint');
    expect(result.endpoint).to.equal(gene_suggest.data.feature);
  })

  it('Maps snv suggestion feature to endpoint: variant', () => {
    const result = wrapper.vm.suggestToResultTicket(rsid_suggest);

    expect(result.endpoint).to.equal('variant');
    expect(result.chrom).to.equal('8');
    expect(result.pos).to.equal('19959376');
    expect(result.ref).to.equal('A');
    expect(result.alt).to.equal('G');
  })
})
