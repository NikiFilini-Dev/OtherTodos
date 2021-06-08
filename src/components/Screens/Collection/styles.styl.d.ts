declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    columns: string
    head: string
    info: string
    screen: string
    settingsTrigger: string
    title: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
