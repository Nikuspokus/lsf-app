#!/usr/bin/env node
// Importe des vidéos de signes depuis Wikimedia Commons (licences libres uniquement).
//
//   node scripts/import-commons.mjs                 # simulation : affiche les correspondances
//   node scripts/import-commons.mjs --download      # télécharge, compresse (ffmpeg), écrit les crédits
//   node scripts/import-commons.mjs --list         # affiche tous les fichiers trouvés (titre + licence)
//   options : --category=Nom_de_categorie (répétable)   --loose (accepte les correspondances partielles)
//
// Prérequis : Node 22+ et ffmpeg installé (brew install ffmpeg).
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isAllowedLicense, matchScore, stripHtml } from './commons-lib.mjs'

const args = process.argv.slice(2)
const download = args.includes('--download')
const loose = args.includes('--loose')
const list = args.includes('--list')
const categories = args.filter((a) => a.startsWith('--category=')).map((a) => a.slice(11))
if (!categories.length) categories.push('Videos_Langue_des_signes_française', 'Videos_of_French_Sign_Language')

const API = 'https://commons.wikimedia.org/w/api.php'
const HEADERS = { 'User-Agent': 'lsf-app-import/0.1 (https://github.com/Nikuspokus/lsf-app)' }
const root = new URL('../', import.meta.url)
const mediaDir = new URL('public/media/', root)
const creditsFile = new URL('src/data/credits.json', root)

// ids des signes depuis src/data/signs.ts (lignes s('categorie', 'id', 'Mot'))
const signsSource = readFileSync(new URL('src/data/signs.ts', root), 'utf8')
const signIds = [...signsSource.matchAll(/\bs\('([^']+)',\s*'([^']+)'/g)].map((m) => m[2])

async function fetchCategory(category) {
  const files = []
  let cont = {}
  do {
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', generator: 'categorymembers',
      gcmtitle: `Category:${category}`, gcmtype: 'file', gcmlimit: '50',
      prop: 'imageinfo', iiprop: 'url|mime|extmetadata', ...cont,
    })
    const res = await fetch(`${API}?${params}`, { headers: HEADERS })
    if (!res.ok) throw new Error(`Commons ${res.status}`)
    const data = await res.json()
    files.push(...(data.query?.pages ?? []))
    cont = data.continue ?? null
  } while (cont)
  return files
}

const pages = (await Promise.all(categories.map(fetchCategory))).flat()
console.log(`${pages.length} fichier(s) trouvé(s) dans ${categories.join(', ')}`)

const isVideo = (page, info) =>
  /^video\//.test(info?.mime ?? '') || info?.mime === 'application/ogg' || /\.(webm|ogv|mp4|mpg|mov)$/i.test(page.title)

if (list) {
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    console.log(`${isVideo(page, info) ? 'V' : '-'} ${page.title}  [${info?.extmetadata?.LicenseShortName?.value ?? '?'}]`)
  }
  process.exit(0)
}

const candidates = new Map() // id → { score, page }
let rejectedLicense = 0
for (const page of pages) {
  const info = page.imageinfo?.[0]
  if (!info || !isVideo(page, info)) continue
  const meta = info.extmetadata ?? {}
  if (!isAllowedLicense(meta.LicenseShortName?.value)) { rejectedLicense++; continue }
  for (const id of signIds) {
    const score = matchScore(page.title, id)
    if (score === 2 || (loose && score === 1)) {
      const best = candidates.get(id)
      if (!best || score > best.score) candidates.set(id, { score, page, info, meta })
    }
  }
}

console.log(`${rejectedLicense} fichier(s) écarté(s) (licence non réutilisable)\n`)
for (const id of signIds) {
  const c = candidates.get(id)
  console.log(`${c ? '✔' : '✘'} ${id.padEnd(16)} ${c ? `${c.page.title}  [${c.meta.LicenseShortName?.value}]` : '—'}`)
}
console.log(`\n${candidates.size}/${signIds.length} signe(s) trouvé(s).`)

if (!download) {
  console.log('Simulation : vérifie les correspondances, puis relance avec --download.')
  process.exit(0)
}

mkdirSync(mediaDir, { recursive: true })
const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {}
const tmp = join(tmpdir(), 'lsf-import')
mkdirSync(tmp, { recursive: true })

for (const [id, { page, info, meta }] of candidates) {
  const raw = join(tmp, `${id}.src`)
  const out = new URL(`${id}.mp4`, mediaDir).pathname
  const res = await fetch(info.url, { headers: HEADERS })
  if (!res.ok) { console.warn(`! ${id}: téléchargement ${res.status}`); continue }
  writeFileSync(raw, Buffer.from(await res.arrayBuffer()))
  // mp4 H.264 sans son, 480 px de haut max, compatible iOS
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-an', '-vf', 'scale=-2:480',
    '-c:v', 'libx264', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
  rmSync(raw)
  credits[id] = {
    author: stripHtml(meta.Artist?.value) || 'Auteur inconnu',
    license: meta.LicenseShortName?.value ?? '',
    licenseUrl: meta.LicenseUrl?.value ?? '',
    source: info.descriptionurl ?? '',
  }
  console.log(`↓ ${id}`)
}

writeFileSync(creditsFile, JSON.stringify(credits, null, 2) + '\n')
console.log('\nTerminé. Relance « npm run dev » pour vérifier, puis commit/push public/media et src/data/credits.json.')
