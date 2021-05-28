import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import styles from "./styles.m.styl"
import classNames from "classnames"
import TagMenu from "components/menus/TagMenu"

type Props = {
  tag: any,
  selected: boolean,
  onClick: () => void
}

const Tag = observer(({ tag, selected, onClick }: Props) => {
  return (
    <TagMenu tag={tag} key={`tag_${tag.id}`}>
      <span
        className={classNames({
          [styles.tag]: true,
          [styles.selected]: selected,
        })}
        style={{"--tagColor": tag.color} as CSSProperties}
        onClick={() => onClick()}
      >
        {tag.name}
      </span>
    </TagMenu>
  )
})

export default Tag
