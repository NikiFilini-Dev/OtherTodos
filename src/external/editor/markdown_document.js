// @flow

import Document from "./document"

// noinspection RegExpRedundantEscape,RegExpSingleCharAlternation
export default class MarkdownDocument extends Document {
  set styles(value: any) {}
  get styles() {
    let ranges: {
      [string]: [number, number][],
    } = {
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
    }

    let text = this.text

    const process = (styleNames, regexp, n) => {
      text.replace(regexp, (fullMatch, match, index) => {
        let start = index + n
        let end = index + fullMatch.length - n
        for (let styleName of styleNames) {
          ranges[styleName].push([start, end])
        }
        ranges.service.push([start - n, start])
        ranges.service.push([end, end + n])
        return match
      })
    }

    const processLinks = () => {
      text.replace(
        /(?<!!)\[([^\n\r\[\]\\]*?)\]\(([^\n\r]+?)\)/gm,
        (fullMatch, title, link, index) => {
          ranges["service"].push([index, index + 1])
          ranges["service"].push([
            index + 1 + title.length,
            index + 1 + title.length + 1,
          ])
          ranges["link_title"].push([index + 1, index + 1 + title.length])

          let linkStart = index + 1 + title.length + 2
          let linkEnd = linkStart + link.length
          ranges["service"].push([linkStart - 1, linkStart])
          ranges["service"].push([linkEnd, linkEnd + 1])
          ranges["link"].push([linkStart, linkEnd])
        },
      )
    }

    const processImages = () => {
      text.replace(
        /\!\[([^\n\r\]\[\\]*?)\]\(([^\n\r]+?)\)/gm,
        (fullMatch, title, link, index) => {
          ranges["service"].push([index, index + 2])
          ranges["service"].push([
            index + 2 + title.length,
            index + 2 + title.length + 1,
          ])
          ranges["image_title"].push([index + 2, index + 2 + title.length])

          let linkStart = index + 2 + title.length + 2
          let linkEnd = linkStart + link.length
          ranges["service"].push([linkStart - 1, linkStart])
          ranges["service"].push([linkEnd, linkEnd + 1])
          ranges["image"].push([linkStart, linkEnd])
        },
      )
    }

    // const replaced_occurrences = []
    const escapeMarkup = (regexp: RegExp, n: number) => {
      text = text.replace(regexp, (full: string, match: string) => {
        return (
          full.slice(0, n) +
          match.replace(/[*`_#~]/gm, "Ɇ") +
          full.slice(full.length - n, full.length)
        )
      })
    }

    escapeMarkup(/```\n([^`]+?)\n```/gm, 4)
    escapeMarkup(
      /(https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gm,
      0,
    )
    escapeMarkup(/(?<!`|\\)`([^`\n\r]+?)`/gm, 1)

    processLinks()
    processImages()

    process(
      ["link"],
      /(?<!\]\()(https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gm,
      0,
    )

    process(["bold"], /(?<!\*|\\\*)\*{2}([^*]+)\*{2}(?!\*|\\)/gm, 2)
    process(["italic"], /(?<!\*|\\)\*([^*]+)(?<!\\|\*)\*/gm, 1)

    process(["bold", "italic"], /(?<!\*|\\)\*{3}([^*]+)\*{3}(?!\*)/gm, 3)

    process(["underline"], /__(.+?)__/gm, 2)
    process(["strike"], /~~(.+?)~~/gm, 2)

    // process(['quote'], /(?<!`|\\)``\n([^`]+?)\n``/gm, 3)
    process(["monospace"], /(?<!`|\\)`([^`\n\r]+?)`/gm, 1)
    // process(['code'], /```\n([^`]+?)\n```/gm, 4)

    // processOneLine(['header_first'], /(?<!#|[^\n])# ([^\r\n]+)/gm, 2)
    // processOneLine(['header_second'], /(?<![^\n])## ([^\r\n#]+)/gm, 3)

    return {
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
      // code: {
      //   openTag: '<span class="code">',
      //   closeTag: "</span>",
      //   ranges: ranges.code,
      //   block: true,
      // },
      // header_first: {
      //   openTag: "<h1>",
      //   closeTag: "</h1>",
      //   ranges: ranges.header_first,
      //   block: true,
      // },
      // header_second: {
      //   openTag: "<h2>",
      //   closeTag: "</h2>",
      //   ranges: ranges.header_second,
      //   block: true,
      // },
      // quote: {
      //   openTag: "<blockquote>",
      //   closeTag: "</blockquote>",
      //   ranges: ranges.quote,
      //   priority: 10,
      //   block: true,
      // },
      link: {
        openTag: '<baka-link class="link">',
        closeTag: "</baka-link>",
        ranges: ranges.link,
      },
      link_title: {
        openTag: '<span class="service_link_title">',
        closeTag: "</span>",
        ranges: ranges.link_title,
      },
      image: {
        openTag: '<baka-link class="image_link">',
        closeTag: "</baka-link>",
        ranges: ranges.image,
      },
      image_title: {
        openTag: '<span class="service_image_title">',
        closeTag: "</span>",
        ranges: ranges.image_title,
      },
      service: {
        openTag: '<span class="service">',
        closeTag: "</span>",
        ranges: ranges.service,
        priority: 150,
      },
    }
  }

  mark(styleName: string, range: [number, number]): number {
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

  getStylesAtOffset(offset: number) {
    let styles: {
      [string]: [number, number],
    } = {}
    for (let styleName of Object.keys(this.styles)) {
      for (let i = 0; i < this.styles[styleName].ranges.length; i++) {
        let range = this.styles[styleName].ranges[i]
        if (!(range[0] <= offset && range[1] >= offset)) continue
        styles[styleName] = range
      }
    }
    return styles
  }

  getStylesAtRange(start: number, end: number) {
    let styles: string[] = []
    for (let styleName of Object.keys(this.styles)) {
      for (let i = 0; i < this.styles[styleName].ranges.length; i++) {
        let range: [number, number] = this.styles[styleName].ranges[i]
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
      /(?<!<span class="service">\]\(<\/span>)<baka-link class="link">(.+)<\/baka-link>/gm,
      (fullMatch, link) => `<a href="${link}" target="_blank">${link}</a>`,
    )

    const link_titles = []
    this.text.replace(
      /(?<!!)\[([^\n\r\]\[]*?)\]\(([^\n\r\(\)]+?)\)/gm,
      (full, title, link) => {
        console.log(title, link)
        link_titles.push(title ? title : link)
      },
    )

    let linkCounter = -1
    html = html.replace(
      /<baka-link class="link">(.+?)<\/baka-link>/gm,
      (full, link) => {
        console.log(full, link)
        linkCounter++
        return `<a href="${link}" target="_blank">${link_titles[linkCounter]}</a>`
      },
    )

    const image_titles = []
    this.text.replace(
      /!\[([^\n\r\[\]]*?)\]\(([^\n\r\(\)]+?)\)/gm,
      (full, title, link) => {
        console.log(title, link)
        image_titles.push(title ? title : "")
      },
    )

    let imageCounter = -1
    html = html.replace(
      /<baka-link class="image_link">(.+)<\/baka-link>/gm,
      (full, link) => {
        console.log(full, link)
        imageCounter++
        return `<img src="${link}" title="${image_titles[imageCounter]}" />`
      },
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
