//

export default class BakaMention extends HTMLElement {
  connectedCallback() {
    const observer = new MutationObserver(() => {
      if (this.querySelector("a")) return
      this.update()
    })

    this.update()
  }

  update() {
    const el = document.createElement("a")
    el.href = "#"
    el.title = this.getAttribute("email")
    el.target = "_blank"
    el.innerText = this.innerText
    el.style.color = "var(--brand)"
    el.style.textDecoration = "none"
    el.style.fontWeight = "500"
    this.innerHTML = ""
    this.appendChild(el)
  }
}

customElements.define("baka-mention", BakaMention)
