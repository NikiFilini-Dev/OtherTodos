export const ColorsMap = {
  blue: "#1C3BF1",
  yellow: "#FFAC0B",
  green: "#46C04D",
  red: "#FB2B2B",
  lightblue: "#2F80ED",
  purple: "#9B51E0",
  teal: "rgba(14, 178, 178, 1)",
  black: "black",
  "blue#2": "#56CCF2",
  "blue#3": "#229FE6",
  "grey": "#9BABC5",
  "grey#2": "#DEE4F5",
  "grey#3": "#F6F6F6",
  "grey#4": "#ABABA8",
  "grey#5": "#2B4E55",
  "red#2": "#B8060C",
  "red#3": "#8B071C",
  "pink": "#F37180",
  "pink#2": "#D66094",
  violet: "#A2238E",
  "violet#2": "#802A8F",
  "violet#3": "#BC9FC0",
  "violet#4": "#6C2841",
  "brown": "#471F17",
  "blown#2": "#866E26",
  "brown#3": "#ABABA8",
  "green#2": "#0E9658",
}

export type ColorName = keyof typeof ColorsMap

export const ColorNames: ColorName[] = Object.keys(ColorsMap) as ColorName[]