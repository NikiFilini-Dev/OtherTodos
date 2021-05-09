declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    active: string
    check: string
    checkPlaceholder: string
    colored: string
    date: string
    dateIcon: string
    delete: string
    done: string
    expired: string
    fullDate: string
    fullDateIcon: string
    fullOnly: string
    hasEvent: string
    inline: string
    line: string
    notes: string
    padding: string
    priorityWrapper: string
    project: string
    projectIcon: string
    puller: string
    redo: string
    repeatCount: string
    selected: string
    spaceBetween: string
    tag: string
    tags: string
    tagsTrigger: string
    tagsTriggerIcon: string
    task: string
    taskText: string
    taskTextEdit: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
