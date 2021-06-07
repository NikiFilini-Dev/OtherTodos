declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    active: string
    angle: string
    head: string
    icon: string
    list: string
    select: string
    stretch: string
    variant: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
