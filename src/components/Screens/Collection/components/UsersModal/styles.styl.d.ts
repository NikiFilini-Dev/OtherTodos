declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    active: string
    add: string
    avatar: string
    block: string
    cardName: string
    cardText: string
    email: string
    emailsInput: string
    group: string
    head: string
    main: string
    mainPart: string
    modal: string
    modalPart: string
    name: string
    reject: string
    remove: string
    rotated: string
    separator: string
    title: string
    trash: string
    user: string
    users: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
