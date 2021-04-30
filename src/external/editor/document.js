// @flow

import { escapeHtml } from "./utils"

type InsertEvent = {
  type: "insert",
  start: number,
  value: string,
}

type DeleteEvent = {
  type: "delete",
  start: number,
  n: number,
  value: string,
  dir: "back" | "forward",
}

type ReplaceEvent = {
  type: "replace",
  start: number,
  end: number,
  from: string,
  to: string,
}

type SetTextEvent = {
  type: "set text",
  text: string,
}

type MyNode = {
  styles: string[],
  text: string,
  start: number,
  end: number,
}

export interface IO {
  text: string;
  styles: {
    [string]: {
      openTag: string,
      closeTag: string,
      ranges: [[number, number]],
    },
  };

  history: Array<InsertEvent | DeleteEvent | SetTextEvent | ReplaceEvent>;
  addEventListener: (
    event: string,
    item: InsertEvent | DeleteEvent | SetTextEvent | ReplaceEvent,
  ) => {};

  undo(): void;

  redo(): void;

  delete(start: number, n: number, direction?: string): void;

  insert(start: number, text: string): void;

  replace(start: number, end: number, text: string): void;

  mark(styleName: string, range: [number, number]): number;

  toHtml(): string;
}

export default class Document {
  //    text = 'aabb\nbbaa\n'
  text = ""
  history: Array<InsertEvent | DeleteEvent | SetTextEvent | ReplaceEvent> = []
  historyOffset = -1

  set styles(value: any) {}
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
  beforeDelete(start: number, n: number) {}

  // eslint-disable-next-line no-unused-vars
  beforeInsert(start: number, text: string) {}

  // eslint-disable-next-line no-unused-vars
  mark(styleName: string, range: [number, number]): number {}

  getStylesAtOffset(offset: number) {
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

  getStylesAtRange(start: number, end: number) {
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
    const historyItem: SetTextEvent = { type: "set text", text }
    this.history = [historyItem]
    this.text = text
    this.fireUpdate(historyItem)
  }

  insert(start: number, value: string, save = true, update = true): void {
    const historyItem: InsertEvent = { type: "insert", value, start }
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

  replace(
    start: number,
    end: number,
    value: string,
    save = true,
    update = true,
  ): void {
    const historyItem: ReplaceEvent = {
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

  delete(
    start: number,
    n: number,
    dir: "back" | "forward" = "back",
    save = true,
    update = true,
  ) {
    const historyItem: DeleteEvent = {
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

  listeners: { [string]: Array<(event: mixed) => void> } = {}

  addEventListener(event: string, callback: (event: mixed) => void): void {
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
    } else {
      this.listeners[event] = [callback]
    }
  }

  fireUpdate(event: mixed, type = "update"): void {
    const callbacks = this.listeners[type]
    if (!callbacks) return
    callbacks.forEach(callback => callback(event))
  }

  toHtml(): string {
    if (!this.text.length) return ""
    let allRanges: Array<{ style: string, range: [number, number] }> = []
    let lines = [[]]
    let nodes: Array<MyNode> = []
    let result = ""

    for (let styleName of Object.keys(this.styles)) {
      for (let range of this.styles[styleName].ranges) {
        allRanges.push({ style: styleName, range })
      }
    }

    const getStylesAtOffset = (offset: number): string[] => {
      return allRanges
        .filter(rangeData => {
          let range = rangeData.range
          return range[0] <= offset && range[1] > offset
        })
        .map(rangeData => rangeData.style)
    }

    const stylesEqual = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false
      return !a.filter(el => b.indexOf(el) < 0).length
    }

    let currentNode: MyNode = {
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

    const sortedByPriority = (arr: Array<string>, asc = false) => {
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
