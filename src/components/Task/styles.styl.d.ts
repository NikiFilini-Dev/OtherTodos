declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    active: string
    addNew: string
    check: string
    checkPlaceholder: string
    colored: string
    date: string
    dateIcon: string
    dead: string
    delete: string
    done: string
    expired: string
    fullDate: string
    fullDateIcon: string
    fullOnly: string
    hasEvent: string
    hasTimeIcon: string
    inline: string
    line: string
    moveHandle: string
    note: string
    noteWrapper: string
    notes: string
    padding: string
    priorityWrapper: string
    project: string
    projectIcon: string
    promptButton: string
    promptButtons: string
    puller: string
    redo: string
    repeatCount: string
    resetTime: string
    selected: string
    separator: string
    spaceBetween: string
    startTimer: string
    subtask: string
    subtasks: string
    subtasksProgress: string
    subtasksProgressInfo: string
    tag: string
    tags: string
    tagsTrigger: string
    tagsTriggerIcon: string
    task: string
    taskText: string
    taskTextEdit: string
    totalTime: string
    trash: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
