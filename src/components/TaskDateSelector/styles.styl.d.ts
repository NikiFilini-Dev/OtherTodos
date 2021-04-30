declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    alien: string
    calendar: string
    day: string
    dayname: string
    disabled: string
    eventCheckbox: string
    eventMenu: string
    fixedElement: string
    info: string
    menuAction: string
    menuItem: string
    menuItemName: string
    menuItemValue: string
    monthText: string
    selected: string
    todayMark: string
    week: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
