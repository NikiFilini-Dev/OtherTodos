import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import classNames from "classnames"

const FloatMenu = ({ children, position = "right", targetBox }) => {
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
  }
  return (
    <div className={styles.rectang} style={style}>
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
}

FloatMenu.propTypes = {
  children: PropTypes.node,
  position: PropTypes.string,
  targetBox: PropTypes.shape({
    height: PropTypes.integer,
    width: PropTypes.integer,
  }),
}

export default FloatMenu
