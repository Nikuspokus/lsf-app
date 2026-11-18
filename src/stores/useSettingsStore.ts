import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'lsf-settings-v1'

function load(): { showWordFirst: boolean } {
  try {
    return { showWordFirst: false, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
  } catch {
    return { showWordFirst: false }
  }
}

export const useSettingsStore = defineStore('settings', () => {
  /** Mode découverte : le mot est visible dès l'affichage de la carte. */
  const showWordFirst = ref(load().showWordFirst)

  watch(showWordFirst, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify({ showWordFirst: value })))

  return { showWordFirst }
})
