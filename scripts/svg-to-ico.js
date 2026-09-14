import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

async function run() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const root = path.join(__dirname, '..')
  const svg = path.join(root, 'public', 'favicon.svg')
  if (!fs.existsSync(svg)) {
    console.error('favicon.svg not found at', svg)
    process.exit(1)
  }
  const sizes = [16, 32, 48, 256]
  const pngPaths = []
  for (const s of sizes) {
    const out = path.join(root, `.tmp-favicon-${s}.png`)
    await sharp(svg).resize(s, s).png().toFile(out)
    pngPaths.push(out)
  }
  const icoBuffer = await pngToIco(pngPaths)
  fs.writeFileSync(path.join(root, 'suppirette.ico'), icoBuffer)
  // cleanup
  for (const p of pngPaths) fs.unlinkSync(p)
  console.log('suppirette.ico written to project root')
}

run().catch((e) => { console.error(e); process.exit(1) })
