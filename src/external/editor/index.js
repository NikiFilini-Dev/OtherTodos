// @flow

import Document from "./markdown_document"
import Editable from "./editable"
import "./baka_link"

class BakaEditor extends HTMLElement {
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
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="link" class="svg-inline--fa fa-link fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="rgba(0, 0, 255, 0.3)" d="M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z"></path></svg>
                <div class="popup" id="link_popup">
                    <input type="text" placeholder="URL" class="url" />
                    <input type="text" placeholder="Title" class="title" />
                </div>
            </a>
            <a href="#" id="image" tabindex="-1">
                <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="image" class="svg-inline--fa fa-image fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="rgba(0, 0, 255, 0.3)" d="M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 336H54a6 6 0 0 1-6-6V118a6 6 0 0 1 6-6h404a6 6 0 0 1 6 6v276a6 6 0 0 1-6 6zM128 152c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zM96 352h320v-80l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L192 304l-39.515-39.515c-4.686-4.686-12.284-4.686-16.971 0L96 304v48z"></path></svg>
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

  elms: {
    editor: Editable,
    placeholder: HTMLElement,
    wrapper: HTMLElement,
    buttons: {
      [string]: HTMLElement,
    },
    popupButtons: {
      [string]: HTMLElement,
    },
  } = {}

  outputContainer: HTMLElement | void | null
  originalOutputContainer: HTMLElement | void | null

  static get observedAttributes() {
    return ["placeholder", "output", "originaloutput", "debug"]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "debug":
        this.debug = this.getAttribute("debug") !== null
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

    const onPopupButtonClick = (styleName: "link" | "image", e: MouseEvent) => {
      const button = this.elms.popupButtons[styleName]
      const popup = button.querySelector(".popup")
      const urlInput = popup.querySelector("input.url")
      const titleInput = popup.querySelector("input.title")

      if ([popup, urlInput, titleInput].indexOf(e.target) >= 0) {
        e.preventDefault()
        return
      }

      const closePopup = (keydownListener?: () => {}) => {
        urlInput.value = ""
        titleInput.value = ""
        button.classList.remove("active")
        if (keydownListener) {
          urlInput.removeEventListener("keydown", keydownListener)
          titleInput.removeEventListener("keydown", keydownListener)
        }
      }

      const getMarkup = (styleName: "link" | "image") => {
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

    for (let styleName in this.document.styles) {
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
