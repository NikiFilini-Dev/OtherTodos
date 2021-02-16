import React from "react"
import Mousetrap from "mousetrap"
import ScrollContext from "components/Screens/scrollContext"
import Emitter from "events"

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

export function useScrollEmitter(scrollRef) {
  const [scrollEmitter] = React.useState(new Emitter())
  React.useEffect(() => {
    let last_known_scroll_position
    let ticking
    const onScroll = e => {
      last_known_scroll_position = e.target.scrollTop

      if (!ticking) {
        window.requestAnimationFrame(function() {
          scrollEmitter.emit("scroll", last_known_scroll_position)
          ticking = false
        })

        ticking = true
      }
    }

    const current = scrollRef.current
    current?.addEventListener("scroll", onScroll)
    return () => current?.removeEventListener("scroll", onScroll)
  })
  return scrollEmitter
}

export function useBoxTrack(ref) {
  const [pos, setPos] = React.useState(ref.current?.getBoundingClientRect())
  const scrollEmitter = React.useContext(ScrollContext)

  React.useEffect(() => {
    const onScroll = () => {
      const box = ref.current.getBoundingClientRect()
      if (box.x !== pos.x || box.y !== pos.y) setPos(box)
    }
    scrollEmitter.on("scroll", onScroll)
    return () => scrollEmitter.off("scroll", onScroll)
  })

  return pos
}

export function useFloatMenu(ref) {
  if (!ref) ref = React.useRef(null)
  const [box, setBox] = React.useState(document.body.getBoundingClientRect())

  React.useEffect(() => {
    if (!ref.current) return
    // console.log("Scroll container", scrollRef.current)
    let currentBox = ref.current.getBoundingClientRect()
    if (box.width !== currentBox.width || box.height !== currentBox.height)
      setBox(currentBox)
  }, [ref.current?.getBoundingClientRect().y])

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

export function useTrap(combination, callback) {
  React.useEffect(() => {
    Mousetrap.bind(combination, callback)
    console.log("BINDING", combination)

    return () => {
      console.log("UNBINDING", combination)
      Mousetrap.unbind(combination, callback)
    }
  })
}

export function useKeyListener(key, callback) {
  window.pressedKeys = window.pressedKeys ? window.pressedKeys : new Set()
  React.useEffect(() => {
    const onKeyup = e => {
      if (e.key === key) callback()
    }
    document.addEventListener("keyup", onKeyup)

    return () => {
      document.removeEventListener("keyup", onKeyup)
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
  }, [ref.current])
}
