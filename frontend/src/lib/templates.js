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

const templateAssets = {
  'template-01': { html: template01Html, css: template01Css, js: template01Js },
  'template-02': { html: template02Html, css: template02Css, js: template02Js },
  'template-03': { html: template03Html, css: template03Css, js: template03Js },
  'template-04': { html: template04Html, css: template04Css, js: template04Js },
  'template-05': { html: template05Html, css: template05Css, js: template05Js },
  'template-06': { html: template06Html, css: template06Css, js: template06Js },
  'template-07': { html: template07Html, css: template07Css, js: template07Js },
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
    renderer: 'minimal',
    name: '极简版',
    title: '极简周报版式',
    description: '基于原始极简 HTML 拆分，突出大标题、表格进展和数据墙。',
    accent: '#121212',
    chip: 'MINIMAL/01',
    focus: '适合正式汇报、快速浏览和打印归档。',
    bestFor: '管理层简报',
    departmentTags: ['comprehensive', 'operations', 'research', 'teaching'],
    audienceTags: ['director', 'executive', 'operations'],
    moduleBlueprint: ['封面摘要', '重点要览', '四象限工作', '数据看板', '签发信息'],
  },
  {
    id: 'template-02',
    renderer: 'magazine',
    name: '杂志版',
    title: '杂志封面周报',
    description: '保留原杂志感封面、目录、专题导读和图表区。',
    accent: '#C8382A',
    chip: 'MAGAZINE/02',
    focus: '适合品牌感较强的汇报场景和对外展示式周报。',
    bestFor: '专题汇报 / 品牌展示',
    departmentTags: ['comprehensive', 'international', 'research'],
    audienceTags: ['director', 'executive'],
    moduleBlueprint: ['封面主稿', '要览导读', '分栏工作', '数据图表', '签发信息'],
  },
  {
    id: 'template-03',
    renderer: 'ink',
    name: '国风版',
    title: '国风卷轴周报',
    description: '完整保留宣纸、水墨、卷轴、章回式结构和进度卷轴。',
    accent: '#C41E3A',
    chip: 'INK/03',
    focus: '适合高辨识度展示，强调仪式感与章节叙事。',
    bestFor: '特色汇报 / 对外展示',
    departmentTags: ['comprehensive', 'international', 'teaching'],
    audienceTags: ['director', 'executive'],
    moduleBlueprint: ['封面信息', '卷轴要览', '四类重点工作', '数据板块', '签发信息'],
  },
  {
    id: 'template-04',
    renderer: 'dashboard-plus',
    name: '仪表盘版',
    title: '控制台仪表盘周报',
    description: '保留深色驾驶舱、时间线、看板、数值墙和侧边导航。',
    accent: '#00E5FF',
    chip: 'DASHBOARD/04',
    focus: '适合执行追踪、项目例会和高频运营复盘。',
    bestFor: '运营周会 / 项目推进',
    departmentTags: ['operations', 'research', 'comprehensive'],
    audienceTags: ['operations', 'executive'],
    moduleBlueprint: ['头部 KPI', '时间线要览', '分类看板', '数据可视化', '签发信息'],
  },
  {
    id: 'template-05',
    renderer: 'news',
    name: '新闻简报版',
    title: '新闻简报周报',
    description: '保留新闻刊头、ticker、三栏正文和右侧数据面板。',
    accent: '#F5C842',
    chip: 'NEWS/05',
    focus: '适合信息密度高、亮点多的简报型周报。',
    bestFor: '简报速览 / 内参',
    departmentTags: ['comprehensive', 'international', 'operations'],
    audienceTags: ['director', 'executive', 'operations'],
    moduleBlueprint: ['刊头 ticker', '主头条', '双列故事流', '数据边栏', '签发信息'],
  },
  {
    id: 'template-06',
    renderer: 'journal',
    name: '学术期刊版',
    title: '学术期刊周报',
    description: '保留论文期刊排版、摘要、双栏正文、表格和脚注信息。',
    accent: '#8B1A1A',
    chip: 'JOURNAL/06',
    focus: '适合严肃、长文本、可存档的研究或管理周报。',
    bestFor: '归档材料 / 学术管理',
    departmentTags: ['research', 'teaching', 'comprehensive'],
    audienceTags: ['director', 'executive', 'risk'],
    moduleBlueprint: ['刊头', '摘要', 'KPI 行', '双栏正文', '表格与脚注'],
  },
  {
    id: 'template-07',
    renderer: 'cyber',
    name: '赛博版',
    title: '赛博控制台周报',
    description: '保留矩阵雨、霓虹 HUD、矩阵卡片和终端式元信息。',
    accent: '#00FFFF',
    chip: 'CYBER/07',
    focus: '适合技术、创新、AI 项目类汇报，视觉冲击强。',
    bestFor: '技术周报 / 创新项目',
    departmentTags: ['research', 'operations', 'international'],
    audienceTags: ['executive', 'operations', 'director'],
    moduleBlueprint: ['系统封面', 'HUD 要览', '矩阵工作流', '数据终端', '元信息终端'],
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
  const shared = buildSharedData(document, generatedAt, templateMeta)

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
    keyPoints: shared.keyPoints,
    decisions: shared.decisions,
    resources: shared.resources,
    viewModel: {},
  }

  if (templateMeta.id === 'template-01') {
    payload.viewModel.minimal = buildMinimalViewModel(shared)
    return payload
  }

  if (templateMeta.id === 'template-02') {
    payload.viewModel.magazine = buildMagazineViewModel(shared)
    return payload
  }

  if (templateMeta.id === 'template-03') {
    payload.viewModel.ink = buildInkViewModel(shared)
    return payload
  }

  if (templateMeta.id === 'template-04') {
    payload.viewModel.dashboardPlus = buildDashboardViewModel(shared)
    return payload
  }

  if (templateMeta.id === 'template-05') {
    payload.viewModel.news = buildNewsViewModel(shared)
    return payload
  }

  if (templateMeta.id === 'template-06') {
    payload.viewModel.journal = buildJournalViewModel(shared)
    return payload
  }

  payload.viewModel.cyber = buildCyberViewModel(shared)
  return payload
}

