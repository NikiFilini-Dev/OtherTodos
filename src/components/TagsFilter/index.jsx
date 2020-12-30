import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import classNames from "classnames"

const TagsFilter = observer(({ tags, selected, select }) => {
  return (
    <div className={styles.list}>
      <span
        className={classNames({
          [styles.tag]: true,
          [styles.selected]: selected === null,
        })}
        onClick={() => select(null)}
      >
        Все
      </span>
      {tags.map(tag => (
        <span
          key={`tag_${tag.id}`}
          className={classNames({
            [styles.tag]: true,
            [styles.selected]: selected === tag,
          })}
          onClick={() => select(tag)}
        >
          {tag.name}
        </span>
      ))}
    </div>
  )
})

export default TagsFilter
