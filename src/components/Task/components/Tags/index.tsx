import { observer } from "mobx-react"
import React, { CSSProperties } from "react"
import { useClickOutsideRef } from "../../../../tools/hooks"
import classNames from "classnames"
import styles from "../../styles.styl"
import PalletIcon from "../../../../assets/line_awesome/palette-solid.svg"

const Tags = observer(({ task }) => {
  const [selectedTagId, setSelectedTagId] = React.useState(null)
  const ref = React.useRef(null)
  const onTagClick = tag => {
    if (tag.id === selectedTagId) {
      task.setColorTag(tag)
      setSelectedTagId(null)
    } else {
      setSelectedTagId(tag.id)
    }
  }
  useClickOutsideRef(ref, () => setSelectedTagId(null))
  return (
    <div
      ref={ref}
      className={classNames({
        [styles.line]: true,
        [styles.padding]: true,
        [styles.fullOnly]: true,
      })}
    >
      {task.tags.map(tag => (
        <span
          key={`task_${task.id}#tag_${tag.id}`}
          className={classNames({
            [styles.tag]: true,
            [styles.colored]: task.colorTag === tag,
            [styles.selected]: selectedTagId === tag.id,
          })}
          style={{ "--tag-color": tag.color } as CSSProperties}
        >
          <span
            onClick={() => onTagClick(tag)}
            style={{ userSelect: tag.id === selectedTagId ? "none" : "auto" }}
          >
            {tag.name}
          </span>
          <PalletIcon
            onClick={() => {
              if (task.colorTag === tag) {
                task.setColorTag(null)
              } else {
                task.setColorTag(tag)
              }
            }}
          />
        </span>
      ))}
    </div>
  )
})

export default Tags