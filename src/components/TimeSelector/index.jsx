import React from "react"
import PropTypes from "prop-types"
import { useClickOutsideRef } from "../../tools/hooks"
import styles from "./styles.styl"
import ChevronUp from "assets/awesome/solid/chevron-up.svg"
import ChevronDown from "assets/awesome/solid/chevron-down.svg"
import { DateTime } from "luxon"

const TimeSelector = ({
  onOutsideClick,
  onSubmit,
  initialTime,
  minimalTime,
}) => {
  const [rawHours, setRawHours] = React.useState(
    initialTime.split(":")[0].padStart(2, "0"),
  )
  const [rawMinutes, setRawMinutes] = React.useState(
    initialTime.split(":")[1].padStart(2, "0"),
  )

  const minimalMoment = DateTime.fromFormat(minimalTime || "00:00", "HH:mm")

  const hours = parseInt(rawHours.length ? rawHours : "0")
  const setHours = hours => setRawHours(String(hours).padStart(2, "0"))

  const minutes = parseInt(rawMinutes.length ? rawMinutes : "0")
  const setMinutes = minutes => setRawMinutes(String(minutes).padStart(2, "0"))

  const ref = React.useRef(null)

  const changeTime = (amount, unit) => {
    let time = DateTime.fromFormat(`${hours}:${minutes}`, "H:m").plus({
      [unit]: amount,
    })
    if (minimalTime && time < minimalMoment) time = minimalMoment
    const [newHours, newMinutes] = time.toFormat("HH:mm").split(":")
    setMinutes(newMinutes)
    setHours(newHours)
  }

  useClickOutsideRef(ref, () => onOutsideClick())

  return (
    <div className={styles.wrapper} ref={ref}>
      <div className={styles.select}>
        <div className={styles.row}>
          <span
            className={styles.action}
            onClick={() => changeTime(1, "hours")}
          >
            <ChevronUp />
          </span>
          <input
            type="number"
            value={rawHours}
            onChange={e => setRawHours(e.target.value.slice(0, 2))}
          />
          <span
            className={styles.action}
            onClick={() => changeTime(-1, "hours")}
          >
            <ChevronDown />
          </span>
        </div>
        <div className={styles.delimiter}>:</div>
        <div className={styles.row}>
          <span
            className={styles.action}
            onClick={() => changeTime(1, "minutes")}
          >
            <ChevronUp />
          </span>
          <input
            type="number"
            value={rawMinutes}
            onChange={e => {
              setRawMinutes(e.target.value.slice(0, 2))
            }}
          />
          <span
            className={styles.action}
            onClick={() => changeTime(-1, "minutes")}
          >
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
  minimalTime: PropTypes.string.required,
}

export default TimeSelector
