declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    alien: string
    day: string
    dayname: string
    fixedElement: string
    info: string
    monthText: string
    selected: string
    todayMark: string
    week: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
