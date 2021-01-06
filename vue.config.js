module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/uptime-front/'
    : '/',
  configureWebpack: {
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*'}
    }
  }
};
