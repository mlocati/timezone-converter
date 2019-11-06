module.exports = {
  publicPath: '',
  outputDir: 'docs',
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      maxEntrypointSize: 2097152,
      maxAssetSize: 2097152
    }
  }
}
