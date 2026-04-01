import { fallbackParse } from './fallback-parser'

const DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'
const DEFAULT_HTML_MODEL = 'minimax/minimax-m2.7'
const DEFAULT_STRUCTURED_MODEL = 'minimax/minimax-m2.7'

const OPENROUTER_BASE_URL = (
  import.meta.env.OPENROUTER_BASE_URL || import.meta.env.MINIMAX_BASE_URL || DEFAULT_BASE_URL
).replace(/\/$/, '')
const OPENROUTER_HTML_MODEL =
  import.meta.env.OPENROUTER_HTML_MODEL || import.meta.env.MINIMAX_HTML_MODEL || DEFAULT_HTML_MODEL
const OPENROUTER_STRUCTURED_MODEL =
  import.meta.env.OPENROUTER_STRUCTURED_MODEL ||
  import.meta.env.MINIMAX_STRUCTURED_MODEL ||
  import.meta.env.OPENROUTER_MODEL ||
  import.meta.env.MINIMAX_MODEL ||
  DEFAULT_STRUCTURED_MODEL
const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY || import.meta.env.MINIMAX_API_KEY || ''

const STYLE_PROFILES = {
  official: {
    name: '正式稳重',
    languageStrategy: '用词客观克制、先结论后依据、避免口号化修饰。',
    structureStrategy: '按“结论-进展-风险-动作-请求”组织内容，层级清晰。',
    forbidden: '避免夸张词、感叹句和未经证实的价值判断。',
    htmlVisualDirection: '深色商务与低饱和科技蓝，模块分区清楚，信息密度中等偏高。',
  },
  'data-driven': {
    name: '数据导向',
    languageStrategy: '以指标和趋势为主语，强调对比关系、完成度与波动解释。',
    structureStrategy: '优先呈现指标面板，再展开进展、风险和投入产出。',
    forbidden: '避免只有形容词没有数据支撑的描述。',
    htmlVisualDirection: '指标卡片优先、对比色突出关键数字、图表占比可更高。',
  },
  narrative: {
    name: '叙事表达',
    languageStrategy: '保持事实前提下构建主线，突出阶段变化与关键转折。',
    structureStrategy: '按“背景-动作-结果-下一步”叙事，增强可读性。',
    forbidden: '避免剧情化虚构、避免脱离原文的故事延展。',
    htmlVisualDirection: '章节叙事块与时间线结合，视觉节奏更连续。',
  },
}

const DEPARTMENT_PROFILES = {
  'education-management-center': {
    name: '教科人管理中心',
    mission: '统筹教学、科研与人才工作，确保政策与资源协同落地。',
    priorities: ['教学与科研协同推进', '人才引育留用机制', '跨条线任务闭环'],
    keyMetrics: ['重点任务完成率', '人才项目推进数', '政策执行闭环率'],
    riskFocus: ['跨条线协调延迟', '关键岗位人力紧张', '制度执行不一致'],
  },
  'science-research-center': {
    name: '科学研究中心',
    mission: '推动科研项目全周期管理与成果高质量产出。',
    priorities: ['课题立项与里程碑', '论文专利与成果转化', '平台与团队建设'],
    keyMetrics: ['在研课题阶段达成率', '成果产出数量与质量', '项目经费执行进度'],
    riskFocus: ['关键里程碑延期', '成果转化周期拉长', '科研资源配置不足'],
  },
  'industry-development-center': {
    name: '产业发展中心',
    mission: '促进产学研合作与产业化落地，扩大外部生态影响力。',
    priorities: ['合作项目拓展', '成果转化签约落地', '产业生态协同'],
    keyMetrics: ['新增合作项目数', '转化合同金额/数量', '合作项目履约率'],
    riskFocus: ['合作推进不及预期', '商务条款风险', '外部依赖过高'],
  },
  'intelligent-innovation-center': {
    name: '智能创新中心',
    mission: '推进智能化创新项目，建设可复用技术能力和试点场景。',
    priorities: ['创新项目孵化', '技术中台建设', '场景试点验证'],
    keyMetrics: ['试点项目上线率', '模型/算法迭代效率', '技术复用率'],
    riskFocus: ['技术验证周期超预期', '数据质量与可用性不足', '算力与工程资源瓶颈'],
  },
  'administration-management-center': {
    name: '行政管理中心',
    mission: '提供行政运营与资源保障，提升组织运行效率。',
    priorities: ['行政流程效率', '预算采购与资产保障', '制度执行与服务质量'],
    keyMetrics: ['流程平均周期', '预算执行率', '服务响应与满意度'],
    riskFocus: ['流程堵点反复出现', '采购履约风险', '跨部门协作成本上升'],
  },
  'party-ideology-supervision-center': {
    name: '党建思政与监督中心',
    mission: '加强党建思政引领与监督闭环，保障合规与廉政要求落实。',
    priorities: ['党建思政活动落实', '监督检查闭环', '问题整改跟踪'],
    keyMetrics: ['监督问题闭环率', '整改按期完成率', '重点事项覆盖率'],
    riskFocus: ['整改超期', '监督盲区', '制度执行偏差'],
  },
  'strategy-center': {
    name: '战略中心',
    mission: '负责中长期战略规划与重大项目统筹，驱动跨中心协同。',
    priorities: ['战略任务分解', '重点项目推进', '跨中心资源协调'],
    keyMetrics: ['战略里程碑达成率', '重大项目推进率', '跨中心协同效率'],
    riskFocus: ['战略落地节奏偏慢', '关键资源冲突', '重大项目依赖风险'],
  },
}

const LEGACY_DEPARTMENT_ALIASES = {
  research: 'science-research-center',
  teaching: 'education-management-center',
  international: 'industry-development-center',
  talent: 'education-management-center',
  operations: 'administration-management-center',
  comprehensive: 'strategy-center',
}

