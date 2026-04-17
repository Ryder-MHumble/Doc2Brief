import { buildSharedData } from './shared-data'

export function buildTemplatePayload(templateMeta, document, generatedAt) {
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

  switch (templateMeta.renderer) {
    case 'neo-brutal-poster':
      payload.viewModel.neoBrutalPoster = buildNeoBrutalPosterViewModel(shared)
      return payload
    case 'swiss-grid':
      payload.viewModel.swissGrid = buildSwissGridViewModel(shared)
      return payload
    case 'editorial-newspaper':
      payload.viewModel.editorialNewspaper = buildEditorialNewspaperViewModel(shared)
      return payload
    case 'magazine':
      payload.viewModel.magazine = buildMagazineViewModel(shared)
      return payload
    case 'ink':
      payload.viewModel.ink = buildInkViewModel(shared)
      return payload
    case 'dashboard-plus':
      payload.viewModel.dashboardPlus = buildDashboardViewModel(shared)
      return payload
    case 'news':
      payload.viewModel.news = buildNewsViewModel(shared)
      return payload
    case 'journal':
      payload.viewModel.journal = buildJournalViewModel(shared)
      return payload
    case 'split-magazine':
      payload.viewModel.splitMagazine = buildSplitMagazineViewModel(shared)
      return payload
    default:
      return payload
  }
}

