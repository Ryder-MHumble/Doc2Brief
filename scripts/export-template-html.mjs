import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { demoDocument } from '../src/lib/mock.js'
import { templateCatalog } from '../src/lib/templates/catalog.js'
import { loadTemplateAssetFromFile } from '../src/lib/templates/node-assets.js'
import { renderTemplateHtml } from '../src/lib/templates/renderer.js'

const __filename = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(__filename), '..')
const outputDir = path.join(projectRoot, 'docs', 'assets', 'templates', 'html')
const generatedAt = '2026/05/21 09:00:00'

async function main() {
  const startedAt = Date.now()
  await fs.mkdir(outputDir, { recursive: true })

  printSystemLog('模板HTML导出', '开始', {
    outputDir: path.relative(projectRoot, outputDir),
    templateCount: templateCatalog.length,
    generatedAt,
  })

  const outputs = []
  for (const template of templateCatalog) {
    const html = await renderTemplateHtml(template.id, demoDocument, generatedAt, {
      runtimeMode: 'full',
      assetLoader: loadTemplateAssetFromFile,
    })
    const fileName = `${template.id}.html`
    const filePath = path.join(outputDir, fileName)
    await fs.writeFile(filePath, html, 'utf-8')

    const output = {
      templateId: template.id,
      templateName: template.title,
      filePath: path.relative(projectRoot, filePath),
      htmlLength: html.length,
    }
    outputs.push(output)
    printBusinessJson('模板HTML导出', '单模板输出', output)
  }

  await fs.writeFile(path.join(outputDir, 'index.html'), buildIndexHtml(outputs), 'utf-8')

  printBusinessJson('模板HTML导出', '汇总输出', {
    outputDir: path.relative(projectRoot, outputDir),
    indexPath: path.relative(projectRoot, path.join(outputDir, 'index.html')),
    files: outputs,
  })
  printSystemLog('模板HTML导出', '完成', {
    outputCount: outputs.length,
    durationMs: Date.now() - startedAt,
  })
}

function buildIndexHtml(outputs) {
  const cards = outputs
    .map(
      (item) => `
        <a class="card" href="./${escapeHtml(path.basename(item.filePath))}">
          <span class="chip">${escapeHtml(item.templateId)}</span>
          <strong>${escapeHtml(item.templateName)}</strong>
          <small>${escapeHtml(item.filePath)} · ${item.htmlLength} bytes</small>
        </a>`,
    )
    .join('')

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Doc2Brief 周报模板 HTML 预览</title>
  <style>
    :root {
      color: #18212f;
      background: #f3efe6;
      font-family: "Noto Serif SC", "Songti SC", "Microsoft YaHei", serif;
    }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at 14% 18%, rgba(255, 90, 47, .16), transparent 30rem),
        radial-gradient(circle at 88% 8%, rgba(0, 95, 115, .18), transparent 28rem),
        linear-gradient(135deg, #fff8ed 0%, #ece5d8 100%);
    }
    main {
      width: min(1120px, calc(100% - 40px));
      margin: 0 auto;
      padding: 56px 0;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.2rem, 5vw, 5.2rem);
      line-height: .92;
      letter-spacing: -.08em;
    }
    p {
      max-width: 680px;
      margin: 18px 0 34px;
      color: #516071;
      font-size: 1rem;
      line-height: 1.75;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .card {
      min-height: 138px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      color: inherit;
      text-decoration: none;
      background: rgba(255, 255, 255, .66);
      border: 1px solid rgba(24, 33, 47, .16);
      box-shadow: 0 20px 50px rgba(24, 33, 47, .08);
      transition: transform .18s ease, border-color .18s ease, background .18s ease;
    }
    .card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 90, 47, .7);
      background: rgba(255, 255, 255, .9);
    }
    .chip {
      width: fit-content;
      padding: 4px 8px;
      color: #fff;
      background: #18212f;
      font-size: .78rem;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    strong {
      display: block;
      font-size: 1.35rem;
    }
    small {
      color: #687386;
      line-height: 1.5;
      word-break: break-all;
    }
  </style>
</head>
<body>
  <main>
    <h1>周报模板<br />HTML 预览</h1>
    <p>以下页面由当前系统内置周报模板和示例周报模型直接渲染生成，可离线打开查看。</p>
    <section class="grid">
      ${cards}
    </section>
  </main>
</body>
</html>`
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function printBusinessJson(moduleName, eventName, payload) {
  console.info(`业务JSON | 模块=${moduleName} | 事件=${eventName} | 内容=${JSON.stringify(payload)}`)
}

function printSystemLog(moduleName, eventName, payload, isError = false) {
  const line = `系统日志${isError ? '-错误' : ''} | 模块=${moduleName} | 事件=${eventName} | 内容=${JSON.stringify(payload)}`
  ;(isError ? console.error : console.info)(line)
}

main().catch((error) => {
  printSystemLog('模板HTML导出', '失败', { message: error.message }, true)
  process.exitCode = 1
})
