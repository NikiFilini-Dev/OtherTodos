import React, { forwardRef } from "react"
import styles from "./styles.styl"
import classNames from "classnames"

const Switch = (
  {
    onChange,
    checked,
    className,
    color = "var(--brand)",
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
          [styles.wrapper]: true,
          [styles.checked]: checked,
        }) +
        " " +
        className
      }
      style={{
        ["--color" as any]: `${color}`,
      }}
      onClick={onClick}
    >
      <div />
    </div>
  )
}

export default forwardRef(Switch)
