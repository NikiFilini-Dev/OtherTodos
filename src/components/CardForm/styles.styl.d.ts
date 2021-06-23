declare namespace StylesStylNamespace {
  export interface IStylesStyl {
    action: string
    actions: string
    active: string
    add: string
    addSubtask: string
    addTask: string
    angle: string
    avatar: string
    block: string
    cardName: string
    cardText: string
    checkbox: string
    dateTrigger: string
    done: string
    executorAvatar: string
    executorInfo: string
    executorTrigger: string
    executorWrapper: string
    files: string
    group: string
    head: string
    main: string
    mainPart: string
    modal: string
    modalPart: string
    name: string
    newComment: string
    newFile: string
    progress: string
    progressWrapper: string
    reject: string
    rotated: string
    search: string
    separator: string
    settings: string
    subtask: string
    subtasks: string
    tag: string
    tags: string
    tagsMenu: string
    tagsMenuTrigger: string
    trash: string
    user: string
    usersMenu: string
    wrapper: string
  }
}

declare const StylesStylModule: StylesStylNamespace.IStylesStyl & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StylesStylNamespace.IStylesStyl
}

export = StylesStylModule