const AUDIENCE_PROFILES = {
  director: {
    name: '院长/主任',
    preference: '先看结论与风险，再看关键支撑事实。',
    decisionFocus: '本周最重要进展、主要风险、需要拍板事项。',
    followUps: ['是否影响年度目标', '是否需要跨部门协调', '是否需要资源倾斜'],
    sectionOrder: ['摘要结论', '关键指标', '风险与决策请求', '下周动作'],
  },
  executive: {
    name: '分管领导',
    preference: '关注任务达成度、阻塞点和投入产出。',
    decisionFocus: '关键任务是否按计划推进、阻塞点如何解除。',
    followUps: ['责任人是否明确', '时间节点是否可信', '资源投入是否匹配'],
    sectionOrder: ['目标进展', '执行状态', '阻塞与依赖', '资源诉求'],
  },
  operations: {
    name: '执行负责人',
    preference: '关注可执行清单、责任与时间点。',
    decisionFocus: '本周完成项、未完成原因、下周排期与依赖。',
    followUps: ['具体责任人是谁', '最晚完成时间', '需要谁配合'],
    sectionOrder: ['任务清单', '进展明细', '风险闭环', '下周排期'],
  },
  risk: {
    name: '风控合规负责人',
    preference: '关注风险等级、触发条件、应对动作与证据。',
    decisionFocus: '高风险事项是否已闭环、是否存在合规缺口。',
    followUps: ['风险触发阈值', '缓释措施有效性', '整改节点是否可审计'],
    sectionOrder: ['风险总览', '高风险明细', '整改动作', '监督节点'],
  },
}

export async function generateReport(params) {
  const { context } = params
  if (context.generationMode === 'llm-html') {
    return generatePureHtmlReport(params)
  }
  return generateStructuredReport(params)
}

async function generateStructuredReport(params) {
  const { rawText, sensitiveMode, styleMeta, templateMeta, context, pushLog } = params
  const startedAt = performance.now()
  const warnings = []
  const model = OPENROUTER_STRUCTURED_MODEL

  const primaryRequestPayload = {
    model,
    messages: buildStructuredMessages({ rawText, sensitiveMode, styleMeta, templateMeta, context }),
    temperature: 0.1,
    max_tokens: chooseMaxTokens(rawText, 'structured-template'),
  }
  const requestPayload = { primary: primaryRequestPayload, retry: null }

  pushLog({
    kind: 'business',
    module: '模型编排',
    event: '结构化输入',
    payload: {
      model,
      rawLength: rawText.length,
      stylePreference: styleMeta.id,
      templateId: templateMeta.id,
      department: context.department,
      audience: context.audience,
      maxTokens: primaryRequestPayload.max_tokens,
    },
    timestamp: new Date().toISOString(),
  })

  if (!OPENROUTER_API_KEY) {
    const fallback = fallbackParse(rawText, sensitiveMode)
    warnings.push('未配置 OpenRouter API Key，已自动切换到本地结构化解析。')
    pushLog({
      kind: 'error',
      module: '模型编排',
      event: '缺少 API Key，结构化降级',
      payload: { model },
      timestamp: new Date().toISOString(),
    })
    return {
      document: fallback,
      warnings,
      modelUsed: 'fallback-local',
      requestPayload,
      responsePayload: { fallback: true },
    }
  }

  try {
    let responsePayload = await requestOpenRouter(primaryRequestPayload)
    let content = extractResponseContent(responsePayload)
    let parsed
    let usedRetry = false

    try {
      parsed = parseJsonObject(content)
    } catch (error) {
      const firstError = error instanceof Error ? error.message : '结构化解析失败'
      const retryRequestPayload = {
        model,
        messages: buildStructuredRetryMessages({ rawText, styleMeta, templateMeta, context, brokenOutput: content }),
        temperature: 0,
        max_tokens: Math.max(2600, chooseMaxTokens(rawText, 'structured-template')),
      }
      requestPayload.retry = retryRequestPayload
      usedRetry = true

      pushLog({
        kind: 'system',
        module: '模型编排',
        event: '结构化解析失败，触发重试',
        payload: { firstError },
        timestamp: new Date().toISOString(),
      })

      responsePayload = await requestOpenRouter(retryRequestPayload)
      content = extractResponseContent(responsePayload)
      parsed = parseJsonObject(content)
      warnings.push('首轮结构化输出异常，系统已自动重试并修复。')
    }

    const normalized = normalizeDocument(parsed, rawText, sensitiveMode)
    const elapsedMs = Number((performance.now() - startedAt).toFixed(2))

    pushLog({
      kind: 'business',
      module: '模型编排',
      event: '结构化输出',
      payload: {
        model,
        title: normalized.title,
        sectionCount: normalized.sections.length,
        metricCount: normalized.metrics?.length ?? 0,
        usedRetry,
        warningCount: warnings.length,
      },
      timestamp: new Date().toISOString(),
    })
    pushLog({
      kind: 'system',
      module: '模型编排',
      event: '结构化请求完成',
      payload: { elapsedMs, model },
      timestamp: new Date().toISOString(),
    })

    return {
      document: normalized,
      warnings,
      modelUsed: model,
      requestPayload,
      responsePayload,
    }
  } catch (error) {
    const fallback = fallbackParse(rawText, sensitiveMode)
    const message = error instanceof Error ? error.message : '未知异常'
    warnings.push(`模型结构化失败，已自动切换到本地结构化：${message}`)

    pushLog({
      kind: 'error',
      module: '模型编排',
      event: '结构化请求失败，降级',
      payload: { error: message, model },
      timestamp: new Date().toISOString(),
    })

    return {
      document: fallback,
      warnings,
      modelUsed: 'fallback-local',
      requestPayload,
      responsePayload: { fallback: true, error: message },
    }
  }
}

