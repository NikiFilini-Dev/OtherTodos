import React from "react"

export function useClick(target, callback) {
  React.useEffect(() => {
    target.addEventListener("click", callback)
    return () => target.removeEventListener("click", callback)
  })
}

export function useClickOutsideRef(ref, callback) {
  useClick(document, (e) => {
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
