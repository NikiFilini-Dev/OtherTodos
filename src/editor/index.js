//

import Document from "./markdown_document"
import Editable from "./editable"
import "./baka_link"
import { noop } from "lodash-es"

noop("baka-editable", Editable)

export default class BakaEditor extends HTMLElement {
  template = `<div id="wrapper">
        <div id="buttons">
            <a href="#" id="bold" tabindex="-1">B</a>
            <a href="#" id="italic" tabindex="-1">I</a>
            <a href="#" id="strike" tabindex="-1">S</a>
            <a href="#" id="underline" tabindex="-1">U</a>
            <a href="#" id="monospace" tabindex="-1">M</a>
            <a href="#" id="quote" tabindex="-1">&laquo;&raquo;</a>
            <a href="#" id="code" tabindex="-1">&lt;/&gt;</a>
            <a href="#" id="header_first" tabindex="-1">H1</a>
            <a href="#" id="header_second" tabindex="-1">H2</a>
            <div class="delimiter"></div>
            <a href="#" id="link" tabindex="-1">
                <div class="popup" id="link_popup">
                    <input type="text" placeholder="URL" class="url" />
                    <input type="text" placeholder="Title" class="title" />
                </div>
            </a>
            <a href="#" id="image" tabindex="-1">
                <div class="popup" id="link_popup">
                    <input type="text" placeholder="URL" class="url" />
                    <input type="text" placeholder="Title" class="title" />
                </div>
            </a>
            
        </div>
        <div id="placeholder">Type: Echo!</div>
        <baka-editable id="editor" />
    </div>`

  debug = false

  elms = {}

  outputContainer
  originalOutputContainer

