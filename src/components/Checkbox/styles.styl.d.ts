declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    checkbox: string
    checked: string
    checkmark: string
    colored: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
