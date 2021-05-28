import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import Tag from "../Tag"

const TagsFilter = observer(({ tags, selected, select }) => {
  tags.sort((a, b) => a.index - b.index)
  return (
    <div className={styles.list}>
      <Tag tag={{name: "Все"}} selected={selected === null} onClick={() => select(null)} />
      {tags.map(tag => (
        <Tag key={tag.id} tag={tag} selected={selected === tag} onClick={() => select(tag)} />
      ))}
    </div>
  )
})

export default TagsFilter
