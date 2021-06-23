import React from "react"
import { observer } from "mobx-react"
import classNames from "classnames"
import styles from "./styles.styl"
import noop from "lodash-es/noop"

const Input = observer(
  ({
    placeholder,
    value,
    onChange,
    onSubmit = noop,
    type = "text",
    name = "",
  }) => {
    const ref = React.useRef<HTMLInputElement>(null)

    React.useEffect(() => {
      if (!ref.current) return
      const onKeydown = e => {
        if (e.code === "Enter") onSubmit()
      }
      ref.current.addEventListener("keydown", onKeydown)

      return () => {
        if (!ref.current) return
        ref.current.removeEventListener("keydown", onKeydown)
      }
    })

    return (
        <input
          className={styles.input}
          ref={ref}
          value={value}
          onChange={onChange}
          type={type}
          name={name}
          placeholder={placeholder}
        />
    )
  },
)

export default Input
