/**
 * Swipe v.1.0.0
 * =============
 * Cross-browser implementation of swipe events for the any element
 * by using mouse and touch native events. It allows to handle events such
 * as "swipestart", "swipemove" and "swipeend".
 *
 * @license MIT
 * @author Max Chuhryaev
 *
 * Usage example
 * -------------
 * ```javascript
 *  var node = document.body;
 *  node.addEventListener("swipestart", swipeListener, false);
 *  node.addEventListener("swipemove", swipeListener, false);
 *  node.addEventListener("swipeend", swipeListener, false);
 *
 *  Swipe(node, function (data) {
 *    console.log("handler", data.type, data, this);
 *  });
 *
 *  function swipeListener (event) {
 *    console.log("listener", event.type, event);
 *  }
 * ```
 *
 * @param node (HTMLElement|String) [Required] HTML element or CSS selector of elements that should emit swipe events
 * @param handler (Function) [Optional] An optional function that can be used to
 *                           handle swipe events and preventing of original events.
 * @returns void
 */
export default function Swipe(node, handler?: any) {
  const hasTouch = "ontouchstart" in window,
    startEvent = hasTouch ? "touchstart" : "mousedown",
    moveEvent = hasTouch ? "touchmove" : "mousemove",
    dragEvent = hasTouch ? "" : "dragover",
    endEvent = hasTouch ? "touchend" : "mouseup",
    cancelEvent = hasTouch ? "touchcancel" : "dragend"

  const round = Math.round
  let root, startX, x, startY, y, way, direction

  constructor()

  function constructor() {
    window.addEventListener(startEvent, listener, false)
    window.addEventListener(moveEvent, listener, false)
    if (dragEvent) window.addEventListener(dragEvent, listener, false)
    window.addEventListener(endEvent, listener, false)
    window.addEventListener(cancelEvent, listener, false)
  }

  function listener(e) {
    // e.stopPropagation()
    // e.preventDefault()
    if (e.type == startEvent) {
      const node = getEventNode(e)
      if (node) root = node
    }
    if (root) {
      const current = pointerLocationByEvent(e)
      if (e.type == startEvent) {
        startX = x = current.x
        startY = y = current.y
        fire("start", e)
      } else if (e.type == moveEvent || e.type == dragEvent) {
        if (!way) {
          const wdX = calcDiff(startX, current.x),
            wdY = calcDiff(startY, current.y)
          if (wdX == wdY) return
          way = wdX > wdY ? "x" : "y"
        }
        direction =
          way == "x"
            ? x > current.x
              ? "left"
              : "right"
            : y > current.y
            ? "top"
            : "bottom"
        x = current.x
        y = current.y
        fire("move", e)
      } else if (e.type == endEvent || e.type == cancelEvent) {
        fire("end", e)
        root = null
        way = direction = null
      }
    }
  }

  function getEventNode(e) {
    if (typeof node == "string") return bySelector(e.target, node, !0)
    else return byNode(e.target, node)
  }

  function _matchesSelector(el, selector) {
    if (el == window || el == document) return false
    const p = Element.prototype
    // @ts-ignore
    const f =
      p.matches ||
      p.webkitMatchesSelector ||
      p.mozMatchesSelector ||
      p.msMatchesSelector ||
      function (s) {
        // @ts-ignore
        return [].indexOf.call(document.querySelectorAll(s), this) !== -1
      }
    return f.call(el, selector)
  }

  function bySelector(el, selector, closest) {
    if (_matchesSelector(el, selector)) return el
    if (!closest) return false
    return el.parentNode ? bySelector(el.parentNode, selector, closest) : false
  }

  function byNode(node, parent) {
    if (node == parent) return node
    return node.parentNode ? byNode(node.parentNode, parent) : false
  }

  function calcDiff(prev, current) {
    return Math.max(prev, current) - Math.min(prev, current)
  }

  function pointerLocationByEvent(e) {
    const v = e.touches && e.touches[0] ? e.touches[0] : e
    return {
      x: round(v.clientX || v.pageX || v.x),
      y: round(v.clientY || v.pageY || v.y),
    }
  }

  function getData(originalEvent) {
    const o: Record<string, any> = {
      x: x,
      y: y,
      startX: startX,
      startY: startY,
      diffX: x - startX,
      diffY: y - startY,
    }
    if (originalEvent) o.originalEvent = originalEvent
    if (way) {
      o.way = way
      o.diffWay = way == "x" ? o.diffX : o.diffY
    }
    if (direction) o.direction = direction
    return o
  }

  function fire(type, originalEvent) {
    const event = "swipe" + type
    const data = getData(originalEvent)
    const e = dispatch(root, event, data)
    if (typeof handler == "function") handler.call(root, e)
  }

  function dispatch(node, event, data) {
    const e = document.createEvent("HTMLEvents")
    if (data) for (const i in data) e[i] = data[i]
    e.initEvent(event, true, true)
    node.dispatchEvent(e)
    return e
  }
}
