// noinspection WebpackConfigHighlighting
module.exports = [
  // Add support for native node modules
  {
    test: /\.node$/,
    use: "node-loader",
  },
  {
    test: /\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: "@marshallofsound/webpack-asset-relocator-loader",
      options: {
        outputAssetBase: "native_modules",
      },
    },
  },
  {
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  },
  {
    test: /\.(m?js|jsx)$/,
    exclude: /(node_modules|bower_components)/,
    use: {
      loader: "babel-loader",
      options: {
        presets: [
          "@babel/preset-flow",
          [
            "@babel/preset-react",
            {
              runtime: "automatic",
            },
          ],
        ],
        plugins: [
          "@babel/plugin-proposal-class-properties",
          "@babel/plugin-proposal-optional-chaining",
          "react-hot-loader/babel",
        ],
      },
    },
  },
  {
    test: /\.styl$/,
    use: [
      {
        loader: "style-loader",
      },
      "@teamsupercell/typings-for-css-modules-loader",
      {
        loader: "css-loader",
        options: {
          modules: {
            localIdentName: "[path][name]__[local]--[hash:base64:5]",
          },
        },
      },
      {
        loader: "stylus-loader",
      },
    ],
  },
  {
    test: /\.svg$/,
    use: [
      {
        loader: "react-svg-loader",
        options: {
          limit: 10000,
        },
      },
    ],
  },
  {
    test: /\.(png|woff|woff2|eot|ttf)$/,
    loader: "url-loader?limit=100000",
  },
  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /**
   * Typescript Example:
   *
   */
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|.webpack)/,
    loaders: [
      {
        loader: "ts-loader",
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
]
