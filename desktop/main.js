const { app, ipcMain, BrowserWindow } = require('electron')
const path = require('path')
const Store = require('electron-store')

try {
  require('electron-reloader')(module)
} catch {}

let win

const schema = {
	artifacts: {
		type: 'object',
    default: {}
	}
}

let globalStore = new Store()
globalThis.globalStore = globalStore

ipcMain.handle("getStoreValue", async (event, key) => {
  return await globalStore.get(key);
});

ipcMain.handle("setStoreValue", (event, key, value) => {
  globalStore.set(key, value);
});

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