function buildSharedData(document, generatedAt, templateMeta) {
  const stats = buildStats(document, 6)
  const overview = buildOverviewItems(document, 5)
  const groups = buildWorkGroups(document)
  const defense = extractDefenseStats(document)
  const keyMetrics = buildMetricWall(document, stats, defense)
  const footer = buildFooter(document, generatedAt)
  const issued = formatDateParts(generatedAt)
  const metaLine = {
    periodText: document.subtitle || '本周汇总周期',
    issuedText: issued.display,
    issuedDateText: issued.dateOnly,
    issuedMachineText: issued.isoLike,
    issueLabel: `第 ${String(issued.issueNumber).padStart(2, '0')} 期`,
    unitText: document.department_focus || 'file2web 自动生成',
    title: document.title,
    subtitle: document.subtitle,
    summary: document.summary,
  }

  return {
    document,
    templateMeta,
    generatedAt,
    metaLine,
    stats,
    overview,
    groups,
    defense,
    footer,
    keyMetrics,
    keyPoints: (document.key_points ?? []).slice(0, 8),
    decisions: (document.decision_requests ?? []).slice(0, 6),
    resources: (document.resource_requests ?? []).slice(0, 6),
    cooperationProgress: groups.cooperation.slice(0, 6),
    systemProgress: groups.system.slice(0, 6),
    visitProgress: groups.visit.slice(0, 6),
    internalProgress: groups.internal.slice(0, 8),
  }
}

function buildMinimalViewModel(shared) {
  return {
    hero: {
      eyebrow: shared.metaLine.unitText ? `${shared.metaLine.unitText} · 内部周报` : '自动生成 · 内部周报',
      title: shared.metaLine.title,
      summary: shared.metaLine.summary,
      period: shared.metaLine.periodText,
      unit: shared.footer.issuedBy,
      issuedAt: shared.metaLine.issuedText,
      bgNumber: String(shared.metaLine.issueLabel.match(/\d+/)?.[0] || '1').padStart(2, '0'),
    },
    stats: shared.stats.slice(0, 5),
    overview: shared.overview,
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 9),
      cooperation: shared.cooperationProgress.slice(0, 6),
      system: shared.systemProgress.slice(0, 5),
    },
    footer: shared.footer,
  }
}

function buildMagazineViewModel(shared) {
  return {
    cover: {
      issueLabel: `Vol.${String(shared.metaLine.issueLabel.match(/\d+/)?.[0] || '1').padStart(2, '0')} · ${shared.metaLine.issuedDateText.slice(0, 4)} · ${shared.metaLine.issueLabel}`,
      headline: shared.overview[0]?.title || shared.metaLine.title,
      decks: [shared.metaLine.summary, ...(shared.keyPoints ?? []).slice(0, 1)],
      period: shared.metaLine.periodText,
      unit: shared.footer.issuedBy,
    },
    stats: shared.stats.slice(0, 4),
    toc: ['本周要览', '重点工作', '数据看板', '签发信息'],
    overview: shared.overview,
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 6),
      defense: shared.defense,
      cooperation: shared.cooperationProgress.slice(0, 6),
    },
    footer: shared.footer,
  }
}

