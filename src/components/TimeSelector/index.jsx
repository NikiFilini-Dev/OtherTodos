import React from "react"
import PropTypes from "prop-types"
import { useClickOutsideRef } from "../../tools/hooks"
import styles from "./styles.styl"
import ChevronUp from "assets/awesome/solid/chevron-up.svg"
import ChevronDown from "assets/awesome/solid/chevron-down.svg"

const TimeSelector = ({ onOutsideClick, onSubmit, initialTime }) => {
  const [rawHours, setRawHours] = React.useState(
    initialTime.split(":")[0].padStart(2, "0"),
  )
  const [rawMinutes, setRawMinutes] = React.useState(
    initialTime.split(":")[1].padStart(2, "0"),
  )

  const hours = parseInt(rawHours.length ? rawHours : "0")
  const setHours = hours => setRawHours(String(hours).padStart(2, "0"))

  const minutes = parseInt(rawMinutes.length ? rawMinutes : "0")
  const setMinutes = minutes => setRawMinutes(String(minutes).padStart(2, "0"))

  const ref = React.useRef(null)

  const minutesUp = () => {
    if (minutes < 59) return setMinutes(minutes + 1)
    else {
      if (hours < 23) setHours(hours + 1)
      else setHours(0)
      setMinutes(0)
    }
  }

  const minutesDown = () => {
    if (minutes > 0) return setMinutes(minutes - 1)
    if (hours > 0) setHours(hours - 1)
    else setHours(23)
    setMinutes(59)
  }

  const hoursUp = () => {
    if (hours < 24) return setHours(hours + 1)
    else return setHours(0)
  }

  const hoursDown = () => {
    if (hours > 0) return setHours(hours - 1)
    else return setHours(23)
  }

  useClickOutsideRef(ref, () => onOutsideClick())

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.select}>
        <div className={styles.row}>
          <span className={styles.action} onClick={hoursUp}>
            <ChevronUp />
          </span>
          <input
            type="number"
            value={rawHours}
            onChange={e => setRawHours(e.target.value)}
          />
          <span className={styles.action} onClick={hoursDown}>
            <ChevronDown />
          </span>
        </div>
        <div className={styles.delimiter}>:</div>
        <div className={styles.row}>
          <span className={styles.action} onClick={minutesUp}>
            <ChevronUp />
          </span>
          <input
            type="number"
            value={rawMinutes}
            onChange={e => setRawMinutes(e.target.value)}
          />
          <span className={styles.action} onClick={minutesDown}>
            <ChevronDown />
          </span>
        </div>
      </div>
      <div
        className={styles.save}
        onClick={e => {
          e.preventDefault()
          onSubmit(hours, minutes)
        }}
      >
        Сохранить
      </div>
    </div>
  )
}

TimeSelector.propTypes = {
  onOutsideClick: PropTypes.func.required,
  onSubmit: PropTypes.func.required,
  initialTime: PropTypes.string.required,
}

export default TimeSelector
