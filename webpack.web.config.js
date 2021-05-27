const webpack = require("webpack")
const rules = require("./webpack.rules")
const path = require("path")
const Dotenv = require("dotenv-webpack")
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin")
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")
const WebpackAssetsManifest = require("webpack-assets-manifest")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
})

rules.push({
  test: /\.(otf|eot|ttf|woff|woff2)$/,
  loader: "file-loader",
  query: {
    outputPath: "fonts/",
    publicPath: process.env.WDS_MODE ? "http://localhost:8080/static/fonts/" : "/static/fonts/", // That's the important part
  },
})

module.exports = {
  entry: {
    main: path.resolve(__dirname, "src", "renderer.tsx"),
    sentry: path.resolve(__dirname, "src", "sentry-browser.js"),
  },
  output: {
    path: path.resolve(__dirname, "web_dist"),
    filename: "[name]-[hash].js",
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
      lodash: "lodash-es",
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
    new Dotenv(),
    new webpack.DefinePlugin({
      IS_WEB: true,
      API_URL: JSON.stringify(process.env.API_URL),
    }),
    new webpack.ProvidePlugin({
      logger: [path.resolve(__dirname, "src", "tools", "logger.ts"), "logger"],
      createLogger: [
        path.resolve(__dirname, "src", "tools", "logger.ts"),
        "createLogger",
      ],
    }),
    new LodashModuleReplacementPlugin(),
    new WebpackAssetsManifest({}),
    new CleanWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
  devtool: "eval-source-map",
  optimization: {
    usedExports: true,
    minimizer: [new UglifyJsPlugin()],
    runtimeChunk: "single",
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendor",
          chunks: "initial",
        },
      },
    },
  },
  devServer: {
    contentBase: "./web_dist",
    hot: true,
    transportMode: "ws",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    }
  },
  target: "web",
}
