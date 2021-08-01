//

import { escapeHtml } from "./utils"

export default class Document {
  //    text = 'aabb\nbbaa\n'
  text = "Hello, @(Yegor)[yegorpok@gmail.com] asdfasdf"
  history = []
  historyOffset = -1

  set styles(value) {}

  get styles() {
    return []
  }

  undo() {
    if (this.historyOffset === this.history.length - 1) return
    this.historyOffset += 1
    let item = this.history[this.history.length - this.historyOffset - 1]
    console.log(this.history, this.historyOffset, item)
    switch (item.type) {
      case "insert":
        this.delete(item.start, item.value.length, "back", false)
        break
      case "delete":
        this.insert(item.start, item.value, false)
        break
      case "replace":
        this.replace(
          item.start,
          item.start + item.from.length,
          item.from,
          false,
        )
        break
    }
    this.fireUpdate(item, "undo")
  }

  redo() {
    if (this.historyOffset === 0) return
    this.historyOffset -= 1
    let item = this.history[this.history.length - this.historyOffset - 1]
    console.log(this.history, this.historyOffset, item)
    switch (item.type) {
      case "insert":
        this.insert(item.start, item.value, false)
        break
      case "delete":
        this.delete(item.start, item.n, item.dir, false)
        break
      case "replace":
        this.replace(item.start, item.end, item.value)
        break
    }
    this.fireUpdate(item, "redo")
  }

  // eslint-disable-next-line no-unused-vars
  beforeDelete(start, n) {}

  // eslint-disable-next-line no-unused-vars
  beforeInsert(start, text) {}

  // eslint-disable-next-line no-unused-vars
  mark(styleName, range) {}

  getStylesAtOffset(offset) {
    let styles = {}
    for (let styleName of Object.keys(this.styles)) {
      for (let i = 0; i < this.styles[styleName].ranges.length; i++) {
        let range = this.styles[styleName].ranges[i]
        if (!(range[0] < offset && range[1] >= offset)) continue
        styles[styleName] = range
      }
    }
    return styles
  }

  getStylesAtRange(start, end) {
    let styles = []
    for (let styleName of Object.keys(this.styles)) {
      for (let i = 0; i < this.styles[styleName].ranges.length; i++) {
        let range = this.styles[styleName].ranges[i]
        if (
          !(
            (
              (range[0] >= start && range[0] < end) || // Начало в выделении
              (range[1] > start && range[1] <= end) || // Конец в выделении
              (range[0] <= start && range[1] >= end)
            ) // Выделение между началом и концом
          )
        )
          continue
        styles.push(styleName)
      }
    }
    return styles
  }

  setText(text) {
    const historyItem = { type: "set text", text }
    this.history = [historyItem]
    this.text = text
    this.fireUpdate(historyItem)
  }

  insert(start, value, save = true, update = true) {
    const historyItem = { type: "insert", value, start }
    if (save) {
      this.history.push(historyItem)
      this.historyOffset = -1
    }

    this.beforeInsert(start, value)

    let arr = Array.from(this.text)
    arr.splice(start, 0, value)
    this.text = arr.join("")

    if (update) this.fireUpdate(historyItem)
  }

  replace(start, end, value, save = true, update = true) {
    const historyItem = {
      type: "replace",
      start,
      end,
      from: this.text.slice(start, end),
      to: value,
    }
    if (save) {
      this.history.push(historyItem)
      this.historyOffset = -1
    }
    this.delete(start, end - start, "back", false, false)
    if (value) this.insert(start, value, false, false)
    if (update) this.fireUpdate(historyItem)
  }

  delete(start, n, dir = "back", save = true, update = true) {
    const historyItem = {
      type: "delete",
      n,
      start,
      dir,
      value: this.text.slice(start, start + n),
    }
    if (save) {
      this.history.push(historyItem)
      this.historyOffset = -1
    }

    this.beforeDelete(start, n)

    let arr = Array.from(this.text)
    arr.splice(start, n)
    this.text = arr.join("")

    if (update) this.fireUpdate(historyItem)
  }

  listeners = {}

  addEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
    } else {
      this.listeners[event] = [callback]
    }
  }

  fireUpdate(event, type = "update") {
    const callbacks = this.listeners[type]
    if (!callbacks) return
    callbacks.forEach(callback => callback(event))
  }

  toHtml() {
    if (!this.text.length) return ""
    let allRanges = []
    let lines = [[]]
    let nodes = []
    let result = ""

    for (let styleName of Object.keys(this.styles)) {
      for (let range of this.styles[styleName].ranges) {
        allRanges.push({ style: styleName, range })
      }
    }

    const getStylesAtOffset = offset => {
      return allRanges
        .filter(rangeData => {
          let range = rangeData.range
          return range[0] <= offset && range[1] > offset
        })
        .map(rangeData => rangeData.style)
    }

    const stylesEqual = (a, b) => {
      if (a.length !== b.length) return false
      return !a.filter(el => b.indexOf(el) < 0).length
    }

    let currentNode = {
      styles: getStylesAtOffset(0),
      text: this.text[0],
      start: 0,
      end: 1,
    }
    let currentLine = 0
    for (let i = 1; i < this.text.length; i++) {
      let ch = this.text[i]
      let styles = getStylesAtOffset(i)

      if (stylesEqual(currentNode.styles, styles)) {
        currentNode.end = i
        currentNode.text += ch
        continue
      }

      lines[currentLine].push(currentNode)
      nodes.push(currentNode)
      if (ch === "\n") {
        currentLine++
        lines.push([])
        // continue
      }
      currentNode = {
        styles,
        text: ch,
        start: i,
        end: i + 1,
      }
    }
    lines[currentLine].push(currentNode)
    nodes.push(currentNode)

    const subtractArray = (x, y) => {
      return x.filter(el => y.indexOf(el) < 0)
    }

    const reversed = arr => {
      let myArr = [...arr]
      myArr.reverse()
      return myArr
    }

    const sortedByPriority = (arr, asc = false) => {
      let newArr = [...arr]
      newArr.sort((a, b) => {
        let aPriority = this.styles[a].priority
        let bPriority = this.styles[b].priority
        if (aPriority === undefined) aPriority = 0
        if (bPriority === undefined) bPriority = 0
        return asc ? aPriority - bPriority : bPriority - aPriority
      })
      return newArr
    }

    let activeStyles = new Set()
    for (let node of nodes) {
      const diff = subtractArray([...activeStyles], node.styles)
      const minIndex = diff.reduce((accumulator, styleName) => {
        const index = [...activeStyles].indexOf(styleName)
        if (index < accumulator) return index
      }, activeStyles.size)
      const stylesToClose = reversed(
        [...activeStyles].slice(minIndex, activeStyles.size),
      )
      stylesToClose.forEach(styleName => activeStyles.delete(styleName))

      const stylesToOpen = sortedByPriority(
        subtractArray(node.styles, [...activeStyles]),
      )
      stylesToOpen.forEach(styleName => activeStyles.add(styleName))

      let start = stylesToOpen
        .map(styleName => this.styles[styleName].openTag)
        .join("")
      let prevEnd = stylesToClose
        .map(styleName => this.styles[styleName].closeTag)
        .join("")
      result += prevEnd + start + escapeHtml(node.text)
    }

    result += reversed([...activeStyles])
      .map(styleName => this.styles[styleName].closeTag)
      .join("")

    if (result.endsWith("\n") || result.endsWith("<br/>")) result += "&#8203;"

    result = result.replace(/\r/gm, "")

    return result
  }
}
