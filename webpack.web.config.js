const webpack = require("webpack")
const rules = require("./webpack.rules")
const path = require("path")

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
})

module.exports = {
  entry: path.resolve(__dirname, "src", "renderer.tsx"),
  output: {
    path: path.resolve(__dirname, "web_dist"),
    publicPath: "/static/",
  },
  // Put your normal webpack config below here
  module: {
    rules,
  },
  resolve: {
    extensions: [".js", ".jsx", ".styl", ".ts", ".tsx"],
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
    new webpack.ProvidePlugin({
      logger: [path.resolve(__dirname, "src", "tools", "logger.ts"), "logger"],
      createLogger: [
        path.resolve(__dirname, "src", "tools", "logger.ts"),
        "createLogger",
      ],
    }),
  ],
  devtool: "eval-source-map",
}
