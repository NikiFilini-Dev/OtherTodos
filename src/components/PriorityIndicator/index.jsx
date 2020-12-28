import React from "react"
import PropTypes from "prop-types"
import classNames from "classnames"
import styles from "./styles.styl"

// eslint-disable-next-line react/display-name
const PriorityIndicator = React.forwardRef(({ priority, onClick }, ref) => {
  let priorityClass
  switch (priority) {
    case 1:
      priorityClass = styles.priorityOne
      break
    case 2:
      priorityClass = styles.priorityTwo
      break
    case 3:
      priorityClass = styles.priorityThree
      break
    default:
      priorityClass = styles.priorityFour
      break
  }

  return (
    <div className={styles.wrapper} ref={ref}>
      <span
        onClick={onClick}
        className={classNames({
          [styles.priority]: true,
          [priorityClass]: true,
        })}
      />
    </div>
  )
})

PriorityIndicator.propTypes = {
  priority: PropTypes.number,
  onClick: PropTypes.func,
}

export default PriorityIndicator
