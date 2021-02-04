const webpack = require("webpack")
const rules = require("./webpack.rules")
const path = require("path")

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
})

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx", ".styl"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
  },
}
