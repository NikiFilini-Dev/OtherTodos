import React from "react"
import { useMst } from "../../../models/RootStore"
import { observer } from "mobx-react"
import { useContextMenu } from "../../../tools/hooks"

const TagMenu = observer(({ tag, tagId, className, children }) => {
  const {
    deleteTag,
    tags,
    tasks: { all },
  } = useMst()
  if (!tag && tagId) {
    tag = tags.find(t => t.id === tagId)
  }

  const onDelete = () => {
    all.forEach(task => task.removeTag(tag))
    deleteTag(tag)
  }

  const ref = React.createRef()
  useContextMenu(ref, [{ label: "Delete", click: () => onDelete() }])

  return (
    <div className={className} ref={ref}>
      {children}
    </div>
  )
})

export default TagMenu
