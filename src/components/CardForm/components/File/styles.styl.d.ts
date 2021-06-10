declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    excel: string
    file: string
    image: string
    info: string
    name: string
    powerpoint: string
    size: string
    trash: string
    word: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
