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
  builderConfig: {
    gatekeeperAssess: false,
  },
  packagerConfig: {
    icon: "icons/icon",
    appBundleId: fromBuildIdentifier({
      beta: "com.beta.othertodos",
      prod: "com.othertodos",
    }),
    ignore: function (path) {
      return path && path !== "/package.json" && !path.startsWith("/.webpack")
    },
    osxSign: {
      identity: process.env.APPLE_IDENTITY,
      "hardened-runtime": true,
      entitlements: "entitlements.plist",
      "entitlements-inherit": "entitlements.plist",
      "signature-flags": "library",
      "gatekeeper-assess": false,
    },
    gatekeeperAssess: false,
    osxNotarize: {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
    },
  },
  publishers: [
    {
      name: "@electron-forge/publisher-nucleus",
      config: {
        host: process.env.NUCLEUS_HOST,
        appId: process.env.NUCLEUS_APP_ID,
        channelId: process.env.NUCLEUS_CHANNEL_ID,
        token: process.env.NUCLEUS_TOKEN,
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
              js: "./src/renderer.tsx",
              name: "main_window",
            },
          ],
        },
      },
    ],
  ],
}
