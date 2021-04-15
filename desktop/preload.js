require = require('esm')(module) // eslint-disable-line no-global-assign
const { ipcRenderer, contextBridge } = require('electron')
const all = require('./src/interactors')
// We have to do a weird round trip on this because of the require/esm proxy
const interactors = Object.fromEntries(Object.entries(all))

contextBridge.exposeInMainWorld('interactors', interactors)
contextBridge.exposeInMainWorld('globalStore', { 
    get: async (key) => await ipcRenderer.invoke('getStoreValue', key),
    set: (key, value) => { ipcRenderer.send('setStoreValue', key, value) }
})
