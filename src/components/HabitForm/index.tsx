import React, { CSSProperties } from "react"
import styles from "./styles.m.styl"
import { observer } from "mobx-react"
import ReactDOM from "react-dom"
import CheckboxIcon from "../../assets/customIcons/checkmark.svg"
import TimesIcon from "../../assets/customIcons/times.svg"
import RepeatIcon from "../../assets/customIcons/repeat.svg"
import classNames from "classnames"
import { HabitColorMap, HabitIconMap } from "../../models/Habit"
import range from "../../tools/range"
import { IRootStore, useMst } from "../../models/RootStore"

const HabitForm = observer(({ habitId, onDone }: { habitId: string | null, onDone: () => void }) => {
  const { tempHabit, rejectTempHabit, insertTempHabit, saveTempHabit }: IRootStore = useMst()
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const [el] = React.useState(document.createElement("div"))
  React.useEffect(() => {
    document.querySelector("#modals")?.appendChild(el)
    return () => {
      document.querySelector("#modals")?.removeChild(el)
    }
  }, [])

  const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

  const onWrapperClick = e => {
    if (e.target !== wrapperRef.current) return
    rejectTempHabit()
  }

  const onSave = () => {
    if (habitId) saveTempHabit(habitId)
    else insertTempHabit()
    onDone()
  }

  if (!tempHabit) return <React.Fragment />

  return ReactDOM.createPortal(<div className={styles.wrapper} ref={wrapperRef} onClick={onWrapperClick}>
    <div className={styles.modal}>
      <div className={classNames({
        [styles.modalPart]: true,
        [styles.head]: true,
      })}>
        <input
          placeholder={"Название привычки"} value={tempHabit.name}
          onChange={e => tempHabit.setName(e.target.value)} />
        <div className={styles.actions}>
          <span className={styles.add} onClick={onSave}><CheckboxIcon /> Сохранить</span>
          <div className={styles.separator} />
          <span className={styles.reject} onClick={rejectTempHabit}><TimesIcon /></span>
        </div>
      </div>
      <div className={styles.modalPart}>
        <div className={styles.group}>
          <span className={styles.name}>Выберите цвет</span>
          <div className={styles.colors}>{Object.keys(HabitColorMap).map(color => <div
            className={classNames({
              [styles.color]: true,
              [styles.active]: color === tempHabit.color,
            })}
            key={color}
            onClick={() => tempHabit.setColor(color)}
            style={{ "--color": HabitColorMap[color] } as CSSProperties} />)}</div>
        </div>
        <div className={styles.group}>
          <div className={styles.name}>Значок привычки</div>
          <div className={styles.icons}>
            {Object.keys(HabitIconMap).map(name => {
              const Icon = HabitIconMap[name]
              return <div key={name} className={classNames({
                [styles.block]: true,
                [styles.active]: name === tempHabit.icon,
              })}
                          onClick={() => tempHabit.setIcon(name)}>
                <Icon />
              </div>
            })}
          </div>
        </div>
        <div className={styles.group}>
          <div className={styles.name}>Период выполнения</div>
          <div className={styles.periods}>
            <div className={classNames({
              [styles.period]: true,
              [styles.active]: tempHabit.type === "daily",
            })}
                 onClick={() => tempHabit.setType("daily")}>Ежедневно
            </div>
            <div className={classNames({
              [styles.period]: true,
              [styles.active]: tempHabit.type === "weekly",
            })}
                 onClick={() => tempHabit.setType("weekly")}>Еженедельно
            </div>
            <div className={classNames({
              [styles.period]: true,
              [styles.active]: tempHabit.type === "monthly",
            })}
                 onClick={() => tempHabit.setType("monthly")}>Ежемесячно
            </div>
            <div className={classNames({
              [styles.period]: true,
              [styles.active]: tempHabit.type === "custom",
            })}
                 onClick={() => tempHabit.setType("custom")}>Свой период
            </div>
          </div>
        </div>
        <div className={styles.group}>
          <div className={styles.repeatDetails}>
            {tempHabit.type === "monthly" &&
            <React.Fragment>
              <div className={styles.info}>
                <div className={styles.title}>Выберите даты</div>
                <div className={styles.description}>
                  Выберите числа и задача будет добавляться на заданные числа каждого месяца
                </div>
              </div>
              <div>
                <div className={styles.week}>
                  {range(0, 7).map(i => (
                    <div className={classNames({
                      [styles.block]: true,
                      [styles.active]: tempHabit.monthlyDays.includes(i + 1),
                    })}
                         onClick={() => tempHabit.toggleMonthlyDay(i + 1)}
                         key={`day_${i}`}>{i + 1}</div>
                  ))}
                </div>
                <div className={styles.week}>
                  {range(7, 14).map(i => (
                    <div className={classNames({
                      [styles.block]: true,
                      [styles.active]: tempHabit.monthlyDays.includes(i + 1),
                    })}
                         onClick={() => tempHabit.toggleMonthlyDay(i + 1)}
                         key={`day_${i}`}>{i + 1}</div>
                  ))}
                </div>
                <div className={styles.week}>
                  {range(14, 21).map(i => (
                    <div className={classNames({
                      [styles.block]: true,
                      [styles.active]: tempHabit.monthlyDays.includes(i + 1),
                    })}
                         onClick={() => tempHabit.toggleMonthlyDay(i + 1)}
                         key={`day_${i}`}>{i + 1}</div>
                  ))}
                </div>
                <div className={styles.week}>
                  {range(21, 28).map(i => (
                    <div className={classNames({
                      [styles.block]: true,
                      [styles.active]: tempHabit.monthlyDays.includes(i + 1),
                    })}
                         onClick={() => tempHabit.toggleMonthlyDay(i + 1)}
                         key={`day_${i}`}>{i + 1}</div>
                  ))}
                </div>

                <div className={styles.week}>
                  {range(28, 31).map(i => (
                    <div className={classNames({
                      [styles.block]: true,
                      [styles.active]: tempHabit.monthlyDays.includes(i + 1),
                    })}
                         onClick={() => tempHabit.toggleMonthlyDay(i + 1)}
                         key={`day_${i}`}>{i + 1}</div>
                  ))}
                </div>
              </div>
            </React.Fragment>}

            {tempHabit.type === "weekly" && <React.Fragment>
              <div className={styles.info}>
                <div className={styles.title}>
                  Выберите дни недели
                </div>
              </div>
              <div>
                <div className={styles.week}>
                  {weekdays.map((day, index) => <div className={classNames({
                    [styles.block]: true,
                    [styles.active]: tempHabit.weeklyDays.includes(index + 1),
                  })} key={day} onClick={() => tempHabit.toggleWeeklyDay(index + 1)}>{day}</div>)}
                </div>
              </div>
            </React.Fragment>}
          </div>
        </div>
        <div className={styles.group}>
          <div className={styles.name}>Повторений в день</div>
          <div className={styles.repeatCount}>
            <RepeatIcon />
            <input type="number" value={tempHabit.recordsPerDay}
                   onChange={e => tempHabit.setRecordsPerDay(parseInt(e.target.value))} min={1} max={10} />
            раз
          </div>
        </div>
      </div>
    </div>
  </div>, el)
})

export default HabitForm