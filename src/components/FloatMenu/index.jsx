import React from "react"
import ReactDOM from "react-dom"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import classNames from "classnames"
import { observer } from "mobx-react"

const FloatMenu = observer(
  ({ children, position = "right", targetBox, menuRef }) => {
    const [el] = React.useState(document.createElement("div"))
    React.useEffect(() => {
      document.querySelector("#modals").appendChild(el)
      return () => {
        document.querySelector("#modals").removeChild(el)
      }
    }, [])

    let portal = false
    let style = {}
    switch (position) {
      case "right":
        style = {
          top: targetBox.height + 12 + "px",
          right: targetBox.width / 2 - 19 + "px",
        }
        break
      case "left":
        style = {
          top: targetBox.height + 12 + "px",
          left: targetBox.width / 2 - 19 + "px",
        }
        break
      case "lefttop":
        style = {
          top: targetBox.y + targetBox.height / 2 - 24 + "px",
          right: window.innerWidth - targetBox.x + 12 + "px",
        }
        portal = true
        break
      case "leftbottom":
        style = {
          bottom:
            window.innerHeight - targetBox.y - targetBox.height / 2 - 12 + "px",
          right: window.innerWidth - targetBox.x + 12 + "px",
        }
        portal = true
        break
    }
    console.log("STYLE", style, targetBox)
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
          })}
        >
          <div className={styles.left} />
          <div className={styles.middle} />
          <div className={styles.right} />
        </div>
        <div>{children}</div>
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
