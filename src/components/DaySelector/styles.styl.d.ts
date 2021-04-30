declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    alien: string
    bigTitle: string
    calendar: string
    day: string
    dayname: string
    hasTasksMark: string
    littleTitle: string
    selected: string
    shortDate: string
    today: string
    topBig: string
    topLittle: string
    trigger: string
    week: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
