export const ColorNames: ColorName[] = [
  "blue",
  "yellow",
  "green",
  "red",
  "lightblue",
  "purple",
  "teal",
  "black",
  "blue#2",
  "blue#3",
]
export type ColorName =
  | "blue"
  | "yellow"
  | "green"
  | "red"
  | "lightblue"
  | "purple"
  | "teal"
  | "black"
  | "blue#2"
  | "blue#3"
export const ColorsMap: Record<ColorName, string> = {
  blue: "#1C3BF1",
  yellow: "#FFAC0B",
  green: "#29E072",
  red: "#FB2B2B",
  lightblue: "#2F80ED",
  purple: "#9B51E0",
  teal: "rgba(14, 178, 178, 1)",
  black: "black",
  "blue#2": "#56CCF2",
  "blue#3": "#229FE6"
}