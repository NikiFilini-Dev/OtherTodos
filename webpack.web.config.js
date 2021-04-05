const webpack = require("webpack")
const rules = require("./webpack.rules")
const path = require("path")

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
})

module.exports = {
  entry: path.resolve(__dirname, "src", "renderer.js"),
  output: {
    path: path.resolve(__dirname, "web_dist"),
  },
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx", ".styl"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    alias: {
      electron: path.resolve(__dirname, "web", "mocks", "electron.js"),
      "tools/jsonStorage": path.resolve(
        __dirname,
        "web",
        "mocks",
        "jsonStorage.js",
      ),
    },
  },
  node: {
    fs: "empty",
  },
  plugins: [
    new webpack.DefinePlugin({
      IS_WEB: true,
    }),
  ],
  devtool: "eval-source-map",
}
