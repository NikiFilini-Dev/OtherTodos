import React, { forwardRef } from "react"
import styles from "./styles.styl"
import classNames from "classnames"
import PropTypes from "prop-types"
import Checkmark from "assets/checkmark.svg"

const Checkbox = ({ onChange, checked, className }, ref) => {
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

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
}

export default forwardRef(Checkbox)
