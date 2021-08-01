//

import Document from "./document"

// noinspection RegExpRedundantEscape,RegExpSingleCharAlternation
export default class MarkdownDocument extends Document {
  set styles(value) {}

  get styles() {
    let ranges = {
      bold: [],
      italic: [],
      underline: [],
      strike: [],
      monospace: [],
      header_first: [],
      header_second: [],
      code: [],
      quote: [],
      service: [],
      link: [],
      image: [],
      image_title: [],
      link_title: [],
      mention_name: [],
      mention_email: [],
    }

    let text = this.text

    const process = (styleNames, regexp, n) => {
      text.replace(regexp, (fullMatch, match, index) => {
        let start = index + n + 1
        let end = index + fullMatch.length - n - 1
        for (let styleName of styleNames) {
          ranges[styleName].push([start, end])
        }
        ranges.service.push([start - n, start])
        ranges.service.push([end, end + n])
        return match
      })
    }

    const processMentions = () => {
      const regexp = /@\((.+?)\)\[(.+?)\]/gm
      text.replace(regexp, (fullMatch, name, email, index) => {
        console.log(fullMatch, name, email, index)
        const nameStart = index + 2
        ranges.service.push([index, nameStart])

        const emailStart = nameStart + name.length + 2
        ranges.service.push([nameStart + name.length, emailStart])

        ranges.service.push([
          emailStart + email.length,
          emailStart + email.length + 1,
        ])
        ranges.mention_name.push([nameStart, nameStart + name.length])
        ranges.mention_email.push([emailStart, emailStart + email.length])

        return fullMatch
      })
    }

    processMentions()

    // const replaced_occurrences = []
    const escapeMarkup = (regexp, n) => {
      text = text.replace(regexp, (full, match) => {
        return (
          full.slice(0, n) +
          match.replace(/[*`_#~]/gm, "Ɇ") +
          full.slice(full.length - n, full.length)
        )
      })
    }
    escapeMarkup(/`([^`\n\r]+?)`/gm, 1)

    process(
      ["link"],
      /(https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gm,
      -1,
    )

    process(["bold", "italic"], /\*{3}([^*]+)\*{3}/gm, 3)

    process(["bold"], /[^*]\*{2}([^*]+)\*{2}[^*]/gm, 2)
    process(["bold"], /^\*{2}([^*]+)\*{2}/gm, 2)

    process(["italic"], /[^*]\*([^*]+)\*[^*]/gm, 1)
    process(["italic"], /^\*([^*]+)\*/gm, 1)

    process(["underline"], /__(.+?)__/gm, 2)
    process(["strike"], /~~(.+?)~~/gm, 2)
    //
    process(["monospace"], /`([^`\n\r]+?)`/gm, 1)

    return {
      mention_name: {
        openTag: "<span class='mention_name'>",
        closeTag: "</span>",
        ranges: ranges.mention_name,
      },
      mention_email: {
        openTag: "<span class='mention_email'>",
        closeTag: "</span>",
        ranges: ranges.mention_email,
      },
      bold: {
        openTag: "<b>",
        closeTag: "</b>",
        ranges: ranges.bold,
      },
      italic: {
        openTag: "<i>",
        closeTag: "</i>",
        ranges: ranges.italic,
      },
      underline: {
        openTag: "<u>",
        closeTag: "</u>",
        ranges: ranges.underline,
      },
      strike: {
        openTag: "<s>",
        closeTag: "</s>",
        ranges: ranges.strike,
      },
      monospace: {
        openTag: '<span class="monospace">',
        closeTag: "</span>",
        ranges: ranges.monospace,
      },
      link: {
        openTag: '<baka-link class="link">',
        closeTag: "</baka-link>",
        ranges: ranges.link,
      },
      service: {
        openTag: '<span class="service">',
        closeTag: "</span>",
        ranges: ranges.service,
        priority: 150,
      },
    }
  }

  mark(styleName, range) {
    let before = "",
      start = "",
      end = ""
    if (range[0] > 0 && this.text[range[0] - 1] !== "\n") before = "\n"
    switch (styleName) {
      case "bold":
        start = "**"
        end = "**"
        break
      case "italic":
        start = "*"
        end = "*"
        break
      case "underline":
        start = "__"
        end = "__"
        break
      case "strike":
        start = "~~"
        end = "~~"
        break
      case "monospace":
        start = "`"
        end = "`"
        break
      case "quote":
        start = before + "``\n"
        end = "\n``\n"
        break
      case "code":
        start = before + "```\n"
        end = "\n```\n"
        break
      case "header_first":
        start = before + "# "
        end = "\n"
        break
      case "header_second":
        start = before + "## "
        end = "\n"
        break
    }

    this.insert(range[0], start)
    this.insert(range[1] + start.length, end)
    return range[1] + start.length
  }

  getStylesAtOffset(offset) {
    let styles = {}
    for (let styleName of Object.keys(this.styles)) {
      for (let i = 0; i < this.styles[styleName].ranges.length; i++) {
        let range = this.styles[styleName].ranges[i]
        if (!(range[0] <= offset && range[1] >= offset)) continue
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
              (range[0] >= start && range[0] <= end) || // Начало в выделении
              (range[1] >= start && range[1] <= end) || // Конец в выделении
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

  getFinalHtml() {
    let html = this.toHtml()

    html = html.replace(
      /<baka-link class="link">(.+)<\/baka-link>/gm,
      (fullMatch, link) => `<a href="${link}" target="_blank">${link}</a>`,
    )

    html = html.replace(
      /<span class=["']service["']>@\(<\/span><span class=["']mention_name["']>(.+?)<\/span><span class=["']service["']>\)\[<\/span><span class=["']mention_email["']>(.+?)<\/span><span class=["']service["']>\]<\/span>/gm,
      (fullMatch, name, email) =>
        `<baka-mention email="${email}">@${name}</baka-mention>`,
    )

    html = html.replace(/\\\*/gm, "*")
    html = html.replace(/\\`/gm, "`")
    html = html.replace(/\\_/gm, "_")
    html = html.replace(/\\#/gm, "#")
    html = html.replace(/\\~/gm, "~")

    html = html.replace(/\n/gm, "<br/>\n").replace(/\r/gm, "")

    html = html.replace(
      /<span class=["']service[_]*.*?["']>(.+?)<\/span>/gm,
      "",
    )

    Object.keys(this.styles).forEach(styleName => {
      const style = this.styles[styleName]
      if (!style.block) return
      html = html.replace(
        new RegExp(
          `${style.openTag}(.+)${style.closeTag.replace("/", "\\/")}<br\\/>`,
          "gm",
        ),
        `${style.openTag}$1${style.closeTag}`,
      )
    })

    return html
  }
}
