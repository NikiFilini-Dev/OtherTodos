import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import Tag from "../Tag"
import clsx from "clsx"

const TagsFilter = observer(({ tags, selected, select }) => {
  tags.sort((a, b) => a.index - b.index)
  return (
    <div className={styles.list}>
      <span
        onClick={() => select(null)}
        className={clsx(styles.all, selected === null && styles.active)}
      >
        Все
      </span>
      {tags.map(tag => (
        <Tag
          listed={true}
          key={tag.id}
          tag={tag}
          selected={selected === tag}
          onClick={() => select(tag)}
        />
      ))}
    </div>
  )
})

export default TagsFilter
