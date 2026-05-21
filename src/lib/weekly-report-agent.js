import { fallbackParse } from './fallback-parser.js'
import { templateCatalog } from './templates/catalog.js'

const templateKeywordRules = [
  {
    templateId: 'template-06',
    keywords: ['看板', '仪表盘', '进度', '推进', '项目', '上线', '联调', '监控', '告警', '运营', '迭代'],
    reason: '原文包含执行追踪、进度或系统上线信息，适合仪表盘表达。',
  },
  {
    templateId: 'template-02',
    keywords: ['指标', '数据', '经营', '同比', '环比', '完成率', '达成率', '预算', '收入', '成本'],
    reason: '原文包含较多指标和经营复盘信息，适合瑞士网格表达。',
  },
  {
    templateId: 'template-08',
    keywords: ['学术', '科研', '课题', '论文', '专利', '评审', '实验', '研究', '平台', '成果'],
    reason: '原文偏科研、课题或归档材料，适合期刊式严谨表达。',
  },
  {
    templateId: 'template-07',
    keywords: ['新闻', '快讯', '简报', '头条', '发布', '动态', '活动', '会议'],
    reason: '原文偏资讯速览和动态汇总，适合新闻简报表达。',
  },
  {
    templateId: 'template-09',
    keywords: ['综合', '协同', '多部门', '跨部门', '例会', '资源协调', '管理'],
    reason: '原文包含多线协同和管理例会信息，适合分屏杂志表达。',
  },
  {
    templateId: 'template-01',
    keywords: ['攻关', '冲刺', '战役', '专项', '里程碑', '闭环', '风险', '卡点'],
    reason: '原文强调攻关、冲刺和风险闭环，适合战情版表达。',
  },
  {
    templateId: 'template-04',
    keywords: ['品牌', '对外', '展示', '宣传', '成果展示', '专题', '发布会'],
    reason: '原文偏对外展示或专题叙事，适合杂志封面表达。',
  },
  {
    templateId: 'template-05',
    keywords: ['国风', '文化', '仪式', '典礼', '特色', '传统'],
    reason: '原文强调特色和仪式感，适合国风卷轴表达。',
  },
  {
    templateId: 'template-03',
    keywords: ['正式', '汇编', '栏目', '通报', '月报', '周报', '导读'],
    reason: '原文偏正式编排和栏目化阅读，适合电子报刊表达。',
  },
]

export function buildAgentWeeklyReport(params) {
  const {
    rawText,
    sensitiveMode = false,
    requestedTemplateId = '',
    titleOverride = '',
    previousTemplateId = '',
  } = params
  const document = fallbackParse(rawText, sensitiveMode)
  if (titleOverride.trim()) {
    document.title = titleOverride.trim()
  }

  const selection = selectWeeklyReportTemplate({
    rawText,
    document,
    requestedTemplateId,
    previousTemplateId,
  })
  const enrichedDocument = enrichDocumentForTemplate(document, selection.templateMeta, rawText)

  return {
    document: enrichedDocument,
    templateMeta: selection.templateMeta,
    selection,
  }
}

export function selectWeeklyReportTemplate(params) {
  const { rawText, requestedTemplateId = '', previousTemplateId = '' } = params
  const explicitId = normalizeTemplateId(requestedTemplateId)
  const previousId = normalizeTemplateId(previousTemplateId)
  const explicitTemplate = findTemplateMeta(explicitId)
  if (explicitTemplate) {
    return {
      templateMeta: explicitTemplate,
      reason: '使用用户或调用方指定的模板。',
      scores: [],
    }
  }

  const previousTemplate = findTemplateMeta(previousId)
  if (previousTemplate) {
    return {
      templateMeta: previousTemplate,
      reason: '编辑已有报告时沿用原模板，避免同一链接下视觉风格突变。',
      scores: [],
    }
  }

  const text = String(rawText || '')
  const scores = templateKeywordRules.map((rule) => {
    const matchedKeywords = rule.keywords.filter((keyword) => text.includes(keyword))
    return {
      templateId: rule.templateId,
      matchedKeywords,
      score: matchedKeywords.length,
      reason: rule.reason,
    }
  })
  scores.sort((a, b) => b.score - a.score || a.templateId.localeCompare(b.templateId))

  const best = scores.find((item) => item.score > 0) || {
    templateId: 'template-03',
    matchedKeywords: [],
    score: 0,
    reason: '未识别到强场景信号，默认采用正式电子报刊版。',
  }
  const templateMeta = findTemplateMeta(best.templateId) || templateCatalog[0]

  return {
    templateMeta,
    reason: best.reason,
    scores,
  }
}

