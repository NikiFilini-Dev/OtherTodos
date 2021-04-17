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
  }: {
    icon: any
    text?: string
    onClick?: React.MouseEventHandler<HTMLDivElement>
    secondary?: boolean
    activated?: boolean
    awesome?: boolean
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
export default React.forwardRef(Button)
