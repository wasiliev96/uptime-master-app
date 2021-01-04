module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/uptime-master-app/'
    : '/',
  configureWebpack: {
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*'}
    }
  }
};
