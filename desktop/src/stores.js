import { writable } from 'svelte/store'

function createArtifactList () {
	const { subscribe, set, update } = writable({
    artifacts: {},
    list: []
  })

  return {
    subscribe,
    update: (item) => update(obj => {
      obj.artifacts[item.identifier] = item
      return obj
    }),
    push: (item) => update(obj => {
      obj.artifacts[item.identifier] = item
      obj.list = [...obj.list, item]
      return obj
    }),
    reset: () => set([])
  }
}

function createEventLog () {
	const { subscribe, set, update } = writable([])

  return {
    subscribe,
    push: (event) => update(events => {
      events = [...events, event]
    }),
    clear: () => set([])
  }
}

export const artifactList = createArtifactList()
export const events = createEventLog()