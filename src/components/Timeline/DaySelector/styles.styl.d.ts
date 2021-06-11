declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    alien: string
    calendar: string
    changeMonth: string
    currentMonth: string
    day: string
    dayname: string
    hasTasksMark: string
    monthsSelector: string
    selected: string
    today: string
    week: string
    yearHint: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
