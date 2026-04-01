import template01Html from '../../../template/01/index.html?raw'
import template01Css from '../../../template/01/style.css?raw'
import template01Js from '../../../template/01/app.js?raw'
import template02Html from '../../../template/02/index.html?raw'
import template02Css from '../../../template/02/style.css?raw'
import template02Js from '../../../template/02/app.js?raw'
import template03Html from '../../../template/03/index.html?raw'
import template03Css from '../../../template/03/style.css?raw'
import template03Js from '../../../template/03/app.js?raw'
import template04Html from '../../../template/04/index.html?raw'
import template04Css from '../../../template/04/style.css?raw'
import template04Js from '../../../template/04/app.js?raw'
import template05Html from '../../../template/05/index.html?raw'
import template05Css from '../../../template/05/style.css?raw'
import template05Js from '../../../template/05/app.js?raw'
import template06Html from '../../../template/06/index.html?raw'
import template06Css from '../../../template/06/style.css?raw'
import template06Js from '../../../template/06/app.js?raw'
import template07Html from '../../../template/07/index.html?raw'
import template07Css from '../../../template/07/style.css?raw'
import template07Js from '../../../template/07/app.js?raw'
import template08Html from '../../../template/08/index.html?raw'
import template08Css from '../../../template/08/style.css?raw'
import template08Js from '../../../template/08/app.js?raw'
import template09Html from '../../../template/09/index.html?raw'
import template09Css from '../../../template/09/style.css?raw'
import template09Js from '../../../template/09/app.js?raw'
import template10Html from '../../../template/10/index.html?raw'
import template10Css from '../../../template/10/style.css?raw'
import template10Js from '../../../template/10/app.js?raw'

const templateAssets = {
  'template-01': { html: template01Html, css: template01Css, js: template01Js },
  'template-02': { html: template02Html, css: template02Css, js: template02Js },
  'template-03': { html: template03Html, css: template03Css, js: template03Js },
  'template-04': { html: template04Html, css: template04Css, js: template04Js },
  'template-05': { html: template05Html, css: template05Css, js: template05Js },
  'template-06': { html: template06Html, css: template06Css, js: template06Js },
  'template-07': { html: template07Html, css: template07Css, js: template07Js },
  'template-08': { html: template08Html, css: template08Css, js: template08Js },
  'template-09': { html: template09Html, css: template09Css, js: template09Js },
  'template-10': { html: template10Html, css: template10Css, js: template10Js },
}

const fallbackSections = [
  {
    title: '自动结构化结果',
    description: '当前文档还没有抽取出完整章节，系统展示默认结构。',
    items: [
      { title: '上传原文', body: '请在左侧上传 PDF/Word/TXT 或直接粘贴文本。', tag: '输入' },
      { title: '点击转换', body: '系统会先结构化整理，再生成可预览 HTML。', tag: '流程' },
    ],
  },
]

