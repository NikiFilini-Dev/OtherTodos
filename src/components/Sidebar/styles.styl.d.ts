declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    active: string
    addTrigger: string
    beta: string
    colorInput: string
    group: string
    groupElement: string
    groupElementAwesomeIcon: string
    groupElementIcon: string
    groupTitle: string
    groupTitleIcon: string
    groupTitleIconOpen: string
    logo: string
    logoTitle: string
    logoWrapper: string
    newName: string
    sidebar: string
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
