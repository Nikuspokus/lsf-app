import type { Sign } from '../types'

/** « Écureuil » → « ecureuil » : minuscules, sans accents ni ponctuation. */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/** Plus le score est petit, plus le mot colle à la recherche (-1 = aucune correspondance). */
function score(word: string, query: string): number {
  const normalized = normalizeText(word)
  if (normalized === query) return 0
  if (normalized.startsWith(query)) return 1
  if (normalized.split(' ').some((token) => token.startsWith(query))) return 2
  if (normalized.includes(query)) return 3
  return -1
}

/** Filtre et trie les signes selon une recherche (insensible à la casse et aux accents). */
export function searchSigns(signs: readonly Sign[], rawQuery: string): Sign[] {
  const query = normalizeText(rawQuery)
  const byWord = (a: Sign, b: Sign) => a.word.localeCompare(b.word, 'fr')
  if (!query) return [...signs].sort(byWord)

  return signs
    .map((sign) => ({ sign, rank: score(sign.word, query) }))
    .filter((entry) => entry.rank >= 0)
    .sort((a, b) => a.rank - b.rank || byWord(a.sign, b.sign))
    .map((entry) => entry.sign)
}
