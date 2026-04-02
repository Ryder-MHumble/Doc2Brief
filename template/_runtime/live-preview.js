(() => {
  const current = document.currentScript
  const templateId = current?.dataset.templateId || document.body.dataset.templateId || 'template-01'
  const styleHref = current?.dataset.styleHref || './style.css'
  const scriptSrc = current?.dataset.scriptSrc || './app.js'
  const styleNode = document.getElementById('template-inline-style')
  const dataNode = document.getElementById('template-data')

  const serializePayload = (payload) =>
    JSON.stringify(payload)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/<\/script/gi, '<\\\\/script')

  const workItem = (title, body, status, progress, tone) => ({
    title,
    body,
    status,
    progress,
    tone,
  })

  const stats = [
    { label: '重大科研成果', value: '5', unit: '项', detail: '完成四轮评审', target: 5 },
    { label: '国家基金申报', value: '34', unit: '项', detail: '完成集中申报', target: 34 },
    { label: '国际青年论坛', value: '19', unit: '名', detail: '覆盖 9 个国家和地区', target: 19 },
    { label: '深澜计划报名', value: '470', unit: '人', detail: '来自 108 所高校', target: 470 },
    { label: '夏令营报名', value: '700', unit: '+', detail: '研招系统已开放', target: 700 },
  ]

  const overview = [
    { number: '01', tag: '科研组织', title: '两院重大科研成果评选完成', body: '经过 4 轮评审，形成 5 项重点成果推荐名单，并进入论坛发布与转化对接阶段。', tone: 'red' },
    { number: '02', tag: '科研申报', title: '国家自然科学基金集中申报收口', body: '完成 34 项项目申报材料汇总与提交流程，组织工作按时闭环。', tone: 'jade' },
    { number: '03', tag: '国际交流', title: '第四届中关村国际青年论坛召开', body: '论坛吸引 19 名青年学者到场交流，形成多项后续合作议题。', tone: 'indigo' },
    { number: '04', tag: '学术研讨', title: '清华-两院 AI+数学研讨会举办', body: '围绕交叉研究方向展开深度讨论，现场参会师生超过 80 人。', tone: 'gold' },
    { number: '05', tag: '少年学院', title: '少年学院展示项目取得阶段成果', body: '学生项目在公开展示活动中获得关注，体现培养机制成效。', tone: 'copper' },
  ]

  const groups = {
    internal: [
      workItem('第一季度推进会', '完成 51 个项目评审并明确后续资源配置。', '已完成', 100, 'done'),
      workItem('重大项目首轮讨论', '三学部完成首轮汇报，进入意见收敛阶段。', '进行中', 60, 'progress'),
      workItem('深澜访学计划启动', '完成报名收口与首轮遴选，录取结果同步发布。', '已完成', 100, 'done'),
      workItem('2026 年夏令营启动', '校园大使与导师招募完成，报名持续增长。', '进行中', 45, 'progress'),
      workItem('博士生补充答辩', '完成 4 场答辩组织，形成结果汇总。', '已完成', 100, 'done'),
      workItem('清北导师池计划', '明确联合培育与自由探索两类合作模式。', '进行中', 50, 'progress'),
    ],
    cooperation: [
      workItem('中央民族大学战略合作协议', '协议经院务会审理通过，进入执行准备。', '已完成', 80, 'done'),
      workItem('清华大学求真书院合作', '围绕联合培养与教师合作立项持续推进。', '推进中', 55, 'progress'),
      workItem('北邮定向招生班共建', '已完成首轮意向对接，进入方案整理。', '推进中', 50, 'progress'),
      workItem('北航共建协议', '核心条款仍待协商，会签节点后移。', '待推进', 40, 'warning'),
      workItem('北京大学工学院合作探索', '课程创新与技术转化合作同步沟通。', '推进中', 35, 'progress'),
      workItem('香港城市大学战略合作', '受规则限制暂缓推进，保留后续补充协议空间。', '待推进', 25, 'warning'),
    ],
    visit: [
      workItem('中关村国际青年论坛', '论坛环节顺利完成，形成后续对接清单。', '已完成', 100, 'done'),
      workItem('香港科技大学合作交流', '围绕联培与课程合作形成下一轮研讨计划。', '推进中', 45, 'progress'),
      workItem('首都体育学院访问', '双方围绕科研合作与活动联动交换意见。', '已完成', 70, 'done'),
      workItem('怀柔实验室虚拟实验班', '仍处于机制论证阶段。', '探讨中', 20, 'warning'),
      workItem('少年学院对外交流', '围绕项目展示与活动联动形成正向反馈。', '已完成', 100, 'done'),
    ],
    system: [
      workItem('国际事务联动平台', '推动论坛资源共享与外部引流机制建设。', '进行中', 40, 'progress'),
      workItem('国际 AI 科学家联盟', '完成主管沟通与阶段性汇报。', '推进中', 30, 'progress'),
      workItem('课程建设与质量保证', '课程评价分析完成，督导机制持续落地。', '进行中', 60, 'progress'),
      workItem('博士研究生实习管理办法', '正式印发并进入执行阶段。', '已完成', 100, 'done'),
      workItem('招生智能体系统建设', '进入建设期，功能边界与数据接口已锁定。', '建设中', 15, 'warning'),
      workItem('学者知识图谱第三轮迭代', '完成五维画像与重点学者筛选。', '迭代完成', 75, 'done'),
    ],
  }

  const keyMetrics = [
    { label: '重大科研成果', value: '5', unit: '项', sub: '论坛发布窗口已锁定' },
    { label: '国家基金申报', value: '34', unit: '项', sub: '含参与项目 5 项' },
    { label: '深澜计划报名', value: '470', unit: '人', sub: '来自 108 所高校' },
    { label: '夏令营报名', value: '700', unit: '+', sub: '系统已开放' },
    { label: '海外学者筛选', value: '58', unit: '名', sub: '知识图谱第三轮迭代' },
    { label: '课程督导专家', value: '12', unit: '位', sub: '分阶段听课' },
  ]

  const footer = {
    issuedBy: '中关村两院教科人管理中心',
    recipient: '中关村两院领导班子成员',
    distribution: '教科人管理中心各部门',
    editor: '（待填写）',
    reviewer: '（待填写）',
    date: '2026年04月02日',
    dateOnly: '2026-04-02',
    timestamp: '2026-04-02T10:00:00+08:00',
  }

  const payloadCatalog = {
    'template-01': {
      templateId: 'template-01',
      templateName: '极简周报版式',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '本周围绕科研组织、招生协同、国际合作与制度建设持续推进，形成阶段性进展并明确下周动作。',
      },
      viewModel: {
        minimal: {
          hero: {
            eyebrow: '中关村两院教科人管理中心 · 内部周报',
            title: '教科人管理中心周报 · 示例版',
            summary: '本周围绕科研组织、招生协同、国际合作与制度建设持续推进，形成阶段性进展并明确下周动作。',
            period: '中关村两院教科人管理中心 · 2026年4月第1周',
            unit: footer.issuedBy,
            issuedAt: footer.date,
            bgNumber: '01',
          },
          stats,
          overview,
          groups,
          data: {
            keyMetrics,
            cooperation: groups.cooperation.slice(0, 5),
            system: groups.system.slice(0, 5),
          },
          footer,
        },
      },
    },
    'template-02': {
      templateId: 'template-02',
      templateName: '杂志封面周报',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '本期围绕重点成果发布、申报收口、国际交流和制度建设四条主线展开。',
      },
      viewModel: {
        magazine: {
          cover: {
            issueLabel: 'Vol.01 · 2026 · 第01期',
            headline: '五项重大科研成果即将在论坛窗口集中发布',
            decks: [
              '经过多轮评审，本周完成重点成果推荐名单收口，发布与转化对接工作同步启动。',
              '与此同时，国际交流、招生协同与制度建设持续推进，多条工作线进入执行窗口。',
            ],
            period: '2026年3月27日—4月2日',
            unit: footer.issuedBy,
          },
          stats: stats.slice(0, 4),
          toc: ['本周要览', '重点工作', '数据看板', '签发信息'],
          overview,
          groups,
          data: {
            keyMetrics: keyMetrics.slice(0, 5),
            defense: { total: 17, pass: 11, fail: 5, revised: 1, exam: 1 },
            cooperation: groups.cooperation.slice(0, 6),
          },
          footer,
        },
      },
    },
    'template-03': {
      templateId: 'template-03',
      templateName: '国风卷轴周报',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '通过章回式结构呈现本周科研、合作、交流与制度建设进展。',
      },
      viewModel: {
        ink: {
          cover: {
            enTitle: 'Zhongguancun Academy · Weekly Report · Issue No.1',
            title: '教科人管理中心周报',
            subTitle: '第一期 · 二〇二六年春',
            period: '2026年3月27日 — 4月2日',
            issuedAt: footer.date,
            unit: footer.issuedBy,
            stats,
          },
          overview,
          groups,
          data: {
            keyMetrics,
            cooperation: groups.cooperation.slice(0, 6),
            system: groups.system.slice(0, 6),
            defense: { total: 17, pass: 11, fail: 5, revised: 1, exam: 1 },
          },
          footer,
        },
      },
    },
    'template-04': {
      templateId: 'template-04',
      templateName: '控制台仪表盘周报',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '当前进入执行追踪阶段，重点观察跨部门协同效率和外部合作推进度。',
      },
      viewModel: {
        dashboardPlus: {
          hero: {
            title: '教科人管理中心周报',
            subtitle: '中关村两院教科人管理中心 · 第01期 · 内部资料',
            issuedAt: '2026.04.02 ISSUED',
            period: '2026.03.27 — 04.02',
          },
          stats,
          overview,
          groups,
          data: {
            cooperation: groups.cooperation.slice(0, 6),
            defense: { total: 17, pass: 11, fail: 5, revised: 1, exam: 1 },
            keyMetrics,
          },
          summaryCounts: { done: 8, progress: 11, pending: 3 },
          footer,
        },
      },
    },
    'template-05': {
      templateId: 'template-05',
      templateName: '新闻简报周报',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '本周重点成果进入公开发布窗口，国际论坛和对外合作同步推进。',
      },
      viewModel: {
        news: {
          masthead: {
            brand: footer.issuedBy,
            date: '2026·04·02',
            issueLabel: '第 01 期',
          },
          ticker: keyMetrics.slice(0, 6).map((item) => ({ label: item.label, value: item.value, unit: item.unit })),
          hero: {
            eyebrow: '本周要览',
            headline: '五项重大科研成果进入发布窗口',
            deck: '重点成果、申报收口、国际交流和制度建设四条工作线同步推进，整体节奏稳定。',
            stats: stats.slice(0, 4),
          },
          groups,
          data: {
            keyMetrics,
            defense: { total: 17, pass: 11, fail: 5, revised: 1 },
            cooperation: groups.cooperation.slice(0, 6),
            international: groups.visit.slice(0, 4),
          },
          footer,
        },
      },
    },
    'template-06': {
      templateId: 'template-06',
      templateName: '学术期刊周报',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '本周周报按期刊结构编排，突出摘要、要览、合作推进与签发信息。',
      },
      viewModel: {
        journal: {
          header: {
            title: '教科人管理中心周报 · 示例版',
            subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
            issueLabel: '第 01 期',
            issuedAt: footer.date,
            period: '2026年3月27日—4月2日',
            tags: ['内部协同', '对外合作', '交流互访', '体系建设'],
          },
          abstract: '本周围绕科研组织、合作推进与制度优化三条主线开展工作，形成阶段性成果并保留后续推进接口。',
          stats,
          overview,
          groups,
          data: {
            defense: { total: 17, pass: 11, fail: 5, revised: 1 },
            cooperation: groups.cooperation.slice(0, 6),
            system: groups.system.slice(0, 6),
          },
          footer,
        },
      },
    },
    'template-07': {
      templateId: 'template-07',
      templateName: '赛博控制台周报',
      meta: {
        title: '教科人管理中心周报 · 示例版',
        subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
        summary: '系统视角呈现重点成果发布、合作推进与数据分布。',
      },
      viewModel: {
        cyber: {
          hero: {
            line: 'SYS_INIT: LOADING_REPORT_MODULE_2026.04.02 ... [OK]',
            subtitle: '中关村两院教科人管理中心 · 第01期',
            desc: 'REPORT_PERIOD: 2026.03.27 — 2026.04.02 | ISSUED: 2026.04.02 | UNIT: 中关村两院教科人管理中心',
          },
          stats,
          overview,
          groups,
          data: {
            keyMetrics,
            defense: { total: 17, pass: 11, fail: 5, revised: 1 },
            system: groups.system.slice(0, 5),
            cooperation: groups.cooperation.slice(0, 6),
          },
          footer,
        },
      },
    },
  }

  if (styleNode) {
    styleNode.textContent = ''
  }

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = styleHref
  document.head.appendChild(link)

  if (dataNode) {
    dataNode.textContent = serializePayload(payloadCatalog[templateId] || payloadCatalog['template-01'])
  }

  const runtimeScript = document.createElement('script')
  runtimeScript.src = scriptSrc
  document.body.appendChild(runtimeScript)
})()
