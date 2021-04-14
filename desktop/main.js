const { app, BrowserWindow } = require('electron')
const path = require('path')

try {
  require('electron-reloader')(module)
} catch {}

let win

function createWindow () {
  win = new BrowserWindow({
    width: 980,
    height: 680,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  })

  win.loadFile('public/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