async function generatePureHtmlReport(params) {
  const { rawText, sensitiveMode, styleMeta, templateMeta, context, pushLog } = params
  const startedAt = performance.now()
  const warnings = []
  const fallbackDocument = fallbackParse(rawText, sensitiveMode)
  const model = OPENROUTER_HTML_MODEL

  const requestPayload = {
    model,
    messages: buildHtmlMessages({ rawText, sensitiveMode, styleMeta, templateMeta, context }),
    temperature: 0.4,
    max_tokens: chooseMaxTokens(rawText, 'llm-html'),
  }

  pushLog({
    kind: 'business',
    module: '模型编排',
    event: 'HTML直出输入',
    payload: {
      model,
      rawLength: rawText.length,
      stylePreference: styleMeta.id,
      templateId: templateMeta.id,
      department: context.department,
      audience: context.audience,
    },
    timestamp: new Date().toISOString(),
  })

  if (!OPENROUTER_API_KEY) {
    warnings.push('未配置 OpenRouter API Key，已回退到本地模板化预览。')
    pushLog({
      kind: 'error',
      module: '模型编排',
      event: '缺少 API Key，HTML直出降级',
      payload: { model },
      timestamp: new Date().toISOString(),
    })
    return {
      document: fallbackDocument,
      warnings,
      modelUsed: 'fallback-local',
      requestPayload,
      responsePayload: { fallback: true },
      generatedHtml: buildFallbackHtmlFromDocument(fallbackDocument, context),
    }
  }

  try {
    const responsePayload = await requestOpenRouter(requestPayload)
    const content = extractResponseContent(responsePayload)
    let generatedHtml = ensureHtmlDocument(content)
    const quality = evaluateHtmlQuality(generatedHtml)
    const elapsedMs = Number((performance.now() - startedAt).toFixed(2))
    const finishReason = responsePayload?.choices?.[0]?.finish_reason || 'unknown'

    if (!quality.ok) {
      warnings.push(`LLM 输出内容不完整（${quality.reason}），已自动切换为增强回退页面。`)
      generatedHtml = buildFallbackHtmlFromDocument(fallbackDocument, context)

      pushLog({
        kind: 'system',
        module: '模型编排',
        event: 'HTML质量闸门触发回退',
        payload: {
          finishReason,
          quality,
        },
        timestamp: new Date().toISOString(),
      })
    }

    pushLog({
      kind: 'business',
      module: '模型编排',
      event: 'HTML直出输出',
      payload: {
        model,
        htmlLength: generatedHtml.length,
        finishReason,
        warningCount: warnings.length,
      },
      timestamp: new Date().toISOString(),
    })
    pushLog({
      kind: 'system',
      module: '模型编排',
      event: 'HTML直出请求完成',
      payload: { elapsedMs, model },
      timestamp: new Date().toISOString(),
    })

    return {
      document: fallbackDocument,
      warnings,
      modelUsed: model,
      requestPayload,
      responsePayload,
      generatedHtml,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知异常'
    warnings.push(`模型 HTML 直出失败，已回退到本地模板化预览：${message}`)
    pushLog({
      kind: 'error',
      module: '模型编排',
      event: 'HTML直出请求失败，降级',
      payload: { error: message, model },
      timestamp: new Date().toISOString(),
    })

    return {
      document: fallbackDocument,
      warnings,
      modelUsed: 'fallback-local',
      requestPayload,
      responsePayload: { fallback: true, error: message },
      generatedHtml: buildFallbackHtmlFromDocument(fallbackDocument, context),
    }
  }
}

function buildStructuredMessages(params) {
  const { rawText, sensitiveMode, styleMeta, templateMeta, context } = params
  const styleProfile = getStyleProfile(styleMeta.id)
  const departmentProfile = getDepartmentProfile(context.department)
  const audienceProfile = getAudienceProfile(context.audience)
  const modeNote = sensitiveMode
    ? '敏感表达模式开启：描述需克制、客观、可追溯，不使用夸张措辞。'
    : '标准表达模式：可以有展示感，但不得编造事实。'

  const schema =
    '{"title":"","subtitle":"","summary":"","department_focus":"","audience_focus":"",' +
    '"highlights":[{"label":"","value":"","detail":""}],' +
    '"metrics":[{"name":"","value":"","trend":"","note":""}],' +
    '"key_points":[""],' +
    '"progress_items":[{"stream":"","status":"","outcome":"","owner":""}],' +
    '"risk_items":[{"risk":"","level":"","mitigation":"","owner":""}],' +
    '"next_actions":[{"task":"","deadline":"","owner":"","dependency":""}],' +
    '"decision_requests":[""],"resource_requests":[""],' +
    '"sections":[{"title":"","description":"","items":[{"title":"","body":"","tag":""}]}]}'

  const system = [
    '你是 file2web 的“周报结构化抽取总编”，负责把原文提炼成稳定、可追溯的 JSON 报告数据。',
    '',
    '【输出协议】',
    '- 必须只输出一个 JSON 对象，不得输出 Markdown、解释、代码块或前后说明。',
    '- 所有字段必须出现，缺失值用空字符串或空数组补齐。',
    `- JSON 结构（不可改字段名）：${schema}`,
    '',
    '【抽取与归一化规则】',
    '1. 事实优先：只能提炼原文事实，不得编造数字、单位、人名、结论。',
    '2. 冲突保守：原文有冲突时优先使用更明确、更可核验的信息，并保持措辞保守。',
    '3. 结构稳定：highlights 固定 3 条；metrics 建议 3-6 条；sections 建议 5-8 组。',
    '4. 可执行性：progress_items/risk_items/next_actions 尽量补齐 owner 或 dependency。',
    '5. 可追溯性：summary、highlights、decision_requests 必须能在原文中找到依据。',
    '6. 紧凑输出：summary 控制在 90-180 字；每个 items.body 建议 30-90 字。',
    '7. 禁止把整段原文逐字复制到单个字段，必须做信息压缩与归纳。',
    '',
    '【组织上下文自动适配】',
    `- 部门：${departmentProfile.name}`,
    `- 部门职责：${departmentProfile.mission}`,
    `- 部门重点：${departmentProfile.priorities.join('；')}`,
    `- 重点指标：${departmentProfile.keyMetrics.join('；')}`,
    `- 风险关注：${departmentProfile.riskFocus.join('；')}`,
    `- 受众：${audienceProfile.name}`,
    `- 阅读偏好：${audienceProfile.preference}`,
    `- 决策关注：${audienceProfile.decisionFocus}`,
    `- 高频追问：${audienceProfile.followUps.join('；')}`,
    `- 风格策略：${styleProfile.name}`,
    `- 语言策略：${styleProfile.languageStrategy}`,
    `- 结构策略：${styleProfile.structureStrategy}`,
    `- 表达禁忌：${styleProfile.forbidden}`,
    `- 风格补充：${styleMeta.promptHint}`,
    '',
    '【模板参考（仅用于调整重点，不改变 JSON 架构）】',
    `- 模板侧重点：${templateMeta.focus}`,
    `- 模块蓝图：${templateMeta.moduleBlueprint.join(' -> ')}`,
    context.customRequirement ? `- 额外业务要求：${context.customRequirement}` : '- 额外业务要求：无。',
    '',
    '【质量门槛】',
    '- department_focus 和 audience_focus 各输出 1 句，明确“本部门最该关注什么”“当前受众最关心什么”。',
    '- 若原文信息不足，保持字段为空或写“待补充”，不得猜测。',
  ].join('\n')

  const user = [modeNote, '请按上述要求结构化整理以下周报原文，并直接返回 JSON：', rawText].join('\n\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

function buildStructuredRetryMessages(params) {
  const { rawText, styleMeta, templateMeta, context, brokenOutput } = params
  const styleProfile = getStyleProfile(styleMeta.id)
  const departmentProfile = getDepartmentProfile(context.department)
  const audienceProfile = getAudienceProfile(context.audience)

  const schema =
    '{"title":"","subtitle":"","summary":"","department_focus":"","audience_focus":"",' +
    '"highlights":[{"label":"","value":"","detail":""}],' +
    '"metrics":[{"name":"","value":"","trend":"","note":""}],' +
    '"key_points":[""],' +
    '"progress_items":[{"stream":"","status":"","outcome":"","owner":""}],' +
    '"risk_items":[{"risk":"","level":"","mitigation":"","owner":""}],' +
    '"next_actions":[{"task":"","deadline":"","owner":"","dependency":""}],' +
    '"decision_requests":[""],"resource_requests":[""],' +
    '"sections":[{"title":"","description":"","items":[{"title":"","body":"","tag":""}]}]}'

  const system = [
    '你是 JSON 修复与压缩器。你将根据原文重新生成一个完整 JSON，不要沿用损坏输出。',
    '必须只输出一个合法 JSON 对象，不要任何解释、代码块、注释。',
    `JSON 结构（字段名不可改）：${schema}`,
    '硬性要求：',
    '1. summary 90-160 字；highlights 固定 3 条；sections 4-6 组。',
    '2. 每个 items.body 30-80 字，禁止整段复制原文。',
    '3. 信息必须来自原文，不得编造。',
    `4. 部门：${departmentProfile.name}；重点：${departmentProfile.priorities.join('、')}`,
    `5. 受众：${audienceProfile.name}；关注：${audienceProfile.decisionFocus}`,
    `6. 风格：${styleProfile.name}；策略：${styleProfile.languageStrategy}`,
    `7. 模板侧重：${templateMeta.focus}`,
  ].join('\n')

  const user = ['以下是原始正文：', rawText, '以下是损坏输出（仅供参考，可忽略）：', brokenOutput].join('\n\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

function buildHtmlMessages(params) {
  const { rawText, sensitiveMode, styleMeta, templateMeta, context } = params
  const styleProfile = getStyleProfile(styleMeta.id)
  const departmentProfile = getDepartmentProfile(context.department)
  const audienceProfile = getAudienceProfile(context.audience)
  const creativeProfile = getHtmlCreativeProfile({
    departmentId: context.department,
    styleId: styleMeta.id,
    audienceId: context.audience,
  })

  const modeNote = sensitiveMode
    ? '敏感表达模式开启：文字必须克制、可核验、风险表达客观，避免煽动性修辞。'
    : '标准表达模式：可提升视觉张力与叙事节奏，但所有事实必须源于原文。'

  const system = [
    'Role:',
    '你是一位顶级的创意信息架构师（Creative Information Architect）。你精通前端工程、数据可视化艺术和动态排版美学。',
    '你的任务是将原文中的周报信息转化为具有生命力、交互感且风格鲜明的 HTML 可视化报告。',
    '',
    '第一阶段：内容与部门调性分析（先分析再编码）',
    '- 在写 HTML 之前，先做“视觉隐喻选择”，并用该隐喻统一全页设计语言。',
    '- 数据密集型（研发/财务/运营）=> 工业仪表盘 / 数据流风格，强调网格、扫描感、对比图形。',
    '- 成果导向型（市场/商务/公共）=> 数字化期刊 / 画廊风格，强调视觉冲击、流体布局与沉浸阅读。',
    '- 管理决策型（战略/HR/总办）=> 极简叙事 / 结构化脑图风格，强调信息层级与核心指标放大。',
    `- 当前部门映射：${creativeProfile.trackLabel}；视觉隐喻：${creativeProfile.visualMetaphor}。`,
    `- 当前受众关注：${creativeProfile.audienceDirective}。`,
    `- 当前风格补偿：${creativeProfile.styleDirective}。`,
    '',
    '第二阶段：内置数据可视化引擎（原生绘图协议）',
    '- 禁止平庸布局，必须用原生 SVG + CSS 变量构建可视化组件。',
    '- 至少实现 4 个组件，且必须包含“雷达图”或“漏斗/管道”中的至少一种：',
    '  1) 多维雷达图（Radar）',
    '  2) 动态漏斗/管道（Funnel/Pipeline）',
    '  3) 微趋势火花线（Sparklines）',
    '  4) 环形进度解构（Donut Breakdowns）',
    '  5) 热力矩阵（Heatmap）',
    '- 图形在进入视口时要有“自生长”动画，悬浮态提供数值高亮反馈（可用 CSS hover 或原生 title/tooltip）。',
    '',
    '第三阶段：视觉多样性生成引擎（硬性约束）',
    '- 本次页面必须采用以下视觉底层架构之一，避免同质化后台模板感：',
    '  [Architectural Grid] [Fluid Neumorphism] [Dark Terminal] [Swiss Editorial] [Abstract Modernist]',
    `- 当前优先架构：${creativeProfile.primaryArchitecture}。`,
    `- 可选替代架构：${creativeProfile.alternativeArchitectures.join(' / ')}。`,
    '- 页面必须有明确的版式个性，禁止“卡片堆叠 + 默认色 + 统一圆角”式通用审美。',
    '',
    '第四阶段：技术与交互规范',
    '1. 单文件闭环：所有 CSS/SVG/JS 均内嵌；禁止外部 JS 库（如 ECharts、Chart.js）。',
    '2. 响应式 + 打印：手机端可读；提供 @media print 以优化打印版式。',
    '3. 动态编辑：核心文案、关键数字、状态标签需具备 contenteditable="true"。',
    '4. 交互控件：提供“风格切换”或“调色盘切换”的浮动控制面板（可纯 CSS 实现）。',
    '5. 组件化排版：使用 CSS Grid，让卡片可根据内容长度自动跨行/跨列。',
    '',
    '禁止项（Hard Constraints）',
    '- NO Static Images：禁止外部图片，背景纹理与装饰元素必须由 CSS/SVG 绘制。',
    '- NO Generic Tables：禁止使用 HTML <table> 展示业务数据，统一使用 div-grid。',
    '- NO Default Colors：禁止默认红蓝绿与无层次色板，使用专业色系并提供灰度层级。',
    '- NO Fabrication：严禁编造事实、数字、责任人、时间点。',
    '',
    '输出协议',
    '- 只输出完整 HTML 文档本体，必须包含 <!doctype html><html><head><body>。',
    '- 禁止输出 Markdown、解释、代码块、注释说明。',
    '- 页面至少包含：摘要、关键指标、重点进展、风险与应对、下周计划、决策请求。',
    '- 若原文缺失信息，必须明确标注“待补充”，不得猜测。',
    '',
    '组织上下文自动适配',
    `- 部门：${departmentProfile.name}`,
    `- 部门职责：${departmentProfile.mission}`,
    `- 部门重点：${departmentProfile.priorities.join('；')}`,
    `- 重点指标：${departmentProfile.keyMetrics.join('；')}`,
    `- 风险关注：${departmentProfile.riskFocus.join('；')}`,
    `- 受众：${audienceProfile.name}`,
    `- 阅读偏好：${audienceProfile.preference}`,
    `- 决策关注：${audienceProfile.decisionFocus}`,
    `- 建议阅读顺序：${audienceProfile.sectionOrder.join(' -> ')}`,
    `- 高频追问：${audienceProfile.followUps.join('；')}`,
    `- 风格策略：${styleProfile.name}`,
    `- 语言策略：${styleProfile.languageStrategy}`,
    `- 结构策略：${styleProfile.structureStrategy}`,
    `- 视觉方向：${styleProfile.htmlVisualDirection}`,
    `- 表达禁忌：${styleProfile.forbidden}`,
    `- 风格补充：${styleMeta.promptHint}`,
    '',
    '模板参考（仅用于组织信息，不要求复刻视觉）',
    `- 参考模板：${templateMeta.title}`,
    `- 模板侧重点：${templateMeta.focus}`,
    `- 模块蓝图：${templateMeta.moduleBlueprint.join(' -> ')}`,
    context.customRequirement ? `- 额外业务要求：${context.customRequirement}` : '- 额外业务要求：无。',
  ].join('\n')

  const user = [
    modeNote,
    '请根据以下原文生成完整 HTML 周报页面：',
    rawText,
    '再次强调：只输出 HTML 文档本体。',
  ].join('\n\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

function getStyleProfile(styleId) {
  return STYLE_PROFILES[styleId] || STYLE_PROFILES.official
}

function getDepartmentProfile(departmentId) {
  const normalized = LEGACY_DEPARTMENT_ALIASES[departmentId] || departmentId
  return DEPARTMENT_PROFILES[normalized] || DEPARTMENT_PROFILES['science-research-center']
}

function getAudienceProfile(audienceId) {
  return AUDIENCE_PROFILES[audienceId] || AUDIENCE_PROFILES.director
}

function getHtmlCreativeProfile(params) {
  const { departmentId, styleId, audienceId } = params
  const normalizedDepartment = LEGACY_DEPARTMENT_ALIASES[departmentId] || departmentId

  const trackMap = {
    'science-research-center': {
      trackLabel: '数据密集型',
      visualMetaphor: '工业仪表盘 / 数据流',
      baseArchitectures: ['[Architectural Grid]', '[Dark Terminal]'],
    },
    'intelligent-innovation-center': {
      trackLabel: '数据密集型',
      visualMetaphor: '工业仪表盘 / 数据流',
      baseArchitectures: ['[Dark Terminal]', '[Architectural Grid]'],
    },
    'administration-management-center': {
      trackLabel: '数据密集型',
      visualMetaphor: '工业仪表盘 / 数据流',
      baseArchitectures: ['[Architectural Grid]', '[Swiss Editorial]'],
    },
    'industry-development-center': {
      trackLabel: '成果导向型',
      visualMetaphor: '数字化期刊 / 画廊',
      baseArchitectures: ['[Swiss Editorial]', '[Abstract Modernist]'],
    },
    'party-ideology-supervision-center': {
      trackLabel: '成果导向型',
      visualMetaphor: '数字化期刊 / 画廊',
      baseArchitectures: ['[Abstract Modernist]', '[Swiss Editorial]'],
    },
    'strategy-center': {
      trackLabel: '管理决策型',
      visualMetaphor: '极简叙事 / 结构化脑图',
      baseArchitectures: ['[Architectural Grid]', '[Fluid Neumorphism]'],
    },
    'education-management-center': {
      trackLabel: '管理决策型',
      visualMetaphor: '极简叙事 / 结构化脑图',
      baseArchitectures: ['[Fluid Neumorphism]', '[Architectural Grid]'],
    },
  }

  const selectedTrack = trackMap[normalizedDepartment] || trackMap['science-research-center']
  let primaryArchitecture = selectedTrack.baseArchitectures[0]

  if (audienceId === 'risk') {
    primaryArchitecture = '[Dark Terminal]'
  } else if (styleId === 'narrative') {
    primaryArchitecture = '[Swiss Editorial]'
  } else if (styleId === 'official') {
    primaryArchitecture = '[Architectural Grid]'
  }

  const allArchitectures = [
    '[Architectural Grid]',
    '[Fluid Neumorphism]',
    '[Dark Terminal]',
    '[Swiss Editorial]',
    '[Abstract Modernist]',
  ]
  const alternativeArchitectures = allArchitectures.filter((item) => item !== primaryArchitecture).slice(0, 3)

  const audienceDirectiveMap = {
    director: '优先放大结论、风险等级和需要拍板的事项，首屏必须可快速决策。',
    executive: '突出任务达成度、阻塞点与资源投入产出，模块顺序要利于周会讨论。',
    operations: '强化责任人、时间点和依赖关系，信息表达要可直接执行。',
    risk: '重点放大风险触发条件、等级、缓释动作和整改节点。',
  }

  const styleDirectiveMap = {
    official: '整体语气克制，层次稳定，强调结构秩序与可信度。',
    'data-driven': '优先让指标可视化，强调对比、趋势和进度状态。',
    narrative: '增强章节叙事与视觉节奏，让阅读形成连续体验。',
  }

  return {
    trackLabel: selectedTrack.trackLabel,
    visualMetaphor: selectedTrack.visualMetaphor,
    primaryArchitecture,
    alternativeArchitectures,
    audienceDirective: audienceDirectiveMap[audienceId] || audienceDirectiveMap.director,
    styleDirective: styleDirectiveMap[styleId] || styleDirectiveMap.official,
  }
}

async function requestOpenRouter(payload) {
  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'file2web-frontend',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter 请求失败：${response.status}`)
  }

  return await response.json()
}

function extractResponseContent(payload) {
  const choices = payload.choices
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error('模型响应缺少 choices')
  }

  const first = choices[0]
  const content = first.message?.content

  if (typeof content === 'string' && content.trim()) {
    return stripNoise(content)
  }

  if (Array.isArray(content)) {
    const merged = content
      .map((part) => {
        if (typeof part === 'string') {
          return part
        }
        if (part && typeof part === 'object' && 'text' in part) {
          const text = part.text
          return typeof text === 'string' ? text : ''
        }
        return ''
      })
      .join('')

    if (merged.trim()) {
      return stripNoise(merged)
    }
  }

  throw new Error('模型响应缺少可解析 content')
}

function parseJsonObject(value) {
  const stripped = value.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    const start = stripped.indexOf('{')
    if (start < 0) {
      throw new Error('模型输出不包含 JSON 对象')
    }
    let depth = 0
    for (let index = start; index < stripped.length; index += 1) {
      const char = stripped[index]
      if (char === '{') {
        depth += 1
      } else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          const candidate = stripped.slice(start, index + 1)
          return JSON.parse(candidate)
        }
      }
    }
    const repaired = repairPossiblyBrokenJson(stripped.slice(start))
    try {
      return JSON.parse(repaired)
    } catch {
      throw new Error('模型输出中的 JSON 不完整')
    }
  }
}

function repairPossiblyBrokenJson(source) {
  let candidate = source.trim()
  candidate = candidate.replace(/```+$/g, '').trim()
  candidate = candidate.replace(/,\s*([}\]])/g, '$1')

  const quoteCount = (candidate.match(/"/g) || []).length
  if (quoteCount % 2 === 1) {
    candidate = `${candidate}"`
  }

  const openBraces = (candidate.match(/{/g) || []).length
  const closeBraces = (candidate.match(/}/g) || []).length
  if (openBraces > closeBraces) {
    candidate += '}'.repeat(openBraces - closeBraces)
  }

  const openBrackets = (candidate.match(/\[/g) || []).length
  const closeBrackets = (candidate.match(/]/g) || []).length
  if (openBrackets > closeBrackets) {
    candidate += ']'.repeat(openBrackets - closeBrackets)
  }

  candidate = candidate.replace(/,\s*([}\]])/g, '$1')
  return candidate
}

function normalizeDocument(parsed, rawText, sensitiveMode) {
  const fallback = fallbackParse(rawText, sensitiveMode)

  const title = toCleanString(parsed.title) || fallback.title
  const subtitle = toCleanString(parsed.subtitle) || fallback.subtitle
  const summary = toCleanString(parsed.summary) || fallback.summary

  const highlights = normalizeHighlights(parsed.highlights)
  const metrics = normalizeMetrics(parsed.metrics)
  const keyPoints = normalizeStringList(parsed.key_points)
  const progressItems = normalizeProgressItems(parsed.progress_items)
  const riskItems = normalizeRiskItems(parsed.risk_items)
  const nextActions = normalizeNextActions(parsed.next_actions)
  const decisionRequests = normalizeStringList(parsed.decision_requests)
  const resourceRequests = normalizeStringList(parsed.resource_requests)
  const sections = normalizeSections(parsed.sections)

  return {
    title,
    subtitle,
    summary,
    highlights: highlights.length > 0 ? highlights.slice(0, 3) : fallback.highlights,
    metrics,
    key_points: keyPoints.length > 0 ? keyPoints.slice(0, 8) : fallback.key_points,
    progress_items: progressItems,
    risk_items: riskItems,
    next_actions: nextActions,
    decision_requests: decisionRequests,
    resource_requests: resourceRequests,
    sections: sections.length > 0 ? sections.slice(0, 8) : fallback.sections,
    source_excerpt: rawText.slice(0, 1200),
    sensitive_mode: sensitiveMode,
    department_focus: toCleanString(parsed.department_focus),
    audience_focus: toCleanString(parsed.audience_focus),
  }
}

function normalizeHighlights(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const candidate = item
      const label = toCleanString(candidate.label)
      const metric = toCleanString(candidate.value)
      const detail = toCleanString(candidate.detail)
      if (!label || !metric) {
        return null
      }
      return { label, value: metric, detail }
    })
    .filter((item) => item !== null)
}

function normalizeMetrics(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const candidate = item
      const name = toCleanString(candidate.name)
      const metricValue = toCleanString(candidate.value)
      const trend = toCleanString(candidate.trend)
      const note = toCleanString(candidate.note)
      if (!name || !metricValue) {
        return null
      }
      return { name, value: metricValue, trend, note }
    })
    .filter((item) => item !== null)
}

