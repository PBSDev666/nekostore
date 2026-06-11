import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export function saveFile(buffer, filename) {
  ensureUploadDir()
  const ext = path.extname(filename) || '.jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
  const filepath = path.join(UPLOAD_DIR, name)
  fs.writeFileSync(filepath, buffer)
  return `/uploads/${name}`
}

export function deleteFile(url) {
  if (!url) return
  const name = path.basename(url)
  const filepath = path.join(UPLOAD_DIR, name)
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath)
  }
}

export { UPLOAD_DIR }
