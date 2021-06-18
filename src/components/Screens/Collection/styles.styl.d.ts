declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    add: string
    avatar: string
    columns: string
    head: string
    info: string
    remove: string
    screen: string
    screenWrapper: string
    settingsTrigger: string
    title: string
    user: string
    usersList: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
