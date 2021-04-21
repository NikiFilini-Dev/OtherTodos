const rules = require("./webpack.rules")
const path = require("path")
const webpack = require("webpack")
const Dotenv = require("dotenv-webpack")

module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main.js",
  // Put your normal webpack config below here
  module: {
    rules: rules,
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      IS_WEB: false,
      API_URL: JSON.stringify(process.env.API_URL),
    }),
    new webpack.ProvidePlugin({
      logger: [path.resolve(__dirname, "src", "tools", "logger.ts"), "logger"],
      createLogger: [
        path.resolve(__dirname, "src", "tools", "logger.ts"),
        "createLogger",
      ],
    }),
  ],
}
