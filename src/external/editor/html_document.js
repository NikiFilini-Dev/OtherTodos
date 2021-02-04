import Document from "./document"

export default class HtmlDocument extends Document {
  styles = {
    bold: {
      openTag: "<b>",
      closeTag: "</b>",
      active: false,
      // ranges: [[2, 7]]
      ranges: [],
    },
    italic: {
      openTag: "<i>",
      closeTag: "</i>",
      // ranges: [[6, 8]]
      ranges: [],
    },
    strike: {
      openTag: "<s>",
      closeTag: "</s>",
      // ranges: [[1, 4]]
      ranges: [],
    },
  }

  mark(styleName, start, end) {
    let i
    let activeRange

    for (i = 0; i < this.styles[styleName].ranges.length; i++) {
      let range = this.styles[styleName].ranges[i]
      if (!(range[0] <= start && range[1] >= start)) continue
      activeRange = range
      break
    }

    if (!activeRange) {
      this.styles[styleName].ranges.push([start, end])
    } else if (activeRange[1] < end) {
      this.styles[styleName].ranges[i][1] = end
    }

    this.fireUpdate({ type: "mark" })
  }

  unmark(styleName, start, end) {
    let activeRanges = []

    for (let i = 0; i < this.styles[styleName].ranges.length; i++) {
      let range = this.styles[styleName].ranges[i]
      if (
        !(
          (
            (range[0] >= start && range[0] <= end) || // Начало в выделении
            (range[1] >= start && range[1] <= end) || // Конец в выделении
            (range[0] <= start && range[1] >= end)
          ) // Выделение между началом и концом
        )
      )
        continue
      activeRanges.push(i)
      break
    }

    for (let i of activeRanges) {
      let range = this.styles[styleName].ranges[i]
      if (range[0] >= start && range[0] <= end && range[1] > end) {
        // Начало в выделении, конец нет
        this.styles[styleName].ranges[i][0] = end
      }

      if (range[1] >= start && range[1] <= end && range[0] < start) {
        // Конец в выделении, начало нет
        this.styles[styleName].ranges[i][1] = start
      }

      if (range[0] >= start && range[1] <= end) {
        this.styles[styleName].ranges.splice(i, 1)
      }
    }
    this.fireUpdate({ type: "mark" })
  }

  beforeInsert(start, value) {
    for (let styleName in this.styles) {
      let ranges = this.styles[styleName].ranges
      for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i]
        if (range[0] >= start)
          this.styles[styleName].ranges[i][0] += value.length
        if (range[1] >= start)
          this.styles[styleName].ranges[i][1] += value.length
      }
    }
  }

  beforeDelete(start, n) {
    for (let styleName in this.styles) {
      let ranges = this.styles[styleName].ranges
      let remove = []
      for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i]

        if (range[0] > start + n) {
          console.log("Selection: After end")
          // Если после конца выделения - сдвинуть назад
          this.styles[styleName].ranges[i][0] -= n
          this.styles[styleName].ranges[i][1] -= n
          continue
        }

        if (range[0] >= start && range[1] <= start + n) {
          console.log("Selection: inside")
          // Если полностью внутри выделения - удалить
          remove.push(i)
          continue
        }

        if (range[0] > start && range[1] > start + n) {
          console.log("Selection: beginning inside, end outside")
          // Если начало внутри выделения, а конец снаружи
          this.styles[styleName].ranges[i][0] = start
          this.styles[styleName].ranges[i][1] = range[1] - n
          continue
        }

        if (range[0] < start && range[1] > start && range[1] < start + n) {
          console.log("Selection: beginning before, end inside")
          // Если начало до выделения, а конец внутри
          this.styles[styleName].ranges[i][1] = start
          continue
        }

        if (range[0] < start && range[1] >= start + n) {
          console.log("Selection: full inside")
          // Если выделение полностью внутри
          this.styles[styleName].ranges[i][1] = range[1] - n
          continue
        }

        if (this.text[this.styles[styleName].ranges[i][1] - 1] === "\n") {
          this.styles[styleName].ranges[i][1] -= 1
        }
      }
      for (let i of remove) {
        this.styles[styleName].ranges.splice(i, 1)
      }
    }
  }
}
