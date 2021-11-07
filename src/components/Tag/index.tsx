import React, { CSSProperties } from "react"
import { observer } from "mobx-react"
import styles from "./styles.m.styl"
import classNames from "classnames"
import TagMenu from "components/menus/TagMenu"
import { ColorsMap } from "../../palette/colors"

type Props = {
  tag: any
  selected: boolean
  onClick: () => void
  listed?: boolean
}

const Tag = observer(({ tag, selected, onClick, listed }: Props) => {
  return (
    <TagMenu tag={tag} key={`tag_${tag.id}`}>
      <span
        className={classNames({
          [styles.tag]: true,
          [styles.selected]: selected,
          [styles.monotone]: !listed,
        })}
        style={{ "--tagColor": ColorsMap[tag.color] } as CSSProperties}
        onClick={() => onClick()}
      >
        {listed && <span className={styles.dot} />}
        {tag.name}
      </span>
    </TagMenu>
  )
})

export default Tag
