#!/usr/bin/env node
// Importe des vidéos de signes depuis Wikimedia Commons (licences libres uniquement).
//
//   node scripts/import-commons.mjs                 # simulation : affiche les correspondances
//   node scripts/import-commons.mjs --download      # télécharge, compresse (ffmpeg), écrit les crédits
//   node scripts/import-commons.mjs --list          # affiche tous les fichiers trouvés (titre + licence)
//   options : --all (ajoute tous les mots Lingua Libre à la catégorie « Vocabulaire »)
//             --category=Nom_de_categorie (répétable)   --loose (correspondances partielles)
//
// Prérequis : Node 22+ et ffmpeg installé (brew install ffmpeg).
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanTitle, isAllowedLicense, matchScore, normalizeTitle, senseRank, stripHtml } from './commons-lib.mjs'

const args = process.argv.slice(2)
const download = args.includes('--download')
const loose = args.includes('--loose')
const list = args.includes('--list')
const all = args.includes('--all')
const categories = args.filter((a) => a.startsWith('--category=')).map((a) => a.slice(11))
if (!categories.length) categories.push('Videos_Langue_des_signes_française', 'Videos_of_French_Sign_Language')

const API = 'https://commons.wikimedia.org/w/api.php'
const HEADERS = { 'User-Agent': 'lsf-app-import/0.2 (https://github.com/Nikuspokus/lsf-app)' }
const root = new URL('../', import.meta.url)
const mediaDir = new URL('public/media/', root)
const creditsFile = new URL('src/data/credits.json', root)
const generatedFile = new URL('src/data/signs.generated.json', root)

// ids des signes saisis à la main dans src/data/signs.ts : s('categorie', 'id', 'Mot')
const signsSource = readFileSync(new URL('src/data/signs.ts', root), 'utf8')
const curatedIds = [...signsSource.matchAll(/\bs\('([^']+)',\s*'([^']+)'/g)].map((m) => m[2])

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

const isVideo = (page, info) =>
  /^video\//.test(info?.mime ?? '') || info?.mime === 'application/ogg' || /\.(webm|ogv|mp4|mpg|mov)$/i.test(page.title)

const pages = (await Promise.all(categories.map(fetchCategory))).flat()
console.log(`${pages.length} fichier(s) trouvé(s) dans ${categories.join(', ')}`)

if (list) {
  for (const page of pages) {
    const info = page.imageinfo?.[0]
    console.log(`${isVideo(page, info) ? 'V' : '-'} ${page.title}  [${info?.extmetadata?.LicenseShortName?.value ?? '?'}]`)
  }
  process.exit(0)
}

const usable = pages.filter((page) => {
  const info = page.imageinfo?.[0]
  return info && isVideo(page, info) && isAllowedLicense(info.extmetadata?.LicenseShortName?.value)
})
console.log(`${pages.length - usable.length} fichier(s) écarté(s) (pas une vidéo ou licence non réutilisable)\n`)

// --all : tous les enregistrements Lingua Libre deviennent des signes de la catégorie « Vocabulaire »
const extras = []
if (all) {
  const seen = new Set(curatedIds)
  for (const page of usable) {
    if (!/^File:LL-Q\d+/i.test(page.title)) continue
    const id = normalizeTitle(page.title)
    const word = cleanTitle(page.title).replace(/\s*\?+\s*$/, '').trim()
    if (!id || !word || seen.has(id)) continue
    seen.add(id)
    extras.push({ id, word })
  }
  extras.sort((a, b) => a.id.localeCompare(b.id, 'fr'))
}
const targetIds = [...curatedIds, ...extras.map((e) => e.id)]

const candidates = new Map() // id → { score, rank, page, info, meta }
for (const page of usable) {
  const info = page.imageinfo[0]
  const meta = info.extmetadata ?? {}
  for (const id of targetIds) {
    const score = matchScore(page.title, id)
    if (score === 2 || (loose && score === 1)) {
      const rank = senseRank(page.title)
      const best = candidates.get(id)
      if (!best || score > best.score || (score === best.score && rank < best.rank)) {
        candidates.set(id, { score, rank, page, info, meta })
      }
    }
  }
}

for (const id of curatedIds) {
  const c = candidates.get(id)
  console.log(`${c ? '✔' : '✘'} ${id.padEnd(16)} ${c ? `${c.page.title}  [${c.meta.LicenseShortName?.value}]` : '—'}`)
}
if (all) console.log(`\n+ ${extras.length} mot(s) Lingua Libre ajouté(s) à la catégorie « Vocabulaire »`)
console.log(`\n${candidates.size}/${targetIds.length} signe(s) trouvé(s).`)

if (!download) {
  console.log('Simulation : vérifie les correspondances, puis relance avec --download.')
  process.exit(0)
}

mkdirSync(mediaDir, { recursive: true })
const credits = existsSync(creditsFile) ? JSON.parse(readFileSync(creditsFile, 'utf8')) : {}
const tmp = join(tmpdir(), 'lsf-import')
mkdirSync(tmp, { recursive: true })

let done = 0
for (const [id, { info, meta }] of candidates) {
  const out = new URL(`${id}.mp4`, mediaDir).pathname
  const raw = join(tmp, 'current.src')
  try {
    const res = await fetch(info.url, { headers: HEADERS })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    writeFileSync(raw, Buffer.from(await res.arrayBuffer()))
    // mp4 H.264 sans son, 480 px de haut max, compatible iOS
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-an', '-vf', 'scale=-2:480',
      '-c:v', 'libx264', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out])
  } catch (error) {
    console.warn(`! ${id}: ${error.message}`)
    candidates.delete(id)
    continue
  } finally {
    rmSync(raw, { force: true })
  }
  credits[id] = {
    author: stripHtml(meta.Artist?.value) || 'Auteur inconnu',
    license: meta.LicenseShortName?.value ?? '',
    licenseUrl: meta.LicenseUrl?.value ?? '',
    source: info.descriptionurl ?? '',
  }
  console.log(`↓ ${++done}/${candidates.size} ${id}`)
}

writeFileSync(creditsFile, JSON.stringify(credits, null, 2) + '\n')
if (all) {
  const kept = extras.filter((e) => candidates.has(e.id))
  writeFileSync(generatedFile, JSON.stringify(kept, null, 2) + '\n')
  console.log(`${kept.length} mot(s) écrit(s) dans src/data/signs.generated.json`)
}
console.log('\nTerminé. Relance « npm run dev » pour vérifier, puis commit/push public/media, src/data/credits.json et signs.generated.json.')
