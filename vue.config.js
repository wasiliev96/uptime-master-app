module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/uptime/'
    : '/',
  configureWebpack: {
    devServer: {
      headers: {'Access-Control-Allow-Origin': '*'}
    }
  }
};