function buildMagazineViewModel(shared) {
  return {
    cover: {
      issueLabel: `Vol.${resolveIssueNumber(shared)} · ${shared.metaLine.issuedDateText.slice(0, 4)} · ${shared.metaLine.issueLabel}`,
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
      enTitle: `${shared.footer.issuedBy || 'Doc2Brief'} · Weekly Report`,
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

function buildSplitMagazineViewModel(shared) {
  return {
    masthead: {
      title: shared.metaLine.title || '工作周报',
      issue: `${shared.metaLine.issueLabel} · ${shared.metaLine.periodText}`,
      foot: shared.footer.dateOnly || shared.metaLine.issuedDateText,
    },
    stats: shared.stats.slice(0, 6),
    overview: shared.overview.slice(0, 6),
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 8),
      cooperation: shared.cooperationProgress.slice(0, 6),
      defense: shared.defense,
    },
    footer: shared.footer,
  }
}

function buildSwissGridViewModel(shared) {
  const issueNumber = resolveIssueNumber(shared)
  const tickerSource = shared.keyMetrics.length > 0 ? shared.keyMetrics : shared.stats
  const ticker = tickerSource.slice(0, 6).map((item) => ({
    label: item.label || '指标',
    value: `${item.value || '--'}${item.unit || ''}`,
  }))

  return {
    masthead: {
      name: shared.metaLine.title || '周报',
      issue: `VOL.${issueNumber}`,
      date: shared.metaLine.issuedDateText,
      logo: (shared.metaLine.title || '报').trim().slice(0, 1) || '报',
      publisher: `${shared.footer.issuedBy || 'Internal Bulletin'} · 内部资料`,
    },
    ticker,
    stats: shared.stats.slice(0, 5),
    overview: shared.overview.slice(0, 5),
    groups: shared.groups,
    data: {
      keyMetrics: shared.keyMetrics.slice(0, 6),
      cooperation: shared.cooperationProgress.slice(0, 6),
      defense: shared.defense,
    },
    footer: shared.footer,
  }
}

function buildNeoBrutalPosterViewModel(shared) {
  const issueNumber = resolveIssueNumber(shared)
  const progressPool = [...shared.cooperationProgress, ...shared.systemProgress, ...shared.visitProgress]
  const timeline = shared.overview.slice(0, 5).map((item, index) => ({
    node: item.number || String(index + 1).padStart(2, '0'),
    title: item.title,
    body: item.body,
    tag: item.tag,
  }))

  return {
    masthead: {
      kicker: 'BRUTAL OPS BULLETIN',
      title: shared.metaLine.title || '科研攻关战情周报',
      issue: `ISSUE ${issueNumber}`,
      period: shared.metaLine.periodText,
      signal: shared.stats[0]?.detail || '课题推进节奏稳定',
      publisher: shared.footer.issuedBy || '自动生成周报',
    },
    lead: {
      headline: shared.overview[0]?.title || shared.metaLine.title || '本周科研要点',
      subline: shared.metaLine.summary || '本周进展已整理为结构化战情信息。',
    },
    pillars: shared.stats.slice(0, 6),
    streams: {
      execution: shared.groups.internal.slice(0, 4),
      collaboration: shared.groups.cooperation.slice(0, 4),
      risk: shared.groups.system.slice(0, 4),
    },
    timeline,
    scoreboard: shared.keyMetrics.slice(0, 6),
    momentum: progressPool.slice(0, 6).map((item, index) => ({
      label: item.title || item.status || `推进事项 ${index + 1}`,
      progress: item.progress || 0,
      status: item.status || '进行中',
      tone: item.tone || 'progress',
    })),
    footer: shared.footer,
  }
}

function buildEditorialNewspaperViewModel(shared) {
  const issueNumber = resolveIssueNumber(shared)
  const title = shared.metaLine.title || '工作周报'
  const keyMetricItems = shared.keyMetrics.length > 0 ? shared.keyMetrics : shared.stats
  const issueText = `第 ${issueNumber} 期`
  const headerMotto = shared.keyPoints[0] || shared.metaLine.summary || '事实、进展、风险、计划'
  const noteText = joinNarrative([
    shared.metaLine.summary,
    ...shared.overview.slice(0, 3).map((item) => `${item.title}：${item.body}`),
  ])

  const internalPrimary = shared.groups.internal.slice(0, 3)
  const internalSecondary =
    shared.groups.internal.slice(3, 6).length > 0
      ? shared.groups.internal.slice(3, 6)
      : shared.overview.slice(1, 4).map((item) => ({
          title: item.title,
          body: item.body,
          status: item.tag,
          tone: item.tone,
        }))

  const systemSummaryItems = [
    ...shared.decisions.slice(0, 2).map((item, index) => ({
      title: `决策关注 ${index + 1}`,
      body: item,
      status: '待确认',
      tone: 'warning',
    })),
    ...shared.resources.slice(0, 2).map((item, index) => ({
      title: `资源保障 ${index + 1}`,
      body: item,
      status: '需协调',
      tone: 'progress',
    })),
  ]

  const decisionItems = shared.decisions.slice(0, 4)
  const resourceItems = shared.resources.slice(0, 4)
  const nextActions = buildNextActionCards(shared)
  const specialItems = buildSpecialCaseItems(shared)
  const sections = [
    {
      id: 's-internal',
      ordinal: '壹',
      title: '内部推进',
      enTitle: 'Internal Execution',
      blocks: [
        {
          type: 'stats',
          span: 'c2',
          items: buildEditorialStatGroup(shared.stats.slice(0, 3), [
            { value: String(shared.groups.internal.length), unit: '项', label: '内部推进事项' },
          ]),
        },
        {
          type: 'list',
          span: 'c5',
          title: '内部推进事项',
          items: toEditorialEntries(internalPrimary, '责任状态'),
        },
        {
          type: 'list',
          span: 'c5',
          title: '执行补充与跟进',
          items: toEditorialEntries(internalSecondary, '跟进状态'),
        },
        {
          type: 'list',
          span: 'c12',
          tone: 'red',
          title: '执行总览',
          items: [
            {
              title: shared.overview[0]?.title || title,
              body: shared.overview[0]?.body || shared.metaLine.summary,
              meta: `摘要：${shared.overview[0]?.tag || shared.metaLine.issueLabel}`,
            },
          ],
        },
      ],
    },
    {
      id: 's-collab',
      ordinal: '贰',
      title: '协同联动',
      enTitle: 'Collaboration & Visits',
      blocks: [
        {
          type: 'list',
          span: 'c3',
          title: '交流互访',
          items: toEditorialEntries(shared.groups.visit.slice(0, 3), '协同状态'),
        },
        {
          type: 'pullquote',
          span: 'c2',
          eye: '本周焦点',
          quote: shared.overview[1]?.title || shared.overview[0]?.title || '协同链路保持稳定推进',
          sub: shared.overview[1]?.body || shared.metaLine.summary,
        },
        {
          type: 'list',
          span: 'c4',
          title: '对外合作',
          items: toEditorialEntries(shared.groups.cooperation.slice(0, 4), '推进状态'),
        },
        {
          type: 'stats',
          span: 'c3',
          items: [
            { value: String(shared.groups.cooperation.length), unit: '项', label: '合作事项' },
            { value: String(shared.groups.visit.length), unit: '项', label: '交流互访' },
            {
              value: String(shared.defense.total || shared.groups.system.length),
              unit: shared.defense.total ? '单' : '项',
              label: shared.defense.total ? '评审总量' : '体系事项',
            },
          ],
        },
      ],
    },
    {
      id: 's-system',
      ordinal: '叁',
      title: '体系建设',
      enTitle: 'System Development',
      blocks: [
        {
          type: 'list',
          span: 'c4',
          title: '制度与机制',
          items: toEditorialEntries(shared.groups.system.slice(0, 4), '推进状态'),
        },
        {
          type: 'list',
          span: 'c4',
          title: '关键指标',
          items: keyMetricItems.slice(0, 4).map((item) => ({
            title: `${item.label || '指标'} · ${item.value || '--'}${item.unit || ''}`,
            body: item.sub || item.detail || '持续跟踪中。',
            meta: '指标摘要',
          })),
        },
        {
          type: 'list',
          span: 'c4',
          tone: 'navy',
          title: '本周保障摘要',
          items: toEditorialEntries(systemSummaryItems.length > 0 ? systemSummaryItems : shared.overview.slice(0, 3), '状态'),
        },
      ],
    },
    {
      id: 's-support',
      ordinal: '肆',
      title: '决策与保障',
      enTitle: 'Decisions & Support',
      blocks: [
        {
          type: 'list',
          span: 'c6',
          title: '决策事项',
          items: toEditorialEntries(
            decisionItems.length > 0
              ? decisionItems.map((item, index) => ({
                  title: `决策事项 ${index + 1}`,
                  body: item,
                  status: '待确认',
                  tone: 'warning',
                }))
              : shared.overview.slice(0, 3),
            '状态',
          ),
        },
        {
          type: 'list',
          span: 'c6',
          title: '资源与支撑',
          items: toEditorialEntries(
            resourceItems.length > 0
              ? resourceItems.map((item, index) => ({
                  title: `资源诉求 ${index + 1}`,
                  body: item,
                  status: '需协调',
                  tone: 'progress',
                }))
              : shared.keyPoints.slice(0, 3).map((item, index) => ({
                  title: `支撑要点 ${index + 1}`,
                  body: item,
                  status: '持续跟进',
                  tone: 'progress',
                })),
            '状态',
          ),
        },
      ],
    },
  ]

  return {
    masthead: {
      orgName: shared.metaLine.unitText || 'Doc2Brief Weekly Bulletin',
      deptName: shared.footer.issuedBy || '自动生成周报',
      volInfo: `Vol.${shared.metaLine.issuedDateText.slice(0, 4)} · No.${issueNumber} · Weekly`,
      title,
      titleEn: 'Weekly Work Report',
      issueNumber,
      dateRange: shared.metaLine.periodText,
      weekLabel: `${shared.metaLine.issueLabel} · ${shared.metaLine.issuedDateText}`,
      editorialInfo: `主办：${shared.footer.issuedBy || '自动生成周报'} | 报送：${shared.footer.recipient || '相关负责人'} | 分发：${shared.footer.distribution || '相关部门'}`,
      motto: headerMotto,
      badge: '内部资料 · 请勿外传',
    },
    note: {
      eyebrow: `Editor's Note · ${issueText}`,
      text: noteText,
    },
    toc: [
      { id: 's-note', label: '本期导读' },
      ...sections.map((section) => ({ id: section.id, label: section.title })),
      { id: 's-special', label: '风险与特殊情况' },
      { id: 's-plan', label: '下周工作计划' },
    ],
    sections,
    special: {
      id: 's-special',
      ordinal: '伍',
      title: '风险与特殊情况',
      enTitle: 'Special Cases',
      items: specialItems,
    },
    plan: {
      id: 's-plan',
      ordinal: '陆',
      title: '下周工作计划',
      enTitle: "Next Week's Action Plan",
      items: nextActions,
    },
    footer: {
      department: shared.footer.issuedBy || '自动生成周报',
      disclaimerCn: '本刊为内部资料，仅供工作参考，请妥善保管，未经许可不得对外传阅',
      disclaimerEn: 'Internal Use Only · Weekly Report Template',
      issueText: `${issueText} | ${shared.metaLine.issueLabel}`,
      publishDate: shared.footer.dateOnly || shared.metaLine.issuedDateText,
    },
  }
}

function buildNextActionCards(shared) {
  const nextActions = Array.isArray(shared.document?.next_actions) ? shared.document.next_actions.slice(0, 8) : []
  if (nextActions.length > 0) {
    return nextActions.map((item, index) => ({
      tag: item.owner || `推进事项 ${index + 1}`,
      deadline: item.deadline || '待补充',
      title: item.task || `下周事项 ${index + 1}`,
      body: item.dependency ? `依赖：${item.dependency}` : item.task || '待补充执行说明。',
      owner: item.owner || '待分配',
    }))
  }

  return [...shared.decisions, ...shared.resources]
    .slice(0, 8)
    .map((item, index) => ({
      tag: index < shared.decisions.length ? '决策推进' : '资源协调',
      deadline: '下周',
      title: item,
      body: '建议在下一个工作周期完成确认、协调或闭环跟进。',
      owner: shared.footer.issuedBy || '相关责任人',
    }))
}

function buildSpecialCaseItems(shared) {
  const risks = Array.isArray(shared.document?.risk_items) ? shared.document.risk_items.slice(0, 4) : []
  if (risks.length > 0) {
    return risks.map((item) => ({
      label: riskLabel(item.level),
      title: item.risk || '风险项待补充',
      text: item.mitigation || '请补充应对措施。',
      tags: [
        item.level ? `等级：${String(item.level).toUpperCase()}` : '',
        item.owner ? `责任人：${item.owner}` : '',
        item.mitigation ? '已附缓解动作' : '',
      ].filter(Boolean),
    }))
  }

  return [
    {
      label: '▶ 风险提示',
      title: shared.overview[0]?.title || '当前暂无显式风险条目',
      text: shared.overview[0]?.body || shared.metaLine.summary || '当前原文未识别到明确风险项，可补充风险章节以提升结构化质量。',
      tags: ['状态：持续观察', `责任部门：${shared.footer.issuedBy || '自动生成周报'}`],
    },
  ]
}

function buildEditorialStatGroup(primaryStats, fallbackStats = []) {
  const merged = [...primaryStats, ...fallbackStats]
  return merged.slice(0, 3).map((item) => ({
    value: item.value || '--',
    unit: item.unit || '',
    label: item.label || '关键指标',
  }))
}

function toEditorialEntries(items, metaLabel = '状态') {
  return (Array.isArray(items) ? items : []).slice(0, 4).map((item, index) => {
    if (typeof item === 'string') {
      return {
        title: item,
        body: '待补充说明。',
        meta: `${metaLabel}：持续跟进`,
      }
    }

    const title = item?.title || `条目 ${index + 1}`
    const body = item?.body || item?.sub || item?.detail || '暂无补充说明。'
    const status = item?.status || item?.tag || item?.label || '进行中'
    return {
      title,
      body,
      meta: `${metaLabel}：${status}`,
    }
  })
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

function resolveIssueNumber(shared) {
  return String(shared.metaLine.issueLabel.match(/\d+/)?.[0] || '1').padStart(2, '0')
}

function joinNarrative(parts) {
  return parts
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .join(' ')
}

function riskLabel(level) {
  if (String(level || '').toLowerCase() === 'high') return '▶ 高风险'
  if (String(level || '').toLowerCase() === 'medium') return '▶ 中风险'
  if (String(level || '').toLowerCase() === 'low') return '▶ 低风险'
  return '▶ 风险提示'
}
