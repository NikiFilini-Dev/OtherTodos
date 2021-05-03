const express = require("express")
const path = require("path")
require("dotenv").config()
const app = express()
const port = process.env.PORT || 3000
const fs = require("fs-extra")
const { template } = require("lodash")

app.use("/static", express.static("./web_dist"))
app.use("/public", express.static("./web/public"))

app.get("/", (req, res) => {
  const html = fs.readFileSync(path.resolve("./web/index.html.ejs"), "utf-8")
  const tmpl = template(html)
  const s = tmpl({
    assets: fs.readJsonSync(path.resolve("./web_dist/manifest.json")),
  })
  res.send(s)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
