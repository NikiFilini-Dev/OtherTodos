import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import PriorityIndicator from "../PriorityIndicator/index.jsx"
import FloatMenu from "../FloatMenu/index.jsx"
import { useClick } from "../../tools/hooks"
import noop from "lodash-es/noop"

const PrioritySelector = ({
  priority,
  menuRef,
  triggerRef,
  onSelect = noop,
}) => {
  const ref = React.useRef(null)
  const [isShown, setIsShown] = React.useState(false)
  const wrapperRef = React.useRef(null)

  const onPriorityClick = priority => {
    setTimeout(() => setIsShown(false), 100)
    onSelect(priority)
  }

  useClick(document, e => {
    if (
      wrapperRef.current &&
      isShown &&
      e.target !== wrapperRef.current &&
      !wrapperRef.current.contains(e.target)
    )
      setTimeout(() => setIsShown(false), 100)
  })

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div onClick={() => setIsShown(!isShown)} ref={triggerRef}>
        <PriorityIndicator priority={priority} ref={ref} />
      </div>

      {isShown && (
        <FloatMenu target={ref} position={"vertical_right"} menuRef={menuRef}>
          <div className={styles.priorityList}>
            <div
              className={styles.priorityElement}
              onClick={() => onPriorityClick(3)}
            >
              <PriorityIndicator priority={3} /> Низкий
            </div>
            <div
              className={styles.priorityElement}
              onClick={() => onPriorityClick(2)}
            >
              <PriorityIndicator priority={2} /> Средний
            </div>
            <div
              className={styles.priorityElement}
              onClick={() => onPriorityClick(1)}
            >
              <PriorityIndicator priority={1} /> Срочный
            </div>
          </div>
        </FloatMenu>
      )}
    </div>
  )
}

PrioritySelector.propTypes = {
  priority: PropTypes.number,
  onSelect: PropTypes.func,
  menuRef: PropTypes.any,
  triggerRef: PropTypes.any,
}

export default PrioritySelector
