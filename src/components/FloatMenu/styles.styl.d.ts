declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    bottom: string
    center: string
    horizontal_left: string
    left: string
    leftbottom: string
    middle: string
    rectang: string
    right: string
    tail: string
    vertical_left: string
    vertical_right: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
