import React, { CSSProperties } from "react"
import styles from "./styles.m.styl"
import { observer } from "mobx-react"
import { useMst } from "../../models/RootStore"
import { IHabit } from "../../models/Habit"
import range from "../../tools/range"
import CheckboxIcon from "../../assets/checkmark.svg"
import EditIcon from "../../assets/customIcons/edit.svg"
import PlusIcon from "../../assets/customIcons/plusCircle.svg"
import HabitForm from "../HabitForm"
import classNames from "classnames"
import { IconsMap } from "../../palette/icons"
import { ColorsMap } from "../../palette/colors"

const Habit = observer(
  ({
    habit,
    onEditClick,
    date,
  }: {
    habit: IHabit
    onEditClick: () => void
    date: string
  }) => {
    const { createHabitRecord, deleteHabitRecord } = useMst()
    const editRef = React.useRef<HTMLDivElement>(null)

    const records = habit.records.filter(r => r.date === date)

    const donePercent = (100 / habit.recordsPerDay) * records.length
    const onHabitClick = e => {
      const records = habit.records.filter(r => r.date === date)
      if (!editRef.current) return
      if (editRef.current === e.target || editRef.current.contains(e.target))
        onEditClick()
      if (
        e.target.classList.contains(styles.done) ||
        e.target.tagName === "svg" ||
        e.target.tagName === "path"
      )
        return
      else if (records.length < habit.recordsPerDay)
        createHabitRecord({
          habit,
          date,
        })
    }
    const Icon = IconsMap[habit.icon]
    return (
      <div
        className={styles.habit}
        style={
          {
            "--donePercent": `${donePercent}%`,
            "--habitColor": ColorsMap[habit.color],
          } as CSSProperties
        }
        onClick={onHabitClick}
      >
        <div className={styles.edit} ref={editRef}>
          <EditIcon />
        </div>
        <div
          className={classNames({
            [styles.background]: true,
            [styles.invisible]: !records.length,
          })}
        />
        <div className={styles.info}>
          <Icon />
          <span>{habit.name}</span>
        </div>
        <div className={styles.records}>
          {records.map(record => (
            <div
              className={styles.done}
              key={record.id}
              onClick={() => deleteHabitRecord(record.id)}
            >
              <CheckboxIcon />
            </div>
          ))}
          {range(habit.recordsPerDay - records.length).map(index => (
            <div className={styles.waiting} key={index} />
          ))}
        </div>
      </div>
    )
  },
)

const Habits = observer(({ date }: { date: string }) => {
  const { habits, setTempHabit } = useMst()
  const [editingHabitId, setEditingHabitId] = React.useState<null | string>(
    null,
  )
  const arr = [...habits]
  arr.sort((b, a) => b.isDone(date) - a.isDone(date))
  return (
    <React.Fragment>
      <div className={styles.list}>
        {arr
          .filter(habit => habit.hasDate(date))
          .map(habit => (
            <Habit
              date={date}
              habit={habit}
              key={habit.id}
              onEditClick={() => {
                setEditingHabitId(habit.id)
                setTempHabit({ ...habit })
              }}
            />
          ))}
        <div className={styles.addHabit} onClick={() => setTempHabit({})}>
          <PlusIcon />
          Добавить
        </div>
      </div>
      <HabitForm
        habitId={editingHabitId}
        onDone={() => setEditingHabitId(null)}
      />
    </React.Fragment>
  )
})

export default Habits
