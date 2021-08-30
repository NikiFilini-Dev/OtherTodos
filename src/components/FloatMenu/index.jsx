import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useBoxTrack } from "../../tools/hooks"

const FloatMenu = observer(
  ({ children, position = "right", target, menuRef }) => {
    if (!target) return <div />

    const targetBox = useBoxTrack(target)

    const [el] = React.useState(document.createElement("div"))
    React.useEffect(() => {
      document.querySelector("#floats").appendChild(el)
      return () => {
        document.querySelector("#floats").removeChild(el)
      }
    }, [])

    let portal = false
    let style = {}
    let modifier
    console.log(targetBox)
    if (position === "horizontal_auto") {
      if (targetBox.x > window.innerWidth / 2) position = "horizontal_left"
      else position = "horizontal_right"
      // portal = true
    }
    console.log("POSITION", position)
    switch (position) {
      case "horizontal_right":
        if (targetBox.y + targetBox.height / 2 < window.innerHeight / 2) {
          style = {
            top: targetBox.y + targetBox.height / 2 - 24 + "px",
            left: targetBox.x + targetBox.width + 12 + "px",
          }
        } else {
          style = {
            bottom:
              window.innerHeight -
              targetBox.y -
              targetBox.height / 2 -
              24 +
              "px",
            left: targetBox.x + targetBox.width + 12 + "px",
          }
          modifier = "bottom"
        }
        portal = true
        break

      case "horizontal_left":
        if (targetBox.y + targetBox.height / 2 < window.innerHeight / 2) {
          style = {
            top: targetBox.y + targetBox.height / 2 - 24 + "px",
            right: window.innerWidth - targetBox.x + 12 + "px",
          }
        } else {
          style = {
            bottom:
              window.innerHeight -
              targetBox.y -
              targetBox.height / 2 -
              24 +
              "px",
            right: window.innerWidth - targetBox.x + 12 + "px",
          }
          modifier = "bottom"
        }
        portal = true
        break

      case "vertical_left":
        if (targetBox.y < window.innerHeight / 2) {
          style = {
            top: targetBox.top + targetBox.height + 12 + "px",
            left: targetBox.left - targetBox.width / 2 + "px",
          }
        } else {
          style = {
            bottom: window.innerHeight - targetBox.y + 19 + "px",
            left: targetBox.left - targetBox.width / 2 + "px",
          }
          modifier = "bottom"
        }
        portal = true
        break
      case "vertical_right":
        if (targetBox.y < window.innerHeight / 2) {
          style = {
            top: targetBox.top + targetBox.height + 12 + "px",
            right:
              window.innerWidth -
              targetBox.left -
              targetBox.width * 1.5 -
              14 +
              "px",
          }
          portal = true
          modifier = "top"
        } else {
          style = {
            bottom: window.innerHeight - targetBox.y + 19 + "px",
            right:
              window.innerWidth -
              targetBox.left -
              targetBox.width * 1.5 -
              14 +
              "px",
          }
          modifier = "bottom"
        }
        portal = true
        break
      case "vertical_middle":
        if (targetBox.y < window.innerHeight / 2) {
          style = {
            top: targetBox.top + targetBox.height + 12 + "px",
            right: window.innerWidth - targetBox.left - targetBox.width + "px",
          }
          portal = true
          modifier = "top"
        } else {
          style = {
            bottom: window.innerHeight - targetBox.y + 19 + "px",
            right: window.innerWidth - targetBox.left - targetBox.width + "px",
          }
          modifier = "bottom"
        }
        portal = true
        break
    }
    if (style.bottom !== undefined && parseInt(style.bottom) < 0)
      style.bottom = 0
    if (style.top !== undefined && parseInt(style.top) < 0) style.top = 0
    if ("top" in style) style["--offset"] = style.top
    if ("bottom" in style) style["--offset"] = style.bottom
    const Content = (
      <div
        className={styles.rectang}
        style={style}
        ref={menuRef || { current: null }}
      >
        <div
          className={classNames({
            [styles.tail]: true,
            [styles[position]]: true,
            [styles[modifier]]: true,
          })}
        >
          <div className={styles.left} />
          <div className={styles.middle} />
          <div className={styles.right} />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    )

    return portal ? ReactDOM.createPortal(Content, el) : Content
  },
)

FloatMenu.propTypes = {
  children: PropTypes.node,
  position: PropTypes.string,
  targetBox: PropTypes.shape({
    height: PropTypes.integer,
    width: PropTypes.integer,
  }),
}

export default FloatMenu
