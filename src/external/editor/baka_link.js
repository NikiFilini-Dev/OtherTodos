// @flow

export default class BakaLink extends HTMLElement {
  connectedCallback(): void {
    const observer = new MutationObserver(mutations => {
      if (this.querySelector("a")) return
      this.update()
    })

    this.ctrlPressed = false
    document.addEventListener("keydown", e => {
      if (e.key === "Meta") this.ctrlPressed = true
    })
    document.addEventListener("keyup", e => {
      if (e.key === "Meta") this.ctrlPressed = false
    })

    observer.observe(this, { childList: true })

    this.update()
  }

  update() {
    const el = document.createElement("a")
    el.href = this.innerText
    el.target = "_blank"
    el.innerText = this.innerText
    el.addEventListener("click", () => {
      if (!this.ctrlPressed) return
      require("electron").shell.openExternal(el.href)
      this.ctrlPressed = false
    })
    this.innerHTML = ""
    this.appendChild(el)
  }
}

customElements.define("baka-link", BakaLink)
