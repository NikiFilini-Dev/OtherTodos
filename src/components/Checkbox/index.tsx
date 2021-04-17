import React, { forwardRef } from "react"
import styles from "./styles.styl"
import classNames from "classnames"
import Checkmark from "assets/checkmark.svg"

const Checkbox = (
  {
    onChange,
    checked,
    className,
  }: {
    onChange?: (checked: boolean) => void
    checked?: boolean
    className?: string
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
        }) +
        " " +
        className
      }
      onClick={onClick}
    >
      <Checkmark className={styles.checkmark} />
    </div>
  )
}

export default forwardRef(Checkbox)