export function enrichDocumentForTemplate(document, templateMeta, rawText) {
  const sections = ensureSections(document.sections, rawText)
  const keyPoints = ensureKeyPoints(document.key_points, sections, document.summary)
  const metrics = ensureMetrics(document.metrics, document.highlights, sections, rawText)
  const highlights = ensureHighlights(document.highlights, metrics, sections, rawText)
  const progressItems = ensureProgressItems(document.progress_items, sections)
  const riskItems = ensureRiskItems(document.risk_items, sections)
  const nextActions = ensureNextActions(document.next_actions, keyPoints)

  return {
    ...document,
    subtitle: document.subtitle || `${templateMeta.bestFor} · 自动匹配模板`,
    summary: document.summary || keyPoints.slice(0, 2).join('；') || '系统已根据原文整理为模板化周报。',
    highlights,
    metrics,
    key_points: keyPoints,
    progress_items: progressItems,
    risk_items: riskItems,
    next_actions: nextActions,
    decision_requests: document.decision_requests?.length ? document.decision_requests : inferDecisionRequests(rawText),
    resource_requests: document.resource_requests?.length ? document.resource_requests : inferResourceRequests(rawText),
    sections,
    department_focus: document.department_focus || inferDepartmentFocus(rawText),
    audience_focus: document.audience_focus || '周报接收人与相关负责人',
    agent_template_match: {
      templateId: templateMeta.id,
      templateName: templateMeta.title,
      bestFor: templateMeta.bestFor,
    },
  }
}

function ensureSections(sections, rawText) {
  const usable = Array.isArray(sections) ? sections.filter((section) => section?.title) : []
  if (usable.length >= 3) {
    return usable
  }

  const lines = splitUsefulLines(rawText)
  const buckets = [
    { title: '本周重点进展', description: '围绕结果、里程碑和业务价值整理本周进展。', items: [] },
    { title: '风险与待协调事项', description: '提炼阻塞、风险和需要外部协同的事项。', items: [] },
    { title: '下周行动计划', description: '形成可追踪的下一步行动清单。', items: [] },
  ]

  lines.slice(0, 12).forEach((line, index) => {
    const bucketIndex = classifyLineBucket(line, index)
    buckets[bucketIndex].items.push({
      title: trimText(line, 28),
      body: line,
      tag: bucketIndex === 0 ? '进展' : bucketIndex === 1 ? '风险' : '计划',
    })
  })

  return mergeSectionItems(usable, buckets)
}

function mergeSectionItems(currentSections, fallbackSections) {
  const merged = currentSections.length > 0 ? currentSections.slice() : []
  fallbackSections.forEach((fallback) => {
    const existing = merged.find((section) => section.title === fallback.title)
    if (!existing) {
      merged.push(fallback)
      return
    }
    if (!Array.isArray(existing.items) || existing.items.length === 0) {
      existing.items = fallback.items
    }
  })
  return merged.filter((section) => Array.isArray(section.items) && section.items.length > 0).slice(0, 6)
}

function ensureKeyPoints(keyPoints, sections, summary) {
  const current = Array.isArray(keyPoints) ? keyPoints.filter(Boolean) : []
  const fromSections = sections.flatMap((section) => section.items.map((item) => item.body || item.title)).filter(Boolean)
  return dedupeText([...current, ...fromSections, summary].filter(Boolean)).slice(0, 8)
}

function ensureMetrics(metrics, highlights, sections, rawText) {
  const current = Array.isArray(metrics) ? metrics.filter(Boolean) : []
  if (current.length >= 3) {
    return current.slice(0, 6)
  }

  const numbers = extractNumberSignals(rawText)
  const generated = [
    { name: '重点章节', value: String(sections.length), trend: '', note: '自动结构化后的章节数量' },
    { name: '关键事项', value: String(sections.flatMap((section) => section.items).length), trend: '', note: '从原文提取的可汇报事项' },
    ...numbers.slice(0, 4).map((item) => ({
      name: item.label,
      value: item.value,
      trend: '',
      note: item.context,
    })),
  ]
  const fromHighlights = Array.isArray(highlights)
    ? highlights.map((item) => ({ name: item.label, value: item.value, trend: '', note: item.detail })).filter((item) => item.name)
    : []
  return dedupeByName([...current, ...fromHighlights, ...generated]).slice(0, 6)
}