export const templateCatalog = [
  {
    id: 'template-01',
    renderer: 'narrative',
    name: '部门叙事版',
    title: '叙事型周报可视化',
    description: '模板资产位于 template/01，强调关键指标与章节叙事。',
    accent: '#0f766e',
    chip: 'TEMPLATE/01',
    focus: '适合跨部门综合汇报，平衡结果与过程叙事。',
    bestFor: '院办/综合管理',
    departmentTags: ['comprehensive', 'teaching', 'international'],
    audienceTags: ['director', 'executive'],
    moduleBlueprint: ['摘要总览', '关键指标', '重点章节叙事', '下周动作'],
  },
  {
    id: 'template-02',
    renderer: 'dashboard',
    name: '运营驾驶舱',
    title: '控制台信息密度',
    description: '模板资产位于 template/02，偏仪表盘和模块化表达。',
    accent: '#4f46e5',
    chip: 'TEMPLATE/02',
    focus: '强调指标、状态与执行节奏，便于运营追踪。',
    bestFor: '运营保障/项目管理',
    departmentTags: ['operations', 'comprehensive', 'talent'],
    audienceTags: ['operations', 'executive'],
    moduleBlueprint: ['执行总览', '指标面板', '模块状态卡片', '任务分派'],
  },
  {
    id: 'template-03',
    renderer: 'brief',
    name: '正式简报版',
    title: '简洁正式白底版',
    description: '模板资产位于 template/03，适合汇报归档与打印阅读。',
    accent: '#1d4ed8',
    chip: 'TEMPLATE/03',
    focus: '强调规范表达与可打印归档。',
    bestFor: '正式上会材料',
    departmentTags: ['research', 'teaching', 'operations', 'comprehensive'],
    audienceTags: ['director', 'executive', 'operations', 'risk'],
    moduleBlueprint: ['摘要', '关键亮点', '章节要点', '归档信息'],
  },
  {
    id: 'template-04',
    renderer: 'strategy',
    name: '战略总览版',
    title: '领导决策总览',
    description: '模板资产位于 template/04，突出目标进展、风险和决策请求。',
    accent: '#2563eb',
    chip: 'TEMPLATE/04',
    focus: '为领导快速决策提供结构化输入。',
    bestFor: '院长/主任',
    departmentTags: ['comprehensive', 'research', 'operations'],
    audienceTags: ['director', 'executive'],
    moduleBlueprint: ['战略摘要', '关键指标', '进展与风险', '决策请求', '资源诉求'],
  },
  {
    id: 'template-05',
    renderer: 'risk',
    name: '风控合规版',
    title: '风险与闭环追踪',
    description: '模板资产位于 template/05，强化风险等级、应对动作和责任闭环。',
    accent: '#b91c1c',
    chip: 'TEMPLATE/05',
    focus: '风险优先、问题闭环、责任明确。',
    bestFor: '风控/审计/督办',
    departmentTags: ['operations', 'comprehensive', 'international', 'talent'],
    audienceTags: ['risk', 'operations', 'executive'],
    moduleBlueprint: ['风险清单', '风险等级', '闭环动作', '责任人', '关键观察'],
  },
  {
    id: 'template-06',
    renderer: 'pipeline',
    name: '科研管线版',
    title: '课题与成果管线',
    description: '模板资产位于 template/06，聚焦科研项目进度与里程碑。',
    accent: '#0f766e',
    chip: 'TEMPLATE/06',
    focus: '项目管线视角呈现科研推进状态。',
    bestFor: '科研管理/学术委员会',
    departmentTags: ['research'],
    audienceTags: ['director', 'executive', 'operations'],
    moduleBlueprint: ['科研摘要', '管线指标', '项目分阶段进展', '下一步关键动作'],
  },
  {
    id: 'template-07',
    renderer: 'strategy',
    name: '执行推进版',
    title: '任务推进与责任看板',
    description: '模板资产位于 template/07，强调任务状态、责任分工与跨部门依赖。',
    accent: '#1d4ed8',
    chip: 'TEMPLATE/07',
    focus: '适合执行层周会，突出任务推进节奏和责任链。',
    bestFor: '项目经理/执行负责人',
    departmentTags: ['operations', 'teaching', 'talent', 'comprehensive'],
    audienceTags: ['operations', 'executive'],
    moduleBlueprint: ['执行摘要', '任务进展', '阻塞与依赖', '下周排期'],
  },
  {
    id: 'template-08',
    renderer: 'dashboard',
    name: '预算资源版',
    title: '预算与资源配置看板',
    description: '模板资产位于 template/08，突出预算执行、资源投入产出与瓶颈。',
    accent: '#4f46e5',
    chip: 'TEMPLATE/08',
    focus: '适合财务和综合管理视角，强调投入产出与资源配置。',
    bestFor: '财务/综合管理',
    departmentTags: ['operations', 'comprehensive', 'research'],
    audienceTags: ['executive', 'director', 'operations'],
    moduleBlueprint: ['预算执行摘要', '投入产出指标', '资源诉求', '风险与建议'],
  },
  {
    id: 'template-09',
    renderer: 'narrative',
    name: '国际合作版',
    title: '国际合作进展简报',
    description: '模板资产位于 template/09，聚焦合作项目、外联节点与品牌影响。',
    accent: '#0f766e',
    chip: 'TEMPLATE/09',
    focus: '适合国际合作条线，强调活动节奏、合作成果和后续窗口。',
    bestFor: '国际合作/对外事务',
    departmentTags: ['international', 'comprehensive'],
    audienceTags: ['director', 'executive'],
    moduleBlueprint: ['合作摘要', '外联指标', '重点合作进展', '窗口期风险', '下周行动'],
  },
  {
    id: 'template-10',
    renderer: 'brief',
    name: '人才发展版',
    title: '人才与组织发展简报',
    description: '模板资产位于 template/10，聚焦引才、考核、培训与组织机制优化。',
    accent: '#1d4ed8',
    chip: 'TEMPLATE/10',
    focus: '适合人才人事部门，强调组织能力建设与机制落地。',
    bestFor: '人才人事/组织发展',
    departmentTags: ['talent', 'comprehensive'],
    audienceTags: ['executive', 'operations', 'director'],
    moduleBlueprint: ['人才摘要', '关键指标', '组织动作', '风险与支持请求'],
  },
]

