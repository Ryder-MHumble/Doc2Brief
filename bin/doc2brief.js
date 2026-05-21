#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import mammoth from 'mammoth'
import { buildAgentWeeklyReport } from '../src/lib/weekly-report-agent.js'
import { renderTemplateHtml } from '../src/lib/templates/renderer.js'
import { loadTemplateAssetFromFile } from '../src/lib/templates/node-assets.js'

const DEFAULT_BASE_URL = 'http://127.0.0.1:5173'
const MAX_SOURCE_CHARS = Number(process.env.MAX_SOURCE_CHARS || 18000)

main().catch((error) => {
  printSystemLog('Doc2Brief CLI', '执行失败', { message: error.message }, true)
  process.exitCode = 1
})

async function main() {
  const [command, ...argv] = process.argv.slice(2)
  const options = parseOptions(argv)

  if (!command || command === 'help' || options.help) {
    printHelp()
    return
  }

  if (command === 'generate') {
    await handleGenerate(options)
    return
  }

  if (command === 'update') {
    await handleUpdate(options)
    return
  }

  throw new Error(`未知命令：${command}`)
}

async function handleGenerate(options) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.DOC2BRIEF_BASE_URL || DEFAULT_BASE_URL)
  const rawText = await resolveInputText(options)

  const result = await buildReportHtml({
    rawText,
    requestedTemplateId: options.template || 'auto',
    titleOverride: options.title || '',
    sensitiveMode: Boolean(options.sensitive),
  })

  if (options.output) {
    await fs.writeFile(path.resolve(options.output), result.html, 'utf-8')
  }

  const published = await publishReport({
    baseUrl,
    html: result.html,
    title: result.document.title,
    templateId: result.templateMeta.id,
    generatedAt: result.generatedAt,
    sourceType: result.sourceType,
  })

  const payload = {
    action: 'generate',
    reportId: published.reportId,
    shareUrl: published.shareUrl,
    templateId: result.templateMeta.id,
    templateName: result.templateMeta.title,
    matchReason: result.selection.reason,
    title: result.document.title,
    htmlLength: result.html.length,
    generatedAt: result.generatedAt,
  }
  printBusinessJson('Doc2Brief CLI', '生成输出', payload)
  writeResult(payload, options)
}

async function handleUpdate(options) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.DOC2BRIEF_BASE_URL || DEFAULT_BASE_URL)
  const reportId = resolveReportId(options)
  if (!reportId) {
    throw new Error('update 命令必须提供 --report-id 或 --url')
  }

  const previousMeta = await tryFetchReportMeta(baseUrl, reportId)
  const rawText = await resolveInputText(options)
  const result = await buildReportHtml({
    rawText,
    requestedTemplateId: options.template || '',
    previousTemplateId: previousMeta?.templateId || '',
    titleOverride: options.title || previousMeta?.title || '',
    sensitiveMode: Boolean(options.sensitive),
  })

  if (options.output) {
    await fs.writeFile(path.resolve(options.output), result.html, 'utf-8')
  }

  const updated = await updateReport({
    baseUrl,
    reportId,
    html: result.html,
    title: result.document.title,
    templateId: result.templateMeta.id,
    generatedAt: result.generatedAt,
    sourceType: result.sourceType,
  })

  const payload = {
    action: 'update',
    reportId: updated.reportId,
    shareUrl: updated.shareUrl,
    templateId: result.templateMeta.id,
    templateName: result.templateMeta.title,
    matchReason: result.selection.reason,
    title: result.document.title,
    htmlLength: result.html.length,
    updatedAt: updated.updatedAt,
  }
  printBusinessJson('Doc2Brief CLI', '更新输出', payload)
  writeResult(payload, options)
}

async function buildReportHtml(params) {
  const sourceText = String(params.rawText || '').slice(0, MAX_SOURCE_CHARS)
  const generatedAt = new Date().toLocaleString('zh-CN', { hour12: false })
  const { document, templateMeta, selection } = buildAgentWeeklyReport({
    rawText: sourceText,
    requestedTemplateId: params.requestedTemplateId,
    previousTemplateId: params.previousTemplateId,
    titleOverride: params.titleOverride,
    sensitiveMode: params.sensitiveMode,
  })
  const html = await renderTemplateHtml(templateMeta.id, document, generatedAt, {
    runtimeMode: 'full',
    assetLoader: loadTemplateAssetFromFile,
  })

  printBusinessJson('Doc2Brief CLI', '模板匹配', {
    templateId: templateMeta.id,
    templateName: templateMeta.title,
    reason: selection.reason,
    rawLength: sourceText.length,
  })

  return {
    document,
    templateMeta,
    selection,
    generatedAt,
    html,
    sourceType: 'cli-text',
  }
}

