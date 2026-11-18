import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { CardState } from '../types'

const STORAGE_KEY = 'lsf-progress-v1'
const DAY = 24 * 60 * 60 * 1000
/** Délai avant la prochaine révision selon la boîte Leitner (1 → 5) */
const INTERVALS_DAYS = [0, 1, 3, 7, 14, 30]
const MAX_BOX = 5

function load(): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export const useProgressStore = defineStore('progress', () => {
  const cards = ref<Record<string, CardState>>(load())

  watch(cards, (value) => localStorage.setItem(STORAGE_KEY, JSON.stringify(value)), { deep: true })

  function isDue(id: string): boolean {
    const card = cards.value[id]
    return !card || card.due <= Date.now()
  }

  function rate(id: string, known: boolean) {
    const box = known ? Math.min((cards.value[id]?.box ?? 0) + 1, MAX_BOX) : 1
    cards.value[id] = { box, due: Date.now() + INTERVALS_DAYS[box] * DAY }
  }

  /** Un signe est « maîtrisé » à partir de la boîte 4. */
  function masteredCount(ids: string[]): number {
    return ids.filter((id) => (cards.value[id]?.box ?? 0) >= 4).length
  }

  function reset() {
    cards.value = {}
  }

  return { cards, isDue, rate, masteredCount, reset }
})
