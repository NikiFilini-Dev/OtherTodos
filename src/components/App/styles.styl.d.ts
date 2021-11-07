declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    active: string
    additionalDate: string
    app: string
    currentDate: string
    globalWrapper: string
    main: string
    mainAndTimeline: string
    noSidebar: string
    resizeHandle: string
    sideBar: string
    sideBarWrapper: string
    tabs: string
    timeline: string
    timer: string
    timerWrapper: string
    todayDate: string
    topBar: string
    verticalWrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
