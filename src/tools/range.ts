const range = (from: number, to?: number) => {
  if (!to) {
    to = from
    from = 0
  }
  const length = to - from
  return Array.from({ length }, (_, i) => from + i)
}

export default range