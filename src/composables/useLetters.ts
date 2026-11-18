/** Première lettre d'un mot, sans accent et en majuscule (« Épée » → « E »). */
export function firstLetter(word: string): string {
  return word.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase()
}