function ensureHighlights(highlights, metrics, sections, rawText) {
  const current = Array.isArray(highlights) ? highlights.filter(Boolean) : []
  if (current.length >= 3) {
    return current.slice(0, 6)
  }

  const generated = [
    { label: '章节数', value: String(sections.length), detail: '用于模板导航与版面分区' },
    { label: '关键事项', value: String(sections.flatMap((section) => section.items).length), detail: '自动提炼的汇报条目' },
    { label: '字符规模', value: String(String(rawText || '').length), detail: '参与本次周报生成的文本量' },
    ...metrics.slice(0, 3).map((item) => ({ label: item.name, value: item.value, detail: item.note })),
  ]
  return dedupeByLabel([...current, ...generated]).slice(0, 6)
}

function ensureProgressItems(progressItems, sections) {
  const current = Array.isArray(progressItems) ? progressItems.filter(Boolean) : []
  const generated = sections.flatMap((section) =>
    section.items.slice(0, 2).map((item) => ({
      stream: section.title,
      status: item.tag || '推进中',
      outcome: item.body || item.title,
      owner: '待明确',
    })),
  )
  return [...current, ...generated].slice(0, 8)
}

function ensureRiskItems(riskItems, sections) {
  const current = Array.isArray(riskItems) ? riskItems.filter(Boolean) : []
  const riskSection = sections.find((section) => /风险|问题|卡点|协调/.test(section.title))
  const generated = riskSection
    ? riskSection.items.slice(0, 4).map((item) => ({
        risk: item.title,
        level: inferRiskLevel(item.body),
        mitigation: item.body,
        owner: '待明确',
      }))
    : []
  return current.length > 0 ? current.slice(0, 6) : generated
}

function ensureNextActions(nextActions, keyPoints) {
  const current = Array.isArray(nextActions) ? nextActions.filter(Boolean) : []
  if (current.length > 0) {
    return current.slice(0, 6)
  }
  return keyPoints.slice(0, 4).map((item) => ({
    task: item,
    deadline: '下周',
    owner: '待明确',
    dependency: '',
  }))
}

function inferDecisionRequests(rawText) {
  if (!/确认|审批|决策|拍板|协调/.test(rawText)) {
    return []
  }
  return ['请确认本周报告中涉及的关键决策、跨部门协调或资源安排。']
}

function inferResourceRequests(rawText) {
  if (!/资源|人力|预算|算力|排期|支持/.test(rawText)) {
    return []
  }
  return ['请关注原文中涉及的资源、人力、预算或排期支持事项。']
}

function inferDepartmentFocus(rawText) {
  const candidates = ['智能创新中心', '科学研究中心', '教学科研管理中心', '产业发展中心', '行政管理中心', '战略中心']
  return candidates.find((item) => rawText.includes(item)) || 'Doc2Brief 自动生成'
}

function classifyLineBucket(line, index) {
  if (/风险|问题|卡点|延期|阻塞|协调|降级|异常/.test(line)) {
    return 1
  }
  if (/下周|计划|推进|完成|跟进|准备|安排/.test(line) && index > 1) {
    return 2
  }
  return 0
}

function extractNumberSignals(rawText) {
  const lines = splitUsefulLines(rawText)
  return lines
    .flatMap((line) => {
      const matches = Array.from(line.matchAll(/(\d+(?:\.\d+)?\s*(?:%|个|项|人|次|家|万元|小时|天)?)/g))
      return matches.map((match) => ({
        label: trimText(line.replace(match[1], '').replace(/[，。；:：]/g, ' ').trim() || '量化指标', 12),
        value: match[1].replace(/\s+/g, ''),
        context: trimText(line, 44),
      }))
    })
    .filter((item) => item.value)
    .slice(0, 8)
}

function splitUsefulLines(rawText) {
  return String(rawText || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n|。|；|;/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 4)
}

function normalizeTemplateId(value) {
  const text = String(value || '').trim()
  if (!text || text === 'auto') {
    return ''
  }
  if (/^\d+$/.test(text)) {
    return `template-${text.padStart(2, '0')}`
  }
  return text
}

function findTemplateMeta(templateId) {
  return templateCatalog.find((item) => item.id === templateId) || null
}

function inferRiskLevel(text) {
  if (/高|严重|紧急|阻塞|延期/.test(text)) {
    return 'high'
  }
  if (/低|轻微|可控/.test(text)) {
    return 'low'
  }
  return 'medium'
}

function trimText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength - 1)}…`
}

function dedupeText(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = String(item || '').trim()
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function dedupeByName(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = String(item.name || item.label || '').trim()
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function dedupeByLabel(items) {
  const seen = new Set()
  return items.filter((item) => {
    const key = String(item.label || item.name || '').trim()
    if (!key || seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}
