import React from "react"
import styles from "./styles.styl"
import propTypes from "prop-types"
import classNames from "classnames"

const Button = (
  {
    icon,
    text,
    onClick,
    secondary = false,
    activated = false,
    awesome = false,
  },
  ref,
) => {
  const Icon = icon
  return (
    <div
      className={classNames({
        [styles.button]: true,
        [styles.secondary]: secondary,
        [styles.activated]: activated,
      })}
      onClick={onClick}
      ref={ref}
    >
      {icon && (
        <Icon
          className={classNames({
            [styles.icon]: true,
            [styles.awesome]: awesome,
          })}
        />
      )}
      {text && <span className={styles.text}>{text}</span>}
    </div>
  )
}

Button.propTypes = {
  icon: propTypes.any,
  text: propTypes.string,
  onClick: propTypes.func,
  secondary: propTypes.bool,
  activated: propTypes.bool,
  awesome: propTypes.bool,
}

export default React.forwardRef(Button)
