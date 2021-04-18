const {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  Menu,
  MenuItem,
} = require("electron")

const server = "https://hazel.lunavod.vercel.app"
const feed = `${server}/update/${process.platform}/${app.getVersion()}`

autoUpdater.setFeedURL(feed)
autoUpdater.addListener("error", e => {
  console.error(e)
})
setInterval(() => {
  try {
    autoUpdater.checkForUpdates()
  } catch (err) {
    console.error(err)
  }
}, 10000)
autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  }

  dialog.showMessageBox(dialogOpts).then(returnValue => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit()
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 700,
    transparent: true,
    titleBarStyle: "hiddenInset",
    // frame: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  })

  //todo Проверять, существует ли окно
  app.on("browser-window-focus", () => {
    try {
      mainWindow.webContents.send("focus", "focused")
    } catch (err) {
      console.error(err)
    }
  })

  if (process.platform === "darwin") {
    const electronVibrancy = require("electron-vibrancy")
    let material = 0
    electronVibrancy.SetVibrancy(mainWindow, material)
  }

  // and load the index.html of the app.
  if (process.env.P_ENV === "debug") mainWindow.webContents.openDevTools()
  // eslint-disable-next-line no-undef
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  const systemMenu = Menu.getApplicationMenu()
  const viewWindow = systemMenu.items.find(item => item.role === "viewmenu")
  viewWindow.submenu.append(
    new MenuItem({
      role: "zoomin",
      accelerator: "CommandOrControl+=",
      visible: false,
    }),
  )
  Menu.setApplicationMenu(systemMenu)

  // Open the DevTools.
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
