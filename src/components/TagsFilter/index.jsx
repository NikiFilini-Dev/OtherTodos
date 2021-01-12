import React from "react"
import { observer } from "mobx-react"
import styles from "./styles.styl"
import classNames from "classnames"
import TagMenu from "components/menus/TagMenu"

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
        <TagMenu tag={tag} key={`tag_${tag.id}`}>
          <span
            className={classNames({
              [styles.tag]: true,
              [styles.selected]: selected === tag,
            })}
            onClick={() => select(tag)}
          >
            {tag.name}
          </span>
        </TagMenu>
      ))}
    </div>
  )
})

export default TagsFilter
