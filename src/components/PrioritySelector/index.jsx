import React from "react"
import PropTypes from "prop-types"
import styles from "./styles.styl"
import PriorityIndicator from "../PriorityIndicator/index.jsx"
import FloatMenu from "../FloatMenu/index.jsx"
import { useClick } from "../../tools/hooks"

const PrioritySelector = ({ priority, onSelect = () => {} }) => {
  const ref = React.createRef(null)
  const [targetBox, setTargetBox] = React.useState({ width: 0, height: 0 })
  const [isShown, setIsShown] = React.useState(false)
  const wrapperRef = React.useRef(null)

  const onPriorityClick = priority => {
    setIsShown(false)
    onSelect(priority)
  }

  React.useEffect(() => {
    let el = ref.current
    if (!targetBox.top) {
      setTargetBox(el.getBoundingClientRect())
    }
  })

  useClick(document, e => {
    if (
      wrapperRef.current &&
      isShown &&
      e.target !== wrapperRef.current &&
      !wrapperRef.current.contains(e.target)
    )
      setIsShown(false)
  })

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div onClick={() => setIsShown(!isShown)}>
        <PriorityIndicator priority={priority} ref={ref} />
      </div>

      {isShown && (
        <FloatMenu targetBox={targetBox}>
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
}

export default PrioritySelector