function buildInkViewModel(shared) {
  return {
    cover: {
      enTitle: `${shared.footer.issuedBy || 'file2web'} · Weekly Report`,
      title: shared.metaLine.title,
      subTitle: shared.metaLine.issueLabel,
      period: shared.metaLine.periodText,
      issuedAt: shared.metaLine.issuedText,
      unit: shared.footer.issuedBy,
      stats: shared.stats.slice(0, 5),
    },
    overview: shared.overview,
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 6),
      cooperation: shared.cooperationProgress.slice(0, 6),
      system: shared.systemProgress.slice(0, 6),
      defense: shared.defense,
    },
    footer: shared.footer,
  }
}

function buildDashboardViewModel(shared) {
  return {
    hero: {
      title: shared.metaLine.title,
      subtitle: `${shared.footer.issuedBy} · ${shared.metaLine.issueLabel} · 内部资料`,
      issuedAt: `${shared.metaLine.issuedDateText.replace(/-/g, '.')} ISSUED`,
      period: shared.metaLine.periodText,
    },
    stats: shared.stats.slice(0, 5),
    overview: shared.overview,
    groups: shared.groups,
    data: {
      cooperation: shared.cooperationProgress.slice(0, 6),
      defense: shared.defense,
      keyMetrics: shared.keyMetrics.slice(0, 6),
    },
    summaryCounts: summarizeGroupCounts(shared.groups),
    footer: shared.footer,
  }
}

function buildNewsViewModel(shared) {
  return {
    masthead: {
      brand: shared.footer.issuedBy,
      date: shared.metaLine.issuedDateText.replace(/-/g, '·'),
      issueLabel: shared.metaLine.issueLabel,
    },
    ticker: shared.keyMetrics.slice(0, 6),
    hero: {
      eyebrow: '本周要览',
      headline: shared.overview[0]?.title || shared.metaLine.title,
      deck: shared.metaLine.summary,
      stats: shared.stats.slice(0, 4),
    },
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 6),
      defense: shared.defense,
      cooperation: shared.cooperationProgress.slice(0, 6),
      international: shared.visitProgress.slice(0, 6),
    },
    footer: shared.footer,
  }
}

function buildJournalViewModel(shared) {
  return {
    header: {
      title: shared.metaLine.title,
      subtitle: shared.metaLine.subtitle,
      issueLabel: shared.metaLine.issueLabel,
      issuedAt: shared.metaLine.issuedText,
      period: shared.metaLine.periodText,
      tags: buildSectionTags(shared.groups),
    },
    abstract: shared.metaLine.summary,
    stats: shared.stats.slice(0, 5),
    overview: shared.overview,
    groups: shared.groups,
    data: {
      defense: shared.defense,
      cooperation: shared.cooperationProgress.slice(0, 6),
      system: shared.systemProgress.slice(0, 6),
    },
    footer: shared.footer,
  }
}

function buildCyberViewModel(shared) {
  return {
    hero: {
      line: `SYS_INIT: LOADING_REPORT_MODULE_${shared.metaLine.issuedDateText.replace(/-/g, '.')} ... [OK]`,
      subtitle: `${shared.footer.issuedBy} · ${shared.metaLine.issueLabel}`,
      desc: `REPORT_PERIOD: ${shared.metaLine.periodText} | ISSUED: ${shared.metaLine.issuedText} | UNIT: ${shared.footer.issuedBy}`,
    },
    stats: shared.stats.slice(0, 5),
    overview: shared.overview,
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 6),
      defense: shared.defense,
      system: shared.systemProgress.slice(0, 5),
      cooperation: shared.cooperationProgress.slice(0, 6),
    },
    footer: shared.footer,
  }
}

function buildStats(document, count) {
  const seeds = []

  ;(document.metrics ?? []).forEach((item) => {
    seeds.push({
      label: item.name || '关键指标',
      value: item.value || '--',
      detail: item.note || item.trend || '持续跟踪中',
    })
  })

  ;(document.highlights ?? []).forEach((item) => {
    seeds.push({
      label: item.label || '亮点',
      value: item.value || '--',
      detail: item.detail || '重点关注',
    })
  })

  if (seeds.length === 0) {
    buildOverviewItems(document, count).forEach((item, index) => {
      seeds.push({
        label: item.tag || `重点 ${index + 1}`,
        value: String(index + 1),
        detail: item.title,
      })
    })
  }

  return dedupeByLabel(seeds)
    .slice(0, count)
    .map((item, index) => {
      const { numeric, display, unit } = splitValueUnit(item.value)
      return {
        label: item.label,
        value: display,
        unit,
        detail: item.detail,
        target: numeric,
        tone: index % 5,
      }
    })
}