function normalizeProgressItems(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const candidate = item
      const stream = toCleanString(candidate.stream)
      const status = toCleanString(candidate.status)
      const outcome = toCleanString(candidate.outcome)
      const owner = toCleanString(candidate.owner)
      if (!stream || !status || !outcome) {
        return null
      }
      return { stream, status, outcome, owner }
    })
    .filter((item) => item !== null)
}

function normalizeRiskItems(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const candidate = item
      const risk = toCleanString(candidate.risk)
      const level = toCleanString(candidate.level)
      const mitigation = toCleanString(candidate.mitigation)
      const owner = toCleanString(candidate.owner)
      if (!risk || !mitigation) {
        return null
      }
      return { risk, level, mitigation, owner }
    })
    .filter((item) => item !== null)
}

function normalizeNextActions(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null
      }
      const candidate = item
      const task = toCleanString(candidate.task)
      const deadline = toCleanString(candidate.deadline)
      const owner = toCleanString(candidate.owner)
      const dependency = toCleanString(candidate.dependency)
      if (!task) {
        return null
      }
      return { task, deadline, owner, dependency }
    })
    .filter((item) => item !== null)
}

function normalizeSections(value) {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((section) => {
      if (!section || typeof section !== 'object') {
        return null
      }
      const sectionObj = section
      const itemsRaw = Array.isArray(sectionObj.items) ? sectionObj.items : []
      const items = itemsRaw
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return null
          }
          const itemObj = item
          const title = toCleanString(itemObj.title)
          const body = toCleanString(itemObj.body)
          const tag = toCleanString(itemObj.tag)
          if (!title || !body) {
            return null
          }
          return { title, body, tag }
        })
        .filter((item) => item !== null)

      if (items.length === 0) {
        return null
      }

      return {
        title: toCleanString(sectionObj.title) || '未命名分组',
        description: toCleanString(sectionObj.description),
        items: items.slice(0, 6),
      }
    })
    .filter((section) => section !== null)
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item) => toCleanString(item)).filter(Boolean)
}

