import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs-extra'
import icongen from 'icon-gen'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const srcSvg = path.join(root, 'public', 'sit-and-study.svg')
const outDir = path.join(root, 'build-icons')

await fs.ensureDir(outDir)

console.log('Generating platform icons from', srcSvg)
await icongen(srcSvg, outDir, {
  report: true,
  ico: { name: 'icon' },
  icns: { name: 'icon' },
  favicon: { name: 'icon' },
})

console.log('Icons generated to', outDir)
