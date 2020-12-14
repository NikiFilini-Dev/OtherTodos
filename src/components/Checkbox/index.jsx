import React, { forwardRef } from "react"
import styles from "./styles.styl"
import classNames from "classnames"
import PropTypes from "prop-types"
import checkmark from "../../assets/checkmark.svg"

const Checkbox = forwardRef(({ onChange, checked, className }, ref) => {
  const onClick = (e) => {
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
      <img src={checkmark} className={styles.checkmark} />
    </div>
  )
})

Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  className: PropTypes.string,
}

export default Checkbox