  static get observedAttributes() {
    return ["placeholder", "output", "originaloutput", "debug"]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "debug":
        this.debug = this.getAttribute("debug") !== null
        break
      case "placeholder":
        if (!this.elms.placeholder) break
        this.elms.placeholder.innerHTML = newValue
        break
      case "output":
        this.outputContainer = document.querySelector(
          this.getAttribute("output"),
        )
        break
      case "originaloutput":
        this.originalOutputContainer = document.querySelector(
          this.getAttribute("originaloutput"),
        )
        break
    }
  }

  connectedCallback() {
    this.innerHTML = this.template

    this.debug = this.getAttribute("debug") !== null

    this.outputContainer = document.querySelector(this.getAttribute("output"))

    this.elms.wrapper = this.querySelector("#wrapper")
    this.elms.editor = this.querySelector("#editor")

    this.elms.placeholder = this.querySelector("#placeholder")
    if (this.getAttribute("placeholder"))
      this.elms.placeholder.innerHTML = this.getAttribute("placeholder")

    this.document = new Document()
    this.document.addEventListener("update", this.onTextUpdate.bind(this))
    this.document.addEventListener("update", this.logger.bind(this))

    this.updatePlaceholder()
    this.initEditor()
    this.initButtons()

    this.logger({ type: "INIT" })
  }

  initButtons() {
    this.elms.buttons = {
      wrapper: this.elms.wrapper.querySelector("#buttons"),
      bold: this.elms.wrapper.querySelector("#buttons #bold"),
      italic: this.elms.wrapper.querySelector("#buttons #italic"),
      strike: this.elms.wrapper.querySelector("#buttons #strike"),
      underline: this.elms.wrapper.querySelector("#buttons #underline"),
      monospace: this.elms.wrapper.querySelector("#buttons #monospace"),
      quote: this.elms.wrapper.querySelector("#buttons #quote"),
      code: this.elms.wrapper.querySelector("#buttons #code"),
      header_first: this.elms.wrapper.querySelector("#buttons #header_first"),
      header_second: this.elms.wrapper.querySelector("#buttons #header_second"),
    }

    this.elms.popupButtons = {
      link: this.elms.wrapper.querySelector("#buttons #link"),
      image: this.elms.wrapper.querySelector("#buttons #image"),
    }

    const onPopupButtonClick = (styleName, e) => {
      const button = this.elms.popupButtons[styleName]
      const popup = button.querySelector(".popup")
      const urlInput = popup.querySelector("input.url")
      const titleInput = popup.querySelector("input.title")

      if ([popup, urlInput, titleInput].indexOf(e.target) >= 0) {
        e.preventDefault()
        return
      }

      const closePopup = keydownListener => {
        urlInput.value = ""
        titleInput.value = ""
        button.classList.remove("active")
        if (keydownListener) {
          urlInput.removeEventListener("keydown", keydownListener)
          titleInput.removeEventListener("keydown", keydownListener)
        }
      }

      const getMarkup = styleName => {
        if (styleName === "link") {
          return `[${titleInput.value}](${urlInput.value})`
        }

        return `![${titleInput.value}](${urlInput.value})`
      }

      const onKeydown = e => {
        if (e.key === "Escape") {
          e.preventDefault()
          closePopup()
          return
        }

        if (e.key !== "Enter") {
          return
        }

        e.preventDefault()

        const markup = getMarkup(styleName)
        this.document.insert(this.elms.editor.cursorPos, markup)

        this.elms.editor.focus()
        this.elms.editor.setCursorPos(
          this.elms.editor.cursorPos + markup.length,
        )

        closePopup(onKeydown)
      }

      const onDocumentClick = e => {
        document.removeEventListener("click", onDocumentClick)

        if (
          [button, [...button.querySelectorAll("*")]]
            .flat(Infinity)
            .indexOf(e.target) >= 0
        )
          return

        closePopup(onKeydown)
      }

      document.addEventListener("click", onDocumentClick)

      button.classList.toggle("active")

      if (!button.classList.contains("active")) {
        urlInput.value = ""
        titleInput.value = ""
        return
      }

      urlInput.focus()

      urlInput.addEventListener("keydown", onKeydown)
      titleInput.addEventListener("keydown", onKeydown)
    }

    this.elms.popupButtons["link"].addEventListener("click", e =>
      onPopupButtonClick("link", e),
    )
    this.elms.popupButtons["image"].addEventListener("click", e =>
      onPopupButtonClick("image", e),
    )

    const onButtonClick = (styleName, e) => {
      e.preventDefault()
      this.elms.editor.focus()

      const range = this.elms.editor.getSelection()
      this.elms.editor.setCursorPos(
        this.document.mark(styleName, [range.startOffset, range.endOffset]),
      )
    }

    for (let styleName in Object.keys(this.document.styles)) {
      if (!(styleName in this.elms.buttons)) continue
      this.elms.buttons[styleName].addEventListener("click", e =>
        onButtonClick(styleName, e),
      )
    }
  }

  logger(historyEvent) {
    if (!this.debug) return
    console.log(
      "\n%cFired event %s\n%c%s\n%s\n%c%s\n%s%o\n%s%o\n",
      ["font-weight: bold", "margin-bottom: 6px"].join(";"),
      historyEvent.type.toUpperCase(),
      ["color: rgba(0,0,0,1)", "padding-bottom: 6px"].join(";"),
      this.document.text.slice(0, this.elms.editor.cursorPos) +
        "][" +
        this.document.text.slice(
          this.elms.editor.cursorPos,
          this.document.text.length,
        ),
      this.document.toHtml(),
      ["color: rgba(0,0,0,.9)", "line-height: 1.4em"].join(";"),
      `Document length: ${this.document.text.length}; Cursor position: ${this.elms.editor.cursorPos}`,
      "Event details:",
      historyEvent,
      "Styles:",
      this.document.styles,
    )
  }

  setText(text) {
    this.elms.editor.cursorPos = 0
    this.document.setText(text)
  }

  onTextUpdate() {
    this.updatePlaceholder()

    this.elms.editor.innerHTML = this.document.toHtml()
    if (this.outputContainer)
      this.outputContainer.value = this.document.getFinalHtml()
    if (this.originalOutputContainer)
      this.originalOutputContainer.value = this.document.text

    this.elms.editor.setCursorPos(this.elms.editor.cursorPos)

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          original: this.document.text,
          html: this.document.getFinalHtml(),
        },
      }),
    )
  }

  updatePlaceholder() {
    if (this.document.text.length) {
      this.elms.placeholder.classList.add("invisible")
    } else {
      this.elms.placeholder.classList.remove("invisible")
    }
  }

  initEditor() {
    this.elms.editor.initIO(this.document)
  }
}

customElements.define("baka-editor", BakaEditor)
