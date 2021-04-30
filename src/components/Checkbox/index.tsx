import React, { forwardRef } from "react"
import styles from "./styles.styl"
import classNames from "classnames"
import Checkmark from "assets/checkmark.svg"

const Checkbox = (
  {
    onChange,
    checked,
    className,
    color,
  }: {
    onChange?: (checked: boolean) => void
    checked?: boolean
    className?: string
    color?: string
  },
  ref,
) => {
  const onClick = e => {
    e.preventDefault()
    if (onChange) onChange(!checked)
  }
  return (
    <div
      ref={ref}
      className={
        classNames({
          [styles.checkbox]: true,
          [styles.checked]: checked,
          [styles.colored]: !!color,
        }) +
        " " +
        className
      }
      style={{
        ["--color" as any]: `${color}`,
      }}
      onClick={onClick}
    >
      <Checkmark className={styles.checkmark} />
    </div>
  )
}

export default forwardRef(Checkbox)
