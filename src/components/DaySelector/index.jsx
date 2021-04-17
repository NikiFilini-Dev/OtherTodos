import React from "react"
import { buildCalendar } from "tools/date"
import styles from "./styles.styl"
import CalendarIcon from "assets/calendar_empty.svg"
import "moment/locale/ru"
import classNames from "classnames"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import { DateTime } from "luxon"

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const DaySelector = observer(() => {
  const [isCalendarShown, setIsCalendarShown] = React.useState(false)
  const { timelineDate, setTimelineDate } = useMst()
  const date = DateTime.fromFormat(timelineDate, "D")
  const weeks = buildCalendar(new Date(), date.toJSDate(), [])
  const weekdays = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]

  const onTriggerClick = e => {
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
                {capitalizeFirstLetter(date.toFormat("LLLL"))}
              </span>
              <span className={styles.shortDate}>
                {capitalizeFirstLetter(date.toFormat("dd.MM.yyyy"))}
              </span>
            </span>
            <span onClick={onTriggerClick}>
              <CalendarIcon className={styles.trigger} />
            </span>
          </div>
          <div className={styles.calendar}>
            <div className={styles.week}>
              {weekdays.map(name => (
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
                    onClick={() => setTimelineDate(day.date)}
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
