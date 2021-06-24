//

export default class BakaLink extends HTMLElement {
  connectedCallback() {
    const observer = new MutationObserver(() => {
      if (this.querySelector("a")) return
      this.update()
    })

    this.ctrlPressed = false
    document.addEventListener("keydown", e => {
      if (e.key === "Meta" || e.key === "Control") this.ctrlPressed = true
    })
    document.addEventListener("keyup", e => {
      if (e.key === "Meta" || e.key === "Control") this.ctrlPressed = false
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
      if (this.ctrlPressed) return
      if (!IS_WEB) {
        require("electron").shell.openExternal(el.href)
      } else {
        window.open(el.href)
      }

      this.ctrlPressed = false
    })
    this.innerHTML = ""
    this.appendChild(el)
  }
}

customElements.define("baka-link", BakaLink)
