const {
  utils: { fromBuildIdentifier },
} = require("@electron-forge/core")

require("dotenv").config()

module.exports = {
  github_repository: {
    owner: "lunavod",
    name: "OtherTask",
    draft: false,
    prerelease: false,
  },
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
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "lunavod",
          name: "OtherTask",
          draft: false,
          prerelease: false,
        },
        prerelease: false,
        authToken: "23f7b5f8fa36495abe2c0daf2511bf652d1ff606",
      },
    },
  ],
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
