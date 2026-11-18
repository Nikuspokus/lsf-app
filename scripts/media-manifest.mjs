// Liste les fichiers de public/media dans src/data/media-manifest.json
// (convention : un média = <id-du-signe>.mp4|webm|gif|webp)
import { readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'

const dir = new URL('../public/media/', import.meta.url)
const out = new URL('../src/data/media-manifest.json', import.meta.url)
const files = existsSync(dir)
  ? readdirSync(dir).filter((f) => /\.(mp4|webm|gif|webp)$/i.test(f)).sort()
  : []
mkdirSync(new URL('../src/data/', import.meta.url), { recursive: true })
writeFileSync(out, JSON.stringify(files, null, 2) + '\n')
console.log(`[media] ${files.length} fichier(s) référencé(s)`)
