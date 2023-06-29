import { expect } from 'chai'
import { api_url } from '@/ApiUrlResolution'


describe('Api Url Resolution', () => {
  let og_window = Object.assign(global.window, {})

  before(function() {
    global.window = { location: { protocol: 'https:', host: 'example.com'} }
  })

  after(() => {
    global.window = Object.assign(og_window, {})
  });

  // Currently unable to test this as the process.env values are transpiled to
  // literal strings before the js is run.

  // it('uses host when env var API_DOMAIN is empty.', () => {
  //   expect(api_url()).to.equal('https://api.example.com/ui')
  // })

  //it('uses host when API_DOMAIN over host.', () => {
  //  process.env.VUE_APP_BRAVO_API_DOMAIN = 'https://different_api.example.com'
  //  expect(api_url()).to.be('https://different_api.example.com/ui')
  //})
})