export function renderTemplateHtml(templateId, document, generatedAt) {
  const templateMeta = templateCatalog.find((item) => item.id === templateId)
  const asset = templateAssets[templateId]

  if (!templateMeta || !asset) {
    return buildFallbackHtml(document, generatedAt)
  }

  const normalized = normalizeDocument(document)
  const payload = buildTemplatePayload(templateMeta, normalized, generatedAt)
  return injectTemplate(asset, payload)
}

function normalizeDocument(document) {
  return {
    ...document,
    title: document.title?.trim() || '未命名文档',
    subtitle: document.subtitle?.trim() || 'file2web 自动生成报告',
    summary: document.summary?.trim() || '暂无摘要信息。',
    highlights: document.highlights ?? [],
    metrics: document.metrics ?? [],
    key_points: document.key_points ?? [],
    progress_items: document.progress_items ?? [],
    risk_items: document.risk_items ?? [],
    next_actions: document.next_actions ?? [],
    decision_requests: document.decision_requests ?? [],
    resource_requests: document.resource_requests ?? [],
    sections: (document.sections && document.sections.length > 0 ? document.sections : fallbackSections).map((section) => ({
      ...section,
      items:
        section.items && section.items.length > 0
          ? section.items
          : [{ title: '待补充', body: '当前章节暂无条目。', tag: '占位' }],
    })),
  }
}

function buildTemplatePayload(templateMeta, document, generatedAt) {
  const highlights = pickHighlights(document)
  const metrics = pickMetrics(document)
  const progress = pickProgress(document)
  const risks = pickRisks(document)
  const actions = pickActions(document)
  const keyPoints = (document.key_points ?? []).slice(0, 10)
  const decisions = (document.decision_requests ?? []).slice(0, 10)
  const resources = (document.resource_requests ?? []).slice(0, 10)

  const payload = {
    templateId: templateMeta.id,
    templateName: templateMeta.title,
    renderer: templateMeta.renderer,
    theme: {
      accent: templateMeta.accent,
      chip: templateMeta.chip,
    },
    moduleBlueprint: templateMeta.moduleBlueprint,
    meta: {
      title: document.title,
      subtitle: document.subtitle,
      summary: document.summary,
      generatedAt,
      sensitiveMode: document.sensitive_mode,
      departmentFocus: document.department_focus || '',
      audienceFocus: document.audience_focus || '',
    },
    keyPoints,
    decisions,
    resources,
    viewModel: {},
  }

  if (templateMeta.renderer === 'narrative') {
    payload.viewModel.narrative = {
      highlights,
      stories: buildStories(document.sections),
      actions,
    }
    return payload
  }

  if (templateMeta.renderer === 'dashboard') {
    payload.viewModel.dashboard = {
      kpis: metrics,
      progress,
      risks,
      actions,
    }
    return payload
  }

  if (templateMeta.renderer === 'brief') {
    payload.viewModel.brief = {
      highlights,
      sectionAbstracts: buildSectionAbstracts(document.sections),
    }
    return payload
  }

  if (templateMeta.renderer === 'strategy') {
    payload.viewModel.strategy = {
      kpis: metrics,
      progress,
      risks,
      decisions,
      resources,
    }
    return payload
  }

  if (templateMeta.renderer === 'risk') {
    payload.viewModel.risk = {
      risks,
      actions,
      keyPoints,
    }
    return payload
  }

  payload.viewModel.pipeline = {
    metrics,
    stages: progress,
    actions,
  }
  return payload
}