function buildOverviewItems(document, count) {
  const fromSections = document.sections
    .flatMap((section) =>
      section.items.map((item) => ({
        tag: item.tag || section.title,
        title: item.title,
        body: item.body,
      })),
    )
    .filter((item) => item.title || item.body)

  const items = (fromSections.length > 0
    ? fromSections
    : (document.highlights ?? []).map((item) => ({
        tag: item.label || '亮点',
        title: `${item.label || '亮点'} ${item.value ? `· ${item.value}` : ''}`.trim(),
        body: item.detail || document.summary,
      })))
    .slice(0, count)
    .map((item, index) => ({
      ...item,
      number: String(index + 1).padStart(2, '0'),
      tone: overviewTone(index),
    }))

  return items.length > 0
    ? items
    : [
        {
          tag: '自动结构化',
          title: '当前原文未提取出足够的重点条目',
          body: document.summary,
          number: '01',
          tone: overviewTone(0),
        },
      ]
}

function buildWorkGroups(document) {
  const groups = {
    internal: [],
    cooperation: [],
    visit: [],
    system: [],
  }

  document.sections.forEach((section) => {
    const bucket = classifyGroup(section.title)
    section.items.forEach((item) => {
      groups[bucket].push(toWorkItem(item.title, item.body, item.tag || section.title))
    })
  })

  ;(document.progress_items ?? []).forEach((item) => {
    const bucket = classifyGroup(item.stream || item.status || '')
    groups[bucket].push(
      toWorkItem(
        item.stream || '推进事项',
        [item.outcome, item.owner ? `责任人：${item.owner}` : '', item.dependency ? `依赖：${item.dependency}` : '']
          .filter(Boolean)
          .join('；'),
        item.status || '进行中',
      ),
    )
  })

  ;(document.risk_items ?? []).slice(0, 4).forEach((item) => {
    groups.system.push(
      toWorkItem(item.risk, item.mitigation, item.level || 'medium'),
    )
  })

  if (groups.internal.length === 0) {
    buildOverviewItems(document, 4).forEach((item) => {
      groups.internal.push(toWorkItem(item.title, item.body, item.tag))
    })
  }

  const fallbackKeys = ['internal', 'cooperation', 'visit', 'system']
  fallbackKeys.forEach((key, index) => {
    if (groups[key].length === 0) {
      groups[key].push(
        toWorkItem(
          `${['内部协同', '对外合作', '交流互访', '体系建设'][index]}待补充`,
          '当前原文未显式抽取到该分类条目，可在原始文档中补充更明确的小节标题。',
          '待补充',
        ),
      )
    }
    groups[key] = groups[key].slice(0, key === 'internal' ? 8 : 6)
  })

  return groups
}

function buildMetricWall(document, stats, defense) {
  const items = [
    ...stats.map((item) => ({
      label: item.label,
      value: item.value,
      unit: item.unit,
      sub: item.detail,
    })),
  ]

  if (defense.total > 0) {
    items.push({ label: '答辩总人数', value: String(defense.total), unit: '人', sub: `开题通过 ${defense.pass} 人` })
  }

  ;(document.resource_requests ?? []).slice(0, 2).forEach((item, index) => {
    items.push({ label: `资源诉求 ${index + 1}`, value: String(index + 1), unit: '项', sub: item })
  })

  return items.slice(0, 12)
}

function extractDefenseStats(document) {
  const joined = [
    ...document.sections
      .filter((section) => /答辩|开题|博士/.test(section.title))
      .flatMap((section) => [section.description || '', ...section.items.map((item) => `${item.title} ${item.body}`)]),
    ...(document.progress_items ?? []).map((item) => `${item.stream} ${item.outcome}`),
  ].join(' ')

  const total = extractNumber(joined, /(参加|总人数|共)\s*(\d+)/) || 0
  const pass = extractNumber(joined, /开题通过\s*(\d+)/) || 0
  const fail = extractNumber(joined, /未通过\s*(\d+)/) || 0
  const revised = extractNumber(joined, /修改后通过\s*(\d+)/) || 0
  const exam = extractNumber(joined, /博资考通过\s*(\d+)/) || 0

  const safeTotal = total || pass + fail + revised + exam
  return {
    total: safeTotal,
    pass,
    fail,
    revised,
    exam,
  }
}