function ensureHtmlDocument(rawContent) {
  const stripped = stripNoise(rawContent)
    .replace(/^```html/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim()

  const withoutScript = stripped.replace(/<script[\s\S]*?<\/script>/gi, '')
  const sanitized = sanitizeHtml(withoutScript)
  if (/<!doctype html>/i.test(sanitized) || /<html[\s>]/i.test(sanitized)) {
    return sanitized
  }

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>自动生成周报</title>
  <style>
    body { margin: 0; padding: 24px; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; background: #f4f6fb; color: #1f2937; }
    .page { max-width: 960px; margin: 0 auto; background: #fff; border: 1px solid #d9e2ef; border-radius: 14px; padding: 24px; }
  </style>
</head>
<body>
  <article class="page">${sanitized}</article>
</body>
</html>`
}

function sanitizeHtml(value) {
  return value
    .replace(/\s+on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"')
    .replace(/\s(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"')
}

function buildFallbackHtmlFromDocument(document, context) {
  const departmentProfile = getDepartmentProfile(context.department)
  const audienceProfile = getAudienceProfile(context.audience)
  const metrics = (document.metrics ?? [])
    .slice(0, 4)
    .map(
      (item) =>
        `<div class="metric-card"><span>${escapeHtml(item.name || '指标')}</span><strong>${escapeHtml(item.value || '待补充')}</strong><em>${escapeHtml(item.note || item.trend || '')}</em></div>`,
    )
    .join('')
  const keyPoints = (document.key_points ?? []).slice(0, 8).map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const progress = (document.progress_items ?? [])
    .slice(0, 6)
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.stream || '事项')}</strong><span>${escapeHtml(item.status || '推进中')}</span><p>${escapeHtml(item.outcome || '')}</p></li>`,
    )
    .join('')
  const risks = (document.risk_items ?? [])
    .slice(0, 6)
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.risk || '风险')}</strong><span>${escapeHtml(item.level || 'medium')}</span><p>${escapeHtml(item.mitigation || '')}</p></li>`,
    )
    .join('')
  const actions = (document.next_actions ?? [])
    .slice(0, 6)
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.task || '任务')}</strong><span>${escapeHtml(item.deadline || '下周')}</span><p>${escapeHtml(item.dependency || '')}</p></li>`,
    )
    .join('')
  const decisions = (document.decision_requests ?? []).slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join('')

  const sections = document.sections
    .map(
      (section) => `<section><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.description)}</p>${section.items
        .map((item) => `<p><strong>${escapeHtml(item.title)}：</strong>${escapeHtml(item.body)}</p>`)
        .join('')}</section>`,
    )
    .join('')

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(document.title)}</title>
  <style>
    body { margin: 0; font-family: "PingFang SC", "Microsoft YaHei", sans-serif; background: #f2f5fb; color: #1f2937; padding: 22px; }
    .page { max-width: 980px; margin: 0 auto; background: #fff; border-radius: 14px; border: 1px solid #dae3f1; padding: 22px; }
    h1 { margin: 0; }
    .meta { color: #64748b; font-size: 13px; margin-top: 8px; }
    .summary { margin-top: 14px; background: #f8fbff; border-left: 4px solid #2563eb; padding: 10px 12px; border-radius: 8px; }
    .grid { margin-top: 14px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
    .metric-card { padding: 10px; border: 1px solid #d8e3f3; border-radius: 10px; background: #fbfdff; display: grid; gap: 4px; }
    .metric-card span { color: #64748b; font-size: 12px; }
    .metric-card strong { font-size: 18px; color: #0f2f63; }
    .metric-card em { color: #7d8ea5; font-size: 12px; font-style: normal; }
    .split { margin-top: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .card { border: 1px solid #d8e3f3; border-radius: 10px; padding: 12px; background: #fbfdff; }
    .card h3 { margin: 0 0 8px; font-size: 16px; color: #193f79; }
    .card ul { margin: 0; padding-left: 18px; }
    .card li { margin-bottom: 8px; }
    .card li span { margin-left: 8px; color: #607086; font-size: 12px; }
    .card li p { margin: 4px 0 0; color: #425368; font-size: 13px; line-height: 1.5; }
    section { margin-top: 16px; }
    @media (max-width: 900px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .split { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <article class="page">
    <h1>${escapeHtml(document.title)}</h1>
    <div class="meta">模式：本地回退 · 部门：${escapeHtml(departmentProfile.name)} · 受众：${escapeHtml(audienceProfile.name)}</div>
    <div class="summary">${escapeHtml(document.summary)}</div>
    <div class="grid">${metrics || '<div class="metric-card"><span>关键指标</span><strong>待补充</strong><em>暂无结构化指标</em></div>'}</div>
    <div class="split">
      <div class="card">
        <h3>重点进展</h3>
        <ul>${progress || '<li>待补充</li>'}</ul>
      </div>
      <div class="card">
        <h3>风险与应对</h3>
        <ul>${risks || '<li>待补充</li>'}</ul>
      </div>
      <div class="card">
        <h3>下周计划</h3>
        <ul>${actions || '<li>待补充</li>'}</ul>
      </div>
      <div class="card">
        <h3>决策请求</h3>
        <ul>${decisions || '<li>待补充</li>'}</ul>
      </div>
    </div>
    <section>
      <h2>关键要点</h2>
      <ul>${keyPoints || '<li>待补充</li>'}</ul>
    </section>
    ${sections}
  </article>
</body>
</html>`
}

