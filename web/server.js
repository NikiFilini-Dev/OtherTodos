const express = require("express")
const path = require("path")
require("dotenv").config()
const app = express()
const port = process.env.PORT || 3000
const fs = require("fs-extra")
const { template } = require("lodash")
const fetch = require("node-fetch")

app.use("/static", express.static("./web_dist"))
app.use("/public", express.static("./web/public"))

app.get("/", async (req, res) => {
  const manifest = await (
    await fetch("http://localhost:8080/static/manifest.json")
  ).json()
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
