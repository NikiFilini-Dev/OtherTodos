import React from "react"

export function useClick(target, callback) {
  React.useEffect(() => {
    target.addEventListener("click", callback)
    return () => target.removeEventListener("click", callback)
  })
}

export function useClickOutsideRef(ref, callback) {
  useClick(document, e => {
    if (
      ref.current &&
      ref.current !== e.target &&
      !ref.current.contains(e.target)
    )
      callback()
  })
}

export function useFloatMenu(ref) {
  if (!ref) ref = React.useRef(null)
  const [box, setBox] = React.useState(document.body.getBoundingClientRect())

  React.useEffect(() => {
    if (!ref.current) return
    let currentBox = ref.current.getBoundingClientRect()
    if (box.width !== currentBox.width || box.height !== currentBox.height)
      setBox(currentBox)
  })

  return [ref, box]
}

export function useInput(ref, callback, type = "keyup") {
  React.useEffect(() => {
    const onKeyUp = e => callback(e)
    if (!ref.current) return
    ref.current.addEventListener(type, onKeyUp)
    return () => {
      if (ref.current) ref.current.removeEventListener(type, onKeyUp)
    }
  })
}

export function useContextMenu(ref, items = []) {
  React.useEffect(() => {
    if (!ref.current) return
    const { Menu, MenuItem } = window.remote

    const menu = new Menu()
    items.forEach(item => menu.append(new MenuItem(item)))

    ref.current.addEventListener(
      "contextmenu",
      e => {
        e.preventDefault()
        menu.popup({ window: window.remote.getCurrentWindow() })
      },
      false,
    )
  })
}
