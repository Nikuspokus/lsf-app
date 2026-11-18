export interface Category {
  id: string
  label: string
  emoji: string
}

export interface Sign {
  /** identifiant = nom du fichier média (ex. "bonjour" → public/media/bonjour.mp4) */
  id: string
  word: string
  category: string
  /** aide-mémoire optionnel affiché après révélation */
  hint?: string
}

/** État Leitner d'une carte : boîte 1 (à apprendre) → 5 (maîtrisé) */
export interface CardState {
  box: number
  due: number
}
