import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { demoDocument } from '../src/lib/mock.js'
import { renderTemplateHtml } from '../src/lib/templates/renderer.js'
import { templateCatalog } from '../src/lib/templates/catalog.js'
import { loadTemplateAssetFromFile } from '../src/lib/templates/node-assets.js'

const __filename = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(__filename), '..')
const outputDir = path.join(projectRoot, 'docs', 'assets', 'templates')

async function main() {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'doc2brief-template-gallery-'))
  await fs.mkdir(outputDir, { recursive: true })

  try {
    for (const template of templateCatalog) {
      const html = await renderTemplateHtml(template.id, demoDocument, '2026/05/21 09:00:00', {
        runtimeMode: 'full',
        assetLoader: loadTemplateAssetFromFile,
      })
      const htmlPath = path.join(tempDir, `${template.id}.html`)
      const imagePath = path.join(outputDir, `${template.id}.png`)
      await fs.writeFile(htmlPath, html, 'utf-8')
      await captureScreenshot(pathToFileURL(htmlPath).href, imagePath)
      console.info(`业务JSON | 模块=模板图库 | 事件=截图输出 | 内容=${JSON.stringify({
        templateId: template.id,
        templateName: template.title,
        imagePath: path.relative(projectRoot, imagePath),
      })}`)
    }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

function captureScreenshot(url, imagePath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      [
        'playwright',
        'screenshot',
        '--viewport-size=1365,900',
        '--wait-for-timeout=900',
        '--timeout=15000',
        url,
        imagePath,
      ],
      {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    )
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`模板截图失败：${imagePath}\n${stdout}\n${stderr}`.trim()))
    })
  })
}

main().catch((error) => {
  console.error(`系统日志-错误 | 模块=模板图库 | 事件=截图失败 | 内容=${JSON.stringify({ message: error.message })}`)
  process.exitCode = 1
})
