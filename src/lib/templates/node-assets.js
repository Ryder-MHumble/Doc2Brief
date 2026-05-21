import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(__filename), '..', '..', '..')
const templateAssetCache = new Map()

const templateDirMap = {
  'template-01': '01',
  'template-02': '02',
  'template-03': '03',
  'template-04': '04',
  'template-05': '05',
  'template-06': '06',
  'template-07': '07',
  'template-08': '08',
  'template-09': '09',
}

export async function loadTemplateAssetFromFile(templateId) {
  if (templateAssetCache.has(templateId)) {
    return templateAssetCache.get(templateId)
  }

  const templateDir = templateDirMap[templateId]
  if (!templateDir) {
    return null
  }

  const assetRoot = path.join(projectRoot, 'template', templateDir)
  const [html, css, js] = await Promise.all([
    fs.readFile(path.join(assetRoot, 'index.html'), 'utf-8'),
    fs.readFile(path.join(assetRoot, 'style.css'), 'utf-8'),
    fs.readFile(path.join(assetRoot, 'app.js'), 'utf-8'),
  ])
  const asset = { html, css, js }
  templateAssetCache.set(templateId, asset)
  return asset
}
