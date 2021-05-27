import React from "react"
import { observer } from "mobx-react"
import Task from "../../models/Task"

const TaskTagsSelector = observer(
  ({ task }: { task: typeof Task }): JSX.Element => {
    return <div>{task.tags.map(tag => tag.name)}</div>
  },
)

export default TaskTagsSelector
