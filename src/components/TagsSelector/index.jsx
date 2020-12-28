import React, { useState, useRef } from "react"
import PropTypes from "prop-types"
import { observer } from "mobx-react"
import { useMst } from "models/RootStore"
import SearchIcon from "assets/search.svg"
import PlusIcon from "assets/plus.svg"

import styles from "./styles.styl"

const TagsSelector = observer(({ selected, add, select, unselect }) => {
  const { tags } = useMst()
  const [search, setSearch] = React.useState("")

  const results = tags.filter(
    tag => tag.name.startsWith(search) && !selected.includes(tag),
  )

  const onSelectClick = tag => select(tag)
  const onUnselectClick = tag => unselect(tag)
  const onAddClick = name => {
    setSearch("")
    add(name)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchWrapper}>
        <SearchIcon />
        <input
          className={styles.search}
          placeholder={"Тэги"}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className={styles.list}>
        <div className={styles.listTitle}>Выбраны:</div>
        {selected.map(tag => (
          <span
            key={`selected-${tag.name}`}
            className={styles.tag}
            onClick={() => onUnselectClick(tag)}
          >
            {tag.name}
          </span>
        ))}
        {!selected.length && (
          <span className={styles.placeholder}>Нет тэгов</span>
        )}
      </div>
      <div className={styles.list}>
        <div className={styles.listTitle}>Поиск:</div>
        {results.map(tag => (
          <span
            key={`search-${tag.name}`}
            className={styles.tag}
            onClick={() => onSelectClick(tag)}
          >
            {tag.name}
          </span>
        ))}
        {!results.length && !!search.length && (
          <span className={styles.add} onClick={() => onAddClick(search)}>
            {search}
            <PlusIcon className={styles.addIcon} />
          </span>
        )}
        {!results.length && search.length === 0 && (
          <span className={styles.placeholder}>Нет тэгов</span>
        )}
      </div>
    </div>
  )
})

export default TagsSelector