function evaluateHtmlQuality(html) {
  const plainText = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const textLength = plainText.length
  const headingCount = (html.match(/<h[1-4]\b/gi) || []).length
  const sectionLikeCount = (html.match(/<(section|article|table|ul|ol|div)\b/gi) || []).length
  const keywordList = ['摘要', '关键指标', '进展', '风险', '计划', '决策']
  const keywordHit = keywordList.filter((item) => plainText.includes(item)).length

  const ok = textLength >= 480 && headingCount >= 3 && sectionLikeCount >= 8 && keywordHit >= 3
  const reason = `文本长度=${textLength}, 标题数=${headingCount}, 结构块=${sectionLikeCount}, 关键模块命中=${keywordHit}`

  return { ok, reason, textLength, headingCount, sectionLikeCount, keywordHit }
}

function escapeHtml(value) {
  const safeValue = value == null ? '' : String(value)
  if (!safeValue) {
    return ''
  }

  return safeValue
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function toCleanString(value) {
  if (typeof value !== 'string') {
    return ''
  }
  return value
    .replace(/```+/g, ' ')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function stripNoise(value) {
  return value.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
}

function chooseMaxTokens(rawText, mode) {
  if (mode === 'llm-html') {
    if (rawText.length <= 2000) {
      return 3000
    }
    if (rawText.length <= 6000) {
      return 4200
    }
    return 5600
  }

  if (rawText.length <= 2000) {
    return 2200
  }
  if (rawText.length <= 6000) {
    return 3200
  }
  if (rawText.length <= 12000) {
    return 3800
  }
  return 4600
}
