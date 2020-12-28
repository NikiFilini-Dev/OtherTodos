import React from "react"
import PropTypes from "prop-types"
// import { observer } from "mobx-react"
// import classNames from "classnames"
import styles from "./styles.styl"

const Label = ({ icon, text }) => {
  const Icon = icon
  return (
    <div className={styles.label}>
      {icon && <Icon className={styles.icon} />}
      <span className={styles.text}>{text}</span>
    </div>
  )
}

Label.propTypes = {
  icon: PropTypes.any,
  text: PropTypes.any,
}

export default Label
