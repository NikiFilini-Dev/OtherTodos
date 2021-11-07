declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    active: string
    block: string
    email: string
    hasNew: string
    info: string
    item: string
    menu: string
    name: string
    rightPart: string
    signOut: string
    userInfo: string
    username: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
