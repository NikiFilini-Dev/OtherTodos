import React from "react"
import PropTypes from "prop-types"
// import { observer } from "mobx-react"
// import classNames from "classnames"
import styles from "./styles.styl"
import Task from "components/Task"
import Button from "components/Button"
import { observer } from "mobx-react"

import MoveIcon from "assets/move.svg"
import DateSelector from "../DateSelector"
import { useClickOutsideRef } from "../../tools/hooks"

const ExpiredTasks = observer(({ tasks }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
  const triggerRef = React.useRef(null)

  useClickOutsideRef(triggerRef, () => setIsDatePickerOpen(false))

  const onMoveDateSelect = day => {
    const date = day.date
    tasks.forEach(task => task.setDate(date))
    setIsDatePickerOpen(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <span className={styles.name}>Просрочено</span>

        <div className={styles.actions}>
          <span style={{ position: "relative" }} ref={triggerRef}>
            <Button
              icon={MoveIcon}
              text={"Перенести"}
              onClick={() => setIsDatePickerOpen(true)}
            />
            {isDatePickerOpen && (
              <DateSelector
                right
                triggerRef={triggerRef}
                onSelect={onMoveDateSelect}
              />
            )}
          </span>
        </div>
      </div>
      <div className={styles.tasks}>
        {tasks.map(task => (
          <Task key={`task_${task.id}`} task={task} />
        ))}
      </div>
    </div>
  )
})

ExpiredTasks.propTypes = {
  tasks: PropTypes.object,
}

export default ExpiredTasks
