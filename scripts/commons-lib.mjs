// Fonctions pures (testables) pour l'import depuis Wikimedia Commons

/** Licences réutilisables dans une app, y compris commerciale (avec attribution). NC et ND sont exclues. */
export function isAllowedLicense(shortName = '') {
  const l = shortName.trim().toUpperCase()
  if (/-NC|-ND|\bNC\b|\bND\b/.test(l)) return false
  return /^(CC BY(-SA)?\b|CC0|PUBLIC DOMAIN|PD\b)/.test(l)
}

const NOISE = new Set(['lsf', 'fsl'])
const GRAMMAR = '(?:n|nm|nf|nmf|adj|adv|v|vt|vi|vpr|prep|pron|interj|conj|det|loc|num|art|excl)'

/**
 * Retire les décorations des titres Commons pour ne garder que le mot signé :
 *  - Elix        : "File:Bonjour Nm 1 1 1 - Elix.webm"                    → "Bonjour"
 *  - Lingua Libre: "File:LL-Q33302 (fsl)-Laura Jauvert-Acheter.webm"      → "Acheter"
 */
export function cleanTitle(title) {
  return title
    .replace(/^File:/i, '')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/^LL-Q\d+\s*\([a-z-]+\)-[^-]+-/i, '')
    .replace(/\s*-\s*Elix$/i, '')
    .replace(new RegExp(`\\s+${GRAMMAR}(?:\\s+\\d+)*$`, 'i'), '')
}

/** "File:LSF-S'il vous plaît.webm" → "lsf-sil-vous-plait" */
export function normalizeTitle(title) {
  return cleanTitle(title)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Normalisé sans les mots « bruit » (lsf…) pour comparer au mot du signe. */
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

/**
 * Départage plusieurs fichiers pour un même mot (plus petit = meilleur) :
 * Lingua Libre (mot isolé) d'abord, puis Elix sens 1.1.1, 1.1.2… puis les autres sens.
 */
export function senseRank(title) {
  if (/^File:LL-Q\d+/i.test(title)) return 0
  const m = title.match(/\s((?:\d+\s?){1,3})-\s*Elix\.[a-z0-9]+$/i)
  if (!m) return 1
  const [a = 9, b = 9, c = 9] = m[1].trim().split(/\s+/).map(Number)
  return 1 + a * 10000 + b * 100 + c
}

export function stripHtml(html = '') {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim()
}
