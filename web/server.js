const express = require("express")
const path = require("path")
require("dotenv").config()
const app = express()
const port = process.env.PORT || 3000
const fs = require("fs-extra")
const { template } = require("lodash")
const fetch = require("node-fetch")

const WDS_MODE = process.argv.includes("--wds")
const WDS_HOST = "http://192.168.1.58:8080"

app.use("/static", express.static("./web_dist"))
app.use("/public", express.static("./web/public"))

app.get("/", async (req, res) => {
  let manifest
  if (WDS_MODE) {
    manifest = await (
      await fetch(WDS_HOST+"/static/manifest.json")
    ).json()
    Object.keys(manifest).forEach(key => manifest[key] = `${WDS_HOST}/static/${manifest[key]}`)
  } else {
    manifest = await fs.readJson(path.resolve("./web_dist/manifest.json"))
    Object.keys(manifest).forEach(key => manifest[key] = `/static/${manifest[key]}`)
  }

  const html = fs.readFileSync(path.resolve("./web/index.html.ejs"), "utf-8")
  const tmpl = template(html)
  const s = tmpl({
    assets: manifest,
  })
  res.send(s)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
