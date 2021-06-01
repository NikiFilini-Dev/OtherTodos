import React, { CSSProperties } from "react"
import styles from "./styles.styl"
import classNames from "classnames"
import { IconName } from "../../palette/icons"
import Icon from "../Icon"

const Button = (
  {
    icon,
    text,
    onClick,
    secondary = false,
    activated = false,
    awesome = false,
    color = "",
    textColor = "white",
    iconName,
    square = false,
  }: {
    icon?: any
    text?: string
    onClick?: React.MouseEventHandler<HTMLDivElement>
    secondary?: boolean
    activated?: boolean
    awesome?: boolean
    color?: string
    textColor?: string
    iconName?: IconName
    square?: boolean
  },
  ref,
) => {
  const OwnIcon = icon
  return (
    <div
      className={classNames({
        [styles.button]: true,
        [styles.secondary]: secondary,
        [styles.activated]: activated,
        [styles.square]: square
      })}
      style={{"--color": color, "--textColor": textColor} as CSSProperties}
      onClick={onClick}
      ref={ref}
    >
      {icon && (
        <OwnIcon
          className={classNames({
            [styles.icon]: true,
            [styles.awesome]: awesome,
          })}
        />
      )}
      {iconName && (
        <Icon name={iconName} className={classNames({
          [styles.icon]: true,
          [styles.awesome]: true,
        })} />
      )}
      {text && <span className={styles.text}>{text}</span>}
    </div>
  )
}
export default React.forwardRef(Button)
