export interface Movable {
  id: string
  index: number
  setIndex?: (val: number) => void
}

export function nextIndex(arr: Movable[]) {
  return arr.reduce((acc, el) => (el.index > acc ? el.index : acc), -1)
}

export function move<T extends Movable>(
  arr: T[],
  id: string,
  newIndex: number,
  filter?: (element: T) => boolean,
) {
  if (filter) arr = arr.filter(el => filter(el))
  if (newIndex > arr.length - 1) newIndex = arr.length - 1

  const currentIndex = arr.find(el => el.id === id)?.index
  if (currentIndex === undefined) throw new Error("object not found in list")

  arr.forEach(element => {
    if (!element.setIndex)
      throw new Error("element does not have setIndex method")

    if (element.id === id) return element.setIndex(newIndex)

    if (element.index < currentIndex && element.index >= newIndex) {
      element.setIndex(element.index + 1)
    }
    if (element.index > currentIndex && element.index <= newIndex) {
      element.setIndex(element.index - 1)
    }
  })
}
