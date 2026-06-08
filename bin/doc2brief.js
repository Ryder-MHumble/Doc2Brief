#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import mammoth from 'mammoth'

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

  const generated = await requestJson(`${baseUrl}/api/weekly-reports/generate`, {
    method: 'POST',
    body: {
      text: rawText,
      templateId: normalizeTemplateOption(options.template || 'auto'),
      title: options.title || '',
      sensitiveMode: Boolean(options.sensitive),
      sourceType: 'cli-text',
    },
  })

  if (options.output) {
    await writePublishedHtml(options.output, generated.shareUrl)
  }

  const payload = normalizeApiResult('generate', generated)
  printBusinessJson('Doc2Brief CLI', '生成输出', payload)
  writeResult(payload, options)
}

async function handleUpdate(options) {
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.DOC2BRIEF_BASE_URL || DEFAULT_BASE_URL)
  const reportId = resolveReportId(options)
  if (!reportId) {
    throw new Error('update 命令必须提供 --report-id 或 --url')
  }

  const rawText = await resolveOptionalInputText(options)
  const instruction = String(options.instruction || options.instructions || options.edit || '').trim()

  const updated = await requestJson(`${baseUrl}/api/weekly-reports/update`, {
    method: 'POST',
    body: {
      reportId,
      text: rawText,
      instruction,
      templateId: normalizeTemplateOption(options.template || ''),
      title: options.title || '',
      sensitiveMode: Boolean(options.sensitive),
      sourceType: 'cli-text',
    },
  })

  if (options.output) {
    await writePublishedHtml(options.output, updated.shareUrl)
  }

  const payload = normalizeApiResult('update', updated)
  printBusinessJson('Doc2Brief CLI', '更新输出', payload)
  writeResult(payload, options)
}

async function writePublishedHtml(outputPath, shareUrl) {
  const response = await fetch(shareUrl)
  if (!response.ok) {
    throw new Error(`读取已发布周报失败：HTTP ${response.status}`)
  }
  await fs.writeFile(path.resolve(outputPath), await response.text(), 'utf-8')
}

function normalizeApiResult(action, data) {
  return {
    action,
    reportId: data.reportId,
    shareUrl: data.shareUrl,
    templateId: data.templateId,
    templateName: data.templateName,
    matchReason: data.matchReason,
    title: data.title,
    htmlLength: data.htmlLength,
    modelUsed: data.modelUsed,
    llmUsed: Boolean(data.llmUsed),
    warnings: Array.isArray(data.warnings) ? data.warnings : [],
    generatedAt: data.generatedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

async function resolveOptionalInputText(options) {
  if (options.text || options.input) {
    return resolveInputText(options)
  }
  return ''
}

async function resolveInputText(options) {
  const manualText = String(options.text || '').trim()
  if (manualText) {
    return manualText.slice(0, MAX_SOURCE_CHARS)
  }

  if (!options.input) {
    throw new Error('必须提供 --input 文件路径或 --text 文本')
  }

  const inputPath = path.resolve(options.input)
  const suffix = path.extname(inputPath).toLowerCase().replace('.', '')
  printSystemLog('Doc2Brief CLI', '读取输入', { inputPath, suffix })

  if (['txt', 'md', 'csv', 'html'].includes(suffix)) {
    return (await fs.readFile(inputPath, 'utf-8')).slice(0, MAX_SOURCE_CHARS)
  }

  if (suffix === 'docx') {
    const result = await mammoth.extractRawText({ path: inputPath })
    return String(result.value || '').slice(0, MAX_SOURCE_CHARS)
  }

  if (suffix === 'pdf') {
    return (await extractPdfText(inputPath)).slice(0, MAX_SOURCE_CHARS)
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

async function requestJson(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const rawText = await response.text()
  const contentType = response.headers.get('content-type') || ''
  let data = {}
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { message: rawText }
    }
  }
  if (!contentType.includes('application/json') || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(buildApiMismatchMessage(endpoint, response.status, rawText))
  }
  if (!response.ok) {
    throw new Error(buildApiErrorMessage(endpoint, response.status, data.message))
  }
  return data
}

function buildApiMismatchMessage(endpoint, status, rawText) {
  const snippet = String(rawText || '').replace(/\s+/g, ' ').slice(0, 120)
  const looksLikeSpa = /^<!doctype html|<html[\s>]/i.test(String(rawText || '').trim())
  const reason = looksLikeSpa ? '服务返回了前端 SPA HTML' : '服务返回了非 JSON 内容'
  return `${reason}，未命中 Doc2Brief weekly-report API；请检查部署版本或服务入口是否与 main 分支一致。endpoint=${endpoint} status=${status} body=${snippet}`
}

function buildApiErrorMessage(endpoint, status, message) {
  const text = String(message || '').trim()
  if (status === 405 && /GET\/HEAD\/POST\/OPTIONS|仅支持/.test(text)) {
    return `Doc2Brief weekly-report API 未按预期响应，疑似部署版本或路由入口不匹配。endpoint=${endpoint} status=${status} message=${text}`
  }
  return text || `HTTP ${status}`
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

function normalizeTemplateOption(value) {
  const raw = String(value || '').trim()
  const normalized = raw.toLowerCase()
  const aliases = {
    '': '',
    auto: 'auto',
    swiss: 'template-02',
    'swiss-grid': 'template-02',
    '瑞士': 'template-02',
    '瑞士网格': 'template-02',
    '瑞士版式': 'template-02',
    newspaper: 'template-03',
    editorial: 'template-03',
    'editorial-newspaper': 'template-03',
    '电子报刊': 'template-03',
    '电子报刊风格': 'template-03',
    '报刊': 'template-03',
  }
  return aliases[normalized] || raw
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
  doc2brief update --report-id rpt_xxx --instruction "补充风险章节" --json
  doc2brief update --url http://127.0.0.1:5173/r/rpt_xxx --text "修改后的内容" --json

核心参数：
  --input       输入文件，支持 TXT/MD/CSV/HTML/DOCX/PDF
  --text        直接输入文本
  --instruction update 时仅给修改指令，由服务端修改原链接内容
  --template    template-01 到 template-09，默认 auto
  --report-id   update 时指定已有报告 ID
  --url         update 时也可传已有周报链接
  --base-url    已部署的 Doc2Brief 服务地址，默认 ${DEFAULT_BASE_URL}
  --output      可选，把生成的 HTML 同步写到本地文件
  --json        只在 stdout 输出机器可读 JSON
`)
}
