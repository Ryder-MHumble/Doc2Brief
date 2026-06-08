#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const DEFAULT_BASE_URL = 'http://10.1.132.21:5173'

main().catch((error) => {
  process.stderr.write(`系统日志-错误 | 模块=Doc2Brief Skill Client | 事件=执行失败 | 内容=${JSON.stringify({ message: error.message })}\n`)
  process.exitCode = 1
})

async function main() {
  const [command, ...argv] = process.argv.slice(2)
  const options = parseOptions(argv)
  const baseUrl = normalizeBaseUrl(options.baseUrl || process.env.DOC2BRIEF_BASE_URL || DEFAULT_BASE_URL)

  if (!command || command === 'help' || options.help) {
    printHelp()
    return
  }

  if (command === 'generate') {
    const text = await resolveInputText(options)
    const result = await requestJson(`${baseUrl}/api/weekly-reports/generate`, {
      text,
      templateId: normalizeTemplateOption(options.template || options.templateId || 'auto'),
      title: options.title || '',
      sensitiveMode: Boolean(options.sensitive),
      sourceType: 'skill-client-text',
    })
    writeJson({ action: 'generate', ...result })
    return
  }

  if (command === 'update') {
    const reportId = resolveReportId(options)
    if (!reportId) {
      throw new Error('update 必须提供 --report-id 或 --url')
    }
    const text = options.text || options.input ? await resolveInputText(options) : ''
    const instruction = String(options.instruction || options.instructions || options.edit || '').trim()
    const result = await requestJson(`${baseUrl}/api/weekly-reports/update`, {
      reportId,
      text,
      instruction,
      templateId: normalizeTemplateOption(options.template || options.templateId || ''),
      title: options.title || '',
      sensitiveMode: Boolean(options.sensitive),
      sourceType: 'skill-client-text',
    })
    writeJson({ action: 'update', ...result })
    return
  }

  throw new Error(`未知命令：${command}`)
}

async function resolveInputText(options) {
  const manualText = String(options.text || '').trim()
  if (manualText) {
    return manualText
  }

  if (!options.input) {
    throw new Error('必须提供 --text 或 --input')
  }

  const inputPath = path.resolve(options.input)
  const suffix = path.extname(inputPath).toLowerCase()
  if (!['.txt', '.md', '.csv', '.html'].includes(suffix)) {
    throw new Error('skill client 只直接读取 txt/md/csv/html；PDF/DOCX 请在项目根目录使用 node bin/doc2brief.js')
  }
  return fs.readFile(inputPath, 'utf-8')
}

async function requestJson(endpoint, body) {
  process.stderr.write(`系统日志 | 模块=Doc2Brief Skill Client | 事件=调用接口 | 内容=${JSON.stringify({ endpoint })}\n`)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
  const url = String(options.url || options.shareUrl || '').trim()
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

function writeJson(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`)
}

function printHelp() {
  process.stdout.write(`Doc2Brief Skill Client

用法：
  node scripts/weekly_report_client.mjs generate --text "本周完成..." --json
  node scripts/weekly_report_client.mjs generate --input ./weekly.md --template 瑞士网格 --base-url http://10.1.132.21:5173 --json
  node scripts/weekly_report_client.mjs update --report-id rpt_xxx --instruction "补充风险章节" --json
  node scripts/weekly_report_client.mjs update --url http://10.1.132.21:5173/r/rpt_xxx --text "修改后的完整正文" --json

说明：
  该脚本只调用 Doc2Brief 服务端 API，不读取或输出任何模型 API Key。
`)
}
