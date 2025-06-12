//Include package version in 
process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
  publicPath: '/',
  pages: {
    home: {
      // entry js for the page
      entry: 'src/pages/home/main.js',
      // the source template
      template: 'src/pages/home/home.html',
      // output as dist/index.html
      filename: 'index.html',
      // when using title option,
      // template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Bravo:Home',
      // chunks to include on this page, by default includes
      // extracted common chunks and vendor chunks.
      chunks: ['chunk-vendors', 'chunk-common', 'home']
    },
    variant: {
      entry: 'src/pages/variant/main.js',
      template: 'src/pages/variant/variant.html',
      title: 'Bravo:Variant',
      chunks: ['chunk-vendors', 'chunk-common', 'variant']
    },
    region: {
      entry: 'src/pages/region/main.js',
      template: 'src/pages/region/region.html',
      title: 'Bravo:Region',
      chunks: ['chunk-vendors', 'chunk-common', 'region']
    },
    gene: {
      entry: 'src/pages/gene/main.js',
      template: 'src/pages/gene/gene.html',
      title: 'Bravo:Gene',
      chunks: ['chunk-vendors', 'chunk-common', 'gene']
    },
    terms: {
      entry: 'src/pages/terms/main.js',
      template: 'src/pages/terms/terms.html',
      title: 'Bravo:Terms',
      chunks: ['chunk-vendors', 'chunk-common', 'terms']
    },
    about: {
      entry: 'src/pages/about/main.js',
      template: 'src/pages/about/about.html',
      title: 'Bravo:About',
      chunks: ['chunk-vendors', 'chunk-common', 'about']
    },
    vcfs: {
      entry: 'src/pages/vcfs/main.js',
      template: 'src/pages/vcfs/vcfs.html',
      title: 'Bravo:VCFs',
      chunks: ['chunk-vendors', 'chunk-common', 'vcfs']
    },
    privacy: {
      entry: 'src/pages/privacy/main.js',
      template: 'src/pages/privacy/privacy.html',
      title: 'Bravo:Privacy',
      chunks: ['chunk-vendors', 'chunk-common', 'privacy']
    },
    login: {
      entry: 'src/pages/login/main.js',
      template: 'src/pages/login/login.html',
      title: 'Bravo:Login',
      chunks: ['chunk-vendors', 'chunk-common', 'login']
    },
    logout: {
      entry: 'src/pages/logout/main.js',
      template: 'src/pages/logout/logout.html',
      title: 'Bravo:Logout',
      chunks: ['chunk-vendors', 'chunk-common', 'logout']
    },
    404: {
      entry: 'src/pages/about/main.js',
      template: 'src/pages/about/terms.html',
      filename: '404.html',
      title: 'Bravo:404',
      chunks: ['chunk-vendors', 'chunk-common', '404']
    },
  },

  outputDir: 'dist',

  devServer: {
    historyApiFallback: false
  },

  lintOnSave: false
}
