const {
  utils: { fromBuildIdentifier },
} = require("@electron-forge/core")

require("dotenv").config()

module.exports = {
  buildIdentifier: process.env.IS_BETA ? "beta" : "prod",
  packagerConfig: {
    appBundleId: fromBuildIdentifier({
      beta: "com.beta.othertodos",
      prod: "com.othertodos",
    }),
    osxSign: {
      identity: process.env.IDENTITY,
      "hardened-runtime": true,
      entitlements: "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "signature-flags": "library",
    },
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    },
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "othertodos",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-pkg",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/index.html",
              js: "./src/renderer.js",
              name: "main_window",
            },
          ],
        },
      },
    ],
  ],
}
