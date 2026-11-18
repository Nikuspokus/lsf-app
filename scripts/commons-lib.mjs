// Fonctions pures (testables) pour l'import depuis Wikimedia Commons

/** Licences réutilisables dans une app, y compris commerciale (avec attribution). NC et ND sont exclues. */
export function isAllowedLicense(shortName = '') {
  const l = shortName.trim().toUpperCase()
  if (/-NC|-ND|\bNC\b|\bND\b/.test(l)) return false
  return /^(CC BY(-SA)?\b|CC0|PUBLIC DOMAIN|PD\b)/.test(l)
}

const NOISE = new Set(['lsf', 'fr', 'signe', 'sign', 'langue', 'des', 'signes', 'francaise', 'video', 'videos'])

/** "File:LSF-S'il vous plaît.webm" → "sil-vous-plait" */
export function normalizeTitle(title) {
  return title
    .replace(/^File:/i, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Normalisé sans les mots « bruit » (lsf, signe…) pour comparer au mot du signe. */
export function stem(title) {
  return normalizeTitle(title)
    .split('-')
    .filter((t) => t && !NOISE.has(t))
    .join('-')
}

/** exact = le titre ne contient que le mot du signe ; loose = il le contient comme mot entier. */
export function matchScore(title, signId) {
  const s = stem(title)
  if (s === signId) return 2
  if (`-${normalizeTitle(title)}-`.includes(`-${signId}-`)) return 1
  return 0
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
}
