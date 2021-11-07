declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    dateElement: string
    dateElements: string
    day: string
    name: string
    today: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
