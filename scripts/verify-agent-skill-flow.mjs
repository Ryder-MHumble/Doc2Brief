import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const projectRoot = path.resolve(path.dirname(__filename), '..')
const serverPort = Number(process.env.VERIFY_REPORT_SERVER_PORT || 5187)
const baseUrl = `http://127.0.0.1:${serverPort}`

const sampleText = [
  '智能创新中心周报',
  '本周完成智能问答平台灰度上线，新增 3 个业务场景接入。',
  '数据治理规则完成第一轮评审，核心指标口径统一率达到 92%。',
  '模型评测流水线已接入周报生成链路，发现 2 个高优先级内容质量问题。',
  '下周计划推进知识库增量同步、异常告警看板和模板风格验收。',
].join('\n')

const updatedText = [
  sampleText,
  '补充修改：院长办公会要求新增“跨部门资源协调”章节，并将上线风险降级为中风险。',
].join('\n')

async function main() {
  const server = spawn('node', ['server/app.js'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      REPORT_SERVER_HOST: '127.0.0.1',
      REPORT_SERVER_PORT: String(serverPort),
      REPORT_CLEANUP_ON_PUBLISH: 'false',
      REPORT_CLEANUP_ON_STARTUP: 'false',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  server.stdout.on('data', (chunk) => process.stderr.write(chunk))
  server.stderr.on('data', (chunk) => process.stderr.write(chunk))

  try {
    await waitForHealth()

    const tempDir = await mkdtemp(path.join(os.tmpdir(), 'doc2brief-agent-skill-'))
    const inputPath = path.join(tempDir, 'weekly.md')
    const outputPath = path.join(tempDir, 'weekly.html')
    await writeFile(inputPath, sampleText, 'utf-8')

    const generated = await runCli([
      'generate',
      '--input',
      inputPath,
      '--base-url',
      baseUrl,
      '--output',
      outputPath,
      '--json',
    ])

    assert.match(generated.reportId, /^rpt_[A-Za-z0-9_-]+$/)
    assert.equal(generated.shareUrl, `${baseUrl}/r/${generated.reportId}`)
    assert.match(generated.templateId, /^template-\d{2}$/)
    assert.ok(generated.htmlLength > 1000)

    const generatedHtml = await readFile(outputPath, 'utf-8')
    assert.match(generatedHtml, /智能创新中心周报/)

    const metaBefore = await fetchJson(`/api/reports/meta?reportId=${encodeURIComponent(generated.reportId)}`)
    const visitedBefore = await fetchText(`/r/${encodeURIComponent(generated.reportId)}`)
    assert.match(visitedBefore, /智能创新中心周报/)

    const updated = await runCli([
      'update',
      '--report-id',
      generated.reportId,
      '--text',
      updatedText,
      '--base-url',
      baseUrl,
      '--json',
    ])

    assert.equal(updated.reportId, generated.reportId)
    assert.equal(updated.shareUrl, generated.shareUrl)
    assert.equal(updated.action, 'update')

    const metaAfter = await fetchJson(`/api/reports/meta?reportId=${encodeURIComponent(generated.reportId)}`)
    assert.equal(metaAfter.report.fileRelativePath, metaBefore.report.fileRelativePath)

    const visitedAfter = await fetchText(`/r/${encodeURIComponent(generated.reportId)}`)
    assert.match(visitedAfter, /跨部门资源协调/)
  } finally {
    server.kill('SIGTERM')
  }
}

async function runCli(args) {
  const result = await runProcess('node', ['bin/doc2brief.js', ...args])
  assert.equal(result.code, 0, result.stderr || result.stdout)
  return JSON.parse(result.stdout)
}

function runProcess(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })
    child.on('close', (code) => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() })
    })
  })
}

async function waitForHealth() {
  const deadline = Date.now() + 8000
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/api/health`)
      if (response.ok) {
        return
      }
    } catch {
      // 服务还在启动，继续等待。
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error('服务健康检查超时')
}

async function fetchJson(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`)
  if (!response.ok) {
    assert.fail(await response.text())
  }
  return response.json()
}

async function fetchText(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`)
  if (!response.ok) {
    assert.fail(await response.text())
  }
  return response.text()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
