// webpack.config.js
module.exports = {
    // other webpack configuration options
    resolve: {
      fallback: {
        "path": require.resolve("path-browserify")
      }
    }
  };
  