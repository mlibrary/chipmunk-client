import { ipcRenderer } from 'electron'

const getStoreValue = async (key) => {
    return await ipcRenderer.send('getStoreValue', key)
}

export default getStoreValue
export { getStoreValue }