function buildFooter(document, generatedAt) {
  return {
    issuedBy: document.department_focus || '自动生成周报',
    recipient: document.audience_focus || '相关负责人',
    distribution: document.department_focus || '相关部门',
    editor: '（待填写）',
    reviewer: '（待填写）',
    date: formatDateParts(generatedAt).display,
    dateOnly: formatDateParts(generatedAt).dateOnly,
    timestamp: formatDateParts(generatedAt).isoLike,
  }
}

function classifyGroup(title) {
  const text = String(title || '')
  if (/交流|互访|论坛|访问|会议|活动/.test(text)) return 'visit'
  if (/合作|外部|联动|国际/.test(text)) return 'cooperation'
  if (/体系|制度|机制|平台|系统|课程|图谱|建设|办法/.test(text)) return 'system'
  return 'internal'
}

function toWorkItem(title, body, status) {
  const progress = inferProgress(status, body)
  return {
    title: title || '待补充事项',
    body: body || '暂无补充说明。',
    status: normalizeStatusLabel(status),
    progress,
    tone: statusTone(status, progress),
  }
}

function inferProgress(status, body) {
  const text = `${status || ''} ${body || ''}`
  const explicit = extractNumber(text, /(\d{1,3})\s*%/)
  if (explicit) return Math.max(0, Math.min(100, explicit))
  if (/已完成|完成|通过|印发|发布|DONE|ISSUED|COUNCIL_PASS/.test(text)) return 100
  if (/搁置|暂停|待解决|ON_HOLD/.test(text)) return 25
  if (/探讨|规划|计划|筹备/.test(text)) return 35
  if (/建设中|进行中|推进中|ACTIVE|BUILDING/.test(text)) return 55
  return 40
}

function normalizeStatusLabel(status) {
  const text = String(status || '')
  if (/DONE|完成|通过|印发|发布|已完成/.test(text)) return '已完成'
  if (/ON_HOLD|搁置|暂停/.test(text)) return '搁置'
  if (/待解决|待推进|PENDING/.test(text)) return '待推进'
  if (/探讨|EXPLORING/.test(text)) return '探讨中'
  if (/建设中|BUILDING/.test(text)) return '建设中'
  return text || '进行中'
}

function statusTone(status, progress) {
  const text = String(status || '')
  if (/已完成|DONE|通过|印发|发布/.test(text) || progress >= 90) return 'done'
  if (/搁置|待推进|待解决|ON_HOLD|PENDING/.test(text) || progress <= 30) return 'warning'
  return 'progress'
}

function splitValueUnit(value) {
  const text = String(value ?? '--').trim()
  const match = text.match(/^([+-]?\d+(?:\.\d+)?)(.*)$/)
  if (!match) {
    return { numeric: 0, display: text || '--', unit: '' }
  }
  const numeric = Number.parseFloat(match[1])
  return {
    numeric: Number.isFinite(numeric) ? numeric : 0,
    display: match[1],
    unit: match[2].trim(),
  }
}

function dedupeByLabel(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = `${item.label}::${item.value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function overviewTone(index) {
  return ['red', 'jade', 'indigo', 'gold', 'copper'][index % 5]
}

function summarizeGroupCounts(groups) {
  const values = Object.values(groups).flat()
  return {
    done: values.filter((item) => item.tone === 'done').length,
    progress: values.filter((item) => item.tone === 'progress').length,
    pending: values.filter((item) => item.tone === 'warning').length,
  }
}

function buildSectionTags(groups) {
  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([key]) => {
      if (key === 'internal') return '内部协同'
      if (key === 'cooperation') return '对外合作'
      if (key === 'visit') return '交流互访'
      return '体系建设'
    })
    .slice(0, 4)
}

function extractNumber(text, pattern) {
  const match = String(text || '').match(pattern)
  return match ? Number.parseInt(match[2] || match[1], 10) : 0
}

function formatDateParts(generatedAt) {
  const source = String(generatedAt || '').replace(/[年月]/g, '/').replace(/[日]/g, '').replace(/\./g, '/').trim()
  const maybeDate = new Date(source)
  const date = Number.isNaN(maybeDate.getTime()) ? new Date() : maybeDate
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return {
    display: `${year}年${month}月${day}日`,
    dateOnly: `${year}-${month}-${day}`,
    isoLike: `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`,
    issueNumber: Math.ceil(Number(month) / 1),
  }
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
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