function pickHighlights(document) {
  const highlights = document.highlights ?? []
  if (highlights.length > 0) {
    return highlights.slice(0, 6)
  }

  return (document.metrics ?? []).slice(0, 6).map((item) => ({
    label: item.name,
    value: item.value,
    detail: item.note || item.trend || '',
  }))
}

function pickMetrics(document) {
  if ((document.metrics ?? []).length > 0) {
    return (document.metrics ?? []).slice(0, 8)
  }
  return pickHighlights(document).map((item) => ({
    name: item.label,
    value: item.value,
    trend: '',
    note: item.detail,
  }))
}

function pickProgress(document) {
  if ((document.progress_items ?? []).length > 0) {
    return (document.progress_items ?? []).slice(0, 12)
  }
  return buildStories(document.sections).slice(0, 10).map((item) => ({
    stream: item.title,
    status: item.tag || '进行中',
    outcome: item.body,
    owner: '待明确',
  }))
}

function pickRisks(document) {
  if ((document.risk_items ?? []).length > 0) {
    return (document.risk_items ?? []).slice(0, 12)
  }

  const riskSection = document.sections.find((section) => section.title.includes('风险') || section.title.includes('问题'))
  if (!riskSection) {
    return [{ risk: '暂无显式风险条目', level: 'low', mitigation: '持续监控并按周复盘。', owner: '待明确' }]
  }

  const items = riskSection.items.slice(0, 8).map((item) => ({
    risk: item.title,
    level: 'medium',
    mitigation: item.body,
    owner: '待明确',
  }))

  return items.length > 0
    ? items
    : [{ risk: '暂无显式风险条目', level: 'low', mitigation: '持续监控并按周复盘。', owner: '待明确' }]
}

function pickActions(document) {
  if ((document.next_actions ?? []).length > 0) {
    return (document.next_actions ?? []).slice(0, 12)
  }

  const fallback = (document.key_points ?? []).slice(0, 8).map((item) => ({
    task: item,
    deadline: '下周',
    owner: '待明确',
    dependency: '',
  }))

  return fallback.length > 0
    ? fallback
    : [{ task: '补充下周行动计划', deadline: '下周', owner: '待明确', dependency: '' }]
}

function buildStories(sections) {
  return sections
    .flatMap((section) =>
      section.items.map((item) => ({
        title: item.title,
        body: item.body,
        tag: item.tag || section.title,
      })),
    )
    .slice(0, 12)
}

function buildSectionAbstracts(sections) {
  return sections.slice(0, 10).map((section) => ({
    title: section.title,
    description: section.description || section.items[0]?.body || '待补充',
  }))
}

function injectTemplate(asset, payload) {
  const serializedPayload = serializePayload(payload)
  const styleBlock = asset.css
  const scriptBlock = asset.js.replaceAll('</script>', '<\\/script>')

  return asset.html
    .replace('__TEMPLATE_STYLE__', styleBlock)
    .replace('__TEMPLATE_DATA__', serializedPayload)
    .replace('__TEMPLATE_SCRIPT__', scriptBlock)
}

function serializePayload(payload) {
  return JSON.stringify(payload)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/<\/script/gi, '<\\\\/script')
}

function buildFallbackHtml(document, generatedAt) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(document.title || '未命名文档')}</title>
  <style>
    body { margin: 0; padding: 24px; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; background: #f6f8fc; color: #1f2937; }
    .page { max-width: 960px; margin: 0 auto; background: #fff; border: 1px solid #dbe2ea; border-radius: 14px; padding: 20px; }
  </style>
</head>
<body>
  <article class="page">
    <h1>${escapeHtml(document.title || '未命名文档')}</h1>
    <p>生成时间：${escapeHtml(generatedAt)}</p>
    <p>${escapeHtml(document.summary || '暂无摘要')}</p>
  </article>
</body>
</html>`
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
