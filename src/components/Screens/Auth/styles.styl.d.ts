declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    bluePart: string
    button: string
    content: string
    error: string
    errors: string
    form: string
    input: string
    inputName: string
    logo: string
    screen: string
    services: string
    switch: string
    text: string
    title: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
