import React from "react"
import { buildCalendar } from "tools/date"
import styles from "./styles.styl"
import CalendarIcon from "assets/calendar_empty.svg"
import moment from "moment"
import "moment/locale/ru"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const DaySelector = observer(() => {
  const [isCalendarShown, setIsCalendarShown] = React.useState(true)
  const {
    selectedDate,
    selectDate,
    tasks: { all },
  } = useMst()
  const date = moment(selectedDate)
  const weeks = buildCalendar(date._d, all)
  const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]

  const onTriggerClick = (e) => {
    e.preventDefault()
    setIsCalendarShown(!isCalendarShown)
  }

  return (
    <div>
      {!isCalendarShown && (
        <div className={styles.topLittle}>
          <span className={styles.littleTitle}>Календарь</span>
          <span onClick={onTriggerClick}>
            <CalendarIcon className={styles.trigger} />
          </span>
        </div>
      )}
      {isCalendarShown && (
        <div>
          <div className={styles.topBig}>
            <span>
              <span className={styles.bigTitle}>
                {capitalizeFirstLetter(date.format("MMMM"))}
              </span>
              <span className={styles.shortDate}>
                {capitalizeFirstLetter(date.format("dd, DD"))}
              </span>
            </span>
            <span onClick={onTriggerClick}>
              <CalendarIcon className={styles.trigger} />
            </span>
          </div>
          <div className={styles.calendar}>
            <div className={styles.week}>
              {weekdays.map((name) => (
                <span
                  key={name}
                  className={classNames({
                    [styles.day]: true,
                    [styles.dayname]: true,
                  })}
                >
                  {name}
                </span>
              ))}
            </div>
            {weeks.map((week, weekI) => (
              <div key={`week_${weekI}`} className={styles.week}>
                {week.map((day, dayI) => (
                  <div
                    key={`week_${weekI}_day_${dayI}`}
                    className={classNames({
                      [styles.day]: true,
                      [styles.alien]: day.alien,
                      [styles.today]: day.today,
                      [styles.selected]: day.selected,
                    })}
                    onClick={() => selectDate(day.date)}
                  >
                    {day.number}
                    {day.hasTasks && <span className={styles.hasTasksMark} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

export default DaySelector
