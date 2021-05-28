import React, { CSSProperties } from "react"
import styles from "./styles.styl"
import classNames from "classnames"

const Button = (
  {
    icon,
    text,
    onClick,
    secondary = false,
    activated = false,
    awesome = false,
    color = ""
  }: {
    icon?: any
    text?: string
    onClick?: React.MouseEventHandler<HTMLDivElement>
    secondary?: boolean
    activated?: boolean
    awesome?: boolean
    color?: string
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
      style={{"--color": color} as CSSProperties}
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
