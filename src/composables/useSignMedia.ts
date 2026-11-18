import manifest from '../data/media-manifest.json'

const EXTENSIONS = ['mp4', 'webm', 'gif', 'webp']
const available = new Set<string>(manifest)

/** URL du média d'un signe (convention <id>.<ext> dans public/media) ou null s'il n'existe pas. */
export function mediaUrl(id: string): string | null {
  const ext = EXTENSIONS.find((e) => available.has(`${id}.${e}`))
  return ext ? `${import.meta.env.BASE_URL}media/${id}.${ext}` : null
}

export function hasMedia(id: string): boolean {
  return mediaUrl(id) !== null
}
