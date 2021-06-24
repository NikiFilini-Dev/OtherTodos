import { observer } from "mobx-react"
import React from "react"
import { useClickOutsideRef, useKeyListener } from "../../../../tools/hooks"
import classNames from "classnames"
import styles from "../../styles.styl"
import Tag from "../../../Tag"

const Tags = observer(({ task, tags, onDelete }) => {
  const [selectedTagId, setSelectedTagId] = React.useState(null)
  const ref = React.useRef(null)

  const onTagClick = tag => {
    if (tag.id === selectedTagId) {
      task.setColorTag(task.colorTag?.id === tag.id ? null : tag.id)
      setSelectedTagId(null)
    } else {
      setSelectedTagId(tag.id)
    }
  }

  useClickOutsideRef(ref, () => setSelectedTagId(null))

  useKeyListener(["Delete", "Backspace"], () => {
    if (selectedTagId) onDelete(tags.find(t => t.id === selectedTagId))
  })

  return (
    <div
      ref={ref}
      className={classNames({
        [styles.line]: true,
        [styles.padding]: true,
        [styles.fullOnly]: true,
      })}
    >
      {tags.map(tag => (
        <Tag tag={tag}
             key={tag.id}
             selected={selectedTagId === tag.id}
             onClick={() => onTagClick(tag)}
             listed={task.colorTag !== tag}
        />
      ))}
    </div>
  )
})

export default Tags