async function resolveInputText(options) {
  const manualText = String(options.text || '').trim()
  if (manualText) {
    return manualText
  }

  if (!options.input) {
    throw new Error('必须提供 --input 文件路径或 --text 文本')
  }

  const inputPath = path.resolve(options.input)
  const suffix = path.extname(inputPath).toLowerCase().replace('.', '')
  printSystemLog('Doc2Brief CLI', '读取输入', { inputPath, suffix })

  if (['txt', 'md', 'csv', 'html'].includes(suffix)) {
    return fs.readFile(inputPath, 'utf-8')
  }

  if (suffix === 'docx') {
    const result = await mammoth.extractRawText({ path: inputPath })
    return result.value
  }

  if (suffix === 'pdf') {
    return extractPdfText(inputPath)
  }

  throw new Error('CLI 当前支持 TXT、MD、CSV、HTML、DOCX、PDF 输入；旧版 DOC 请先转为 DOCX')
}

async function extractPdfText(inputPath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(await fs.readFile(inputPath))
  const pdf = await pdfjs.getDocument({ data, disableWorker: true }).promise
  const pageTexts = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    const line = content.items
      .map((item) => ('str' in item && typeof item.str === 'string' ? item.str : ''))
      .join(' ')
    pageTexts.push(line)
  }

  return pageTexts.join('\n')
}

async function publishReport(payload) {
  const endpoint = `${payload.baseUrl}/api/reports/publish`
  printSystemLog('Doc2Brief CLI', '发布报告', { endpoint, title: payload.title, templateId: payload.templateId })
  return requestJson(endpoint, {
    method: 'POST',
    body: {
      title: payload.title,
      html: payload.html,
      generationMode: 'agent-skill',
      templateId: payload.templateId,
      generatedAt: payload.generatedAt,
      sourceType: payload.sourceType,
    },
  })
}

async function updateReport(payload) {
  const endpoint = `${payload.baseUrl}/api/reports/update`
  printSystemLog('Doc2Brief CLI', '更新报告', {
    endpoint,
    reportId: payload.reportId,
    title: payload.title,
    templateId: payload.templateId,
  })
  return requestJson(endpoint, {
    method: 'POST',
    body: {
      reportId: payload.reportId,
      title: payload.title,
      html: payload.html,
      generationMode: 'agent-skill',
      templateId: payload.templateId,
      generatedAt: payload.generatedAt,
      sourceType: payload.sourceType,
    },
  })
}

async function tryFetchReportMeta(baseUrl, reportId) {
  try {
    const data = await requestJson(`${baseUrl}/api/reports/meta?reportId=${encodeURIComponent(reportId)}`)
    return data.report || null
  } catch (error) {
    printSystemLog('Doc2Brief CLI', '读取报告元数据失败，改用自动模板匹配', {
      reportId,
      message: error.message,
    })
    return null
  }
}

async function requestJson(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const rawText = await response.text()
  let data = {}
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { message: rawText }
    }
  }
  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}`)
  }
  return data
}

function resolveReportId(options) {
  const explicit = String(options.reportId || '').trim()
  if (explicit) {
    return explicit
  }
  const url = String(options.url || '').trim()
  const match = url.match(/\/r\/([^/?#]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function parseOptions(argv) {
  const options = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      continue
    }
    const key = toCamelCase(token.slice(2))
    if (['json', 'sensitive', 'help'].includes(key)) {
      options[key] = true
      continue
    }
    const value = argv[index + 1]
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`参数 ${token} 缺少取值`)
    }
    options[key] = value
    index += 1
  }
  return options
}

function toCamelCase(value) {
  return String(value || '').replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

function normalizeBaseUrl(value) {
  return String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, '')
}

function writeResult(payload, options) {
  if (options.json) {
    process.stdout.write(`${JSON.stringify(payload)}\n`)
    return
  }
  process.stdout.write(`周报链接：${payload.shareUrl}\n报告 ID：${payload.reportId}\n模板：${payload.templateName}\n`)
}

function printBusinessJson(module, event, payload = {}) {
  process.stderr.write(`业务JSON | 模块=${module} | 事件=${event} | 内容=${JSON.stringify(payload)}\n`)
}

function printSystemLog(module, event, payload = {}, isError = false) {
  const line = `系统日志${isError ? '-错误' : ''} | 模块=${module} | 事件=${event} | 内容=${JSON.stringify(payload)}\n`
  process.stderr.write(line)
}

function printHelp() {
  process.stdout.write(`Doc2Brief CLI

用法：
  doc2brief generate --input ./weekly.md --base-url http://127.0.0.1:5173 --json
  doc2brief generate --text "本周完成..." --template auto --json
  doc2brief update --report-id rpt_xxx --input ./weekly-edited.md --json
  doc2brief update --url http://127.0.0.1:5173/r/rpt_xxx --text "修改后的内容" --json

核心参数：
  --input       输入文件，支持 TXT/MD/CSV/HTML/DOCX/PDF
  --text        直接输入文本
  --template    template-01 到 template-09，默认 auto
  --report-id   update 时指定已有报告 ID
  --url         update 时也可传已有周报链接
  --base-url    已部署的 Doc2Brief 服务地址，默认 ${DEFAULT_BASE_URL}
  --output      可选，把生成的 HTML 同步写到本地文件
  --json        只在 stdout 输出机器可读 JSON
`)
}
