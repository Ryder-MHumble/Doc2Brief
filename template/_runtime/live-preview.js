(() => {
  const current = document.currentScript;
  const templateId = current?.dataset.templateId || document.body.dataset.templateId || 'template-01';
  const styleHref = current?.dataset.styleHref || './style.css';
  const scriptSrc = current?.dataset.scriptSrc || './app.js';
  const inlineStyle = document.getElementById('template-inline-style');
  const dataNode = document.getElementById('template-data');
  const scriptNode = document.getElementById('template-script');

  const baseMeta = {
    title: '教科人管理中心周报 · 示例版',
    subtitle: '中关村两院教科人管理中心 · 2026年4月第1周',
    summary: '本周围绕科研组织、招生协同、国际合作与人才机制建设四条主线推进工作，形成阶段性成果，并同步明确了下周的资源配置与风险应对动作。',
    generatedAt: '2026-04-01 10:00',
    sensitiveMode: false,
    departmentFocus: '综合管理',
    audienceFocus: '主任办公会',
  };

  const payloadBase = ({
    id,
    name,
    accent,
    chip,
    moduleBlueprint,
    keyPoints = [],
    decisions = [],
    resources = [],
    meta = {},
  }) => ({
    templateId: id,
    templateName: name,
    theme: { accent, chip },
    moduleBlueprint,
    meta: { ...baseMeta, ...meta },
    keyPoints,
    decisions,
    resources,
    viewModel: {},
  });

  const narrativePayload = ({ id, name, accent, chip, moduleBlueprint, keyPoints, meta, highlights, stories, actions }) => ({
    ...payloadBase({ id, name, accent, chip, moduleBlueprint, keyPoints, meta }),
    viewModel: {
      narrative: {
        highlights,
        stories,
        actions,
      },
    },
  });

  const dashboardPayload = ({ id, name, accent, chip, moduleBlueprint, keyPoints, meta, kpis, progress, risks, actions }) => ({
    ...payloadBase({ id, name, accent, chip, moduleBlueprint, keyPoints, meta }),
    viewModel: {
      dashboard: {
        kpis,
        progress,
        risks,
        actions,
      },
    },
  });

  const briefPayload = ({ id, name, accent, chip, moduleBlueprint, keyPoints, meta, highlights, sectionAbstracts }) => ({
    ...payloadBase({ id, name, accent, chip, moduleBlueprint, keyPoints, meta }),
    viewModel: {
      brief: {
        highlights,
        sectionAbstracts,
      },
    },
  });

  const strategyPayload = ({ id, name, accent, chip, moduleBlueprint, keyPoints, decisions, resources, meta, kpis, progress, risks }) => ({
    ...payloadBase({ id, name, accent, chip, moduleBlueprint, keyPoints, decisions, resources, meta }),
    viewModel: {
      strategy: {
        kpis,
        progress,
        risks,
        decisions,
        resources,
      },
    },
  });

  const riskPayload = ({ id, name, accent, chip, moduleBlueprint, keyPoints, meta, risks, actions }) => ({
    ...payloadBase({ id, name, accent, chip, moduleBlueprint, keyPoints, meta }),
    viewModel: {
      risk: {
        risks,
        actions,
        keyPoints,
      },
    },
  });

  const pipelinePayload = ({ id, name, accent, chip, moduleBlueprint, keyPoints, meta, metrics, stages, actions }) => ({
    ...payloadBase({ id, name, accent, chip, moduleBlueprint, keyPoints, meta }),
    viewModel: {
      pipeline: {
        metrics,
        stages,
        actions,
      },
    },
  });

  const payloadCatalog = {
    'template-01': narrativePayload({
      id: 'template-01',
      name: '叙事型周报可视化',
      accent: '#0f766e',
      chip: 'TEMPLATE/01',
      moduleBlueprint: ['摘要总览', '关键指标', '重点章节叙事', '下周动作'],
      keyPoints: ['重点项目整体进展平稳，跨部门协同效率较上周提升。', '论坛与成果转化两条主线均形成明确的后续动作。'],
      highlights: [
        { label: '本周重点事项', value: '12', detail: '覆盖科研、合作、人才与综合事务' },
        { label: '关键会议节点', value: '5', detail: '含论坛筹备、评审会与协同复盘' },
        { label: '跨部门联动项', value: '8', detail: '已明确牵头人与完成时点' },
      ],
      stories: [
        { title: '重点课题进入中期评审准备', body: '科研管理组完成材料汇总与专家对接，评审节点较计划提前两天锁定。', tag: '科研组织' },
        { title: '国际论坛筹备进入邀约执行', body: '嘉宾名单与议程版本已初步确定，品牌传播节奏同步拉起。', tag: '国际合作' },
        { title: '青年教师培养计划形成首轮匹配', body: '完成导师与培养对象匹配，进入个性化辅导安排阶段。', tag: '人才发展' },
      ],
      actions: [
        { task: '完成论坛邀约函发出', deadline: '4月5日', owner: '国际合作组', dependency: '嘉宾名单确认' },
        { task: '锁定中期评审专家时间', deadline: '4月6日', owner: '科研管理组', dependency: '评审日程协调' },
      ],
    }),
    'template-02': dashboardPayload({
      id: 'template-02',
      name: '控制台信息密度',
      accent: '#4f46e5',
      chip: 'TEMPLATE/02',
      moduleBlueprint: ['执行总览', '指标面板', '模块状态卡片', '任务分派'],
      keyPoints: ['预算与采购协同效率是当前主瓶颈。', '本周新增两项跨部门接口联调任务。'],
      kpis: [
        { name: '任务完成率', value: '78%', trend: '较上周 +6%' },
        { name: '关键依赖项', value: '4', trend: '其中 1 项高优先级' },
        { name: '异常闭环率', value: '85%', note: '中高风险均已指定责任人' },
        { name: '待执行动作', value: '6', trend: '需在下周前完成' },
      ],
      progress: [
        { stream: '项目推进', status: '进行中', outcome: '完成里程碑拆解，进入责任分发阶段', owner: '项目办' },
        { stream: '资源协调', status: '待确认', outcome: '重点资源清单已提交，等待统一排期', owner: '综合保障组' },
      ],
      risks: [
        { risk: '采购审批链偏长', level: 'high', mitigation: '申请并行审批，缩短设备到位周期', owner: '采购组' },
        { risk: '接口联调反馈较慢', level: 'medium', mitigation: '建立每日同步机制', owner: '技术组' },
      ],
      actions: [
        { task: '完成设备采购排期确认', deadline: '4月4日', owner: '采购组', dependency: '供应商报价' },
        { task: '补齐联调问题清单', deadline: '4月3日', owner: '技术组', dependency: '对方接口反馈' },
      ],
    }),
    'template-03': briefPayload({
      id: 'template-03',
      name: '简洁正式白底版',
      accent: '#1d4ed8',
      chip: 'TEMPLATE/03',
      moduleBlueprint: ['摘要', '关键亮点', '章节要点', '归档信息'],
      keyPoints: ['当前整体推进节奏稳健，建议继续保持周度复盘。', '跨部门协作已初步形成闭环，但仍需压缩审批时长。'],
      highlights: [
        { label: '重点事项完成率', value: '82%', detail: '本周完成 9 项，延期 2 项' },
        { label: '组织动作数量', value: '7', detail: '含制度优化、论坛筹备与项目复盘' },
      ],
      sectionAbstracts: [
        { title: '科研组织', description: '完成重点课题材料整合，并锁定下一轮专家评审窗口。' },
        { title: '综合协调', description: '建立跨部门问题清单，明确责任人与反馈时点。' },
        { title: '人才发展', description: '青年教师培养计划完成首轮辅导匹配。' },
      ],
    }),
    'template-04': strategyPayload({
      id: 'template-04',
      name: '领导决策总览',
      accent: '#2563eb',
      chip: 'TEMPLATE/04',
      moduleBlueprint: ['战略摘要', '关键指标', '进展与风险', '决策请求', '资源诉求'],
      keyPoints: ['本周重点事项已完成节奏重排。', '风险主要集中在跨部门资源占用。'],
      decisions: ['确认第二阶段资源优先级', '确认论坛品牌合作边界'],
      resources: ['增加专项协调人手 1 名', '开通跨部门看板访问权限'],
      kpis: [
        { name: '战略事项完成率', value: '82%', trend: '较上周 +6%' },
        { name: '重点项目准时率', value: '91%', trend: '关键节点整体可控' },
      ],
      progress: [
        { stream: '重点项目 A', status: '推进中', outcome: '完成里程碑评审并进入执行阶段', owner: '项目办' },
      ],
      risks: [
        { risk: '跨部门资源排期冲突', level: 'high', mitigation: '已提交协调清单，待统一排期', owner: '综合协调组' },
      ],
    }),
    'template-05': riskPayload({
      id: 'template-05',
      name: '风险与闭环追踪',
      accent: '#b91c1c',
      chip: 'TEMPLATE/05',
      moduleBlueprint: ['风险清单', '风险等级', '闭环动作', '责任人', '关键观察'],
      keyPoints: ['高风险事项需在 48 小时内形成书面反馈。', '中风险事项保持周度追踪。'],
      risks: [
        { risk: '供应商节点延后', level: 'high', mitigation: '已要求补交恢复计划', owner: '采购组' },
        { risk: '材料归档滞后', level: 'medium', mitigation: '建立周度核查台账', owner: '办公室' },
      ],
      actions: [
        { task: '完成供应商复盘会', dependency: '供应商恢复计划', deadline: '4月3日', owner: '采购组' },
      ],
    }),
    'template-06': pipelinePayload({
      id: 'template-06',
      name: '课题与成果管线',
      accent: '#0f766e',
      chip: 'TEMPLATE/06',
      moduleBlueprint: ['科研摘要', '管线指标', '项目分阶段进展', '下一步关键动作'],
      keyPoints: ['本周新增 3 项进入评审窗口。', '合作单位数据回收仍是主要影响因素。'],
      metrics: [
        { name: '在研项目', value: '18 项', trend: '其中 3 项本周进入评审' },
        { name: '成果产出', value: '6 项', note: '含论文、专利与报告' },
      ],
      stages: [
        { stream: '重点课题一', status: '推进中', outcome: '完成中期材料整合并启动专家预审', owner: '科研秘书' },
        { stream: '重点课题二', status: '计划中', outcome: '等待合作单位提交补充数据', owner: '项目负责人' },
      ],
      actions: [
        { task: '完成专家预审排期', dependency: '评审名单确认', deadline: '4月6日', owner: '科研秘书' },
      ],
    }),
    'template-07': strategyPayload({
      id: 'template-07',
      name: '任务推进与责任看板',
      accent: '#1d4ed8',
      chip: 'TEMPLATE/07',
      moduleBlueprint: ['执行摘要', '任务进展', '阻塞与依赖', '下周排期'],
      keyPoints: ['关键任务已进入责任链执行。'],
      decisions: ['确认里程碑延期预案'],
      resources: ['申请测试窗口与排期支持'],
      kpis: [
        { name: '任务完成率', value: '76%', trend: '较上周 +8%' },
      ],
      progress: [
        { stream: '事项 A', status: '推进中', outcome: '完成跨部门协调并进入执行阶段', owner: '项目办' },
      ],
      risks: [
        { risk: '接口联调依赖外部反馈', level: 'medium', mitigation: '已提交对接清单', owner: '技术组' },
      ],
    }),
    'template-08': dashboardPayload({
      id: 'template-08',
      name: '预算与资源配置看板',
      accent: '#4f46e5',
      chip: 'TEMPLATE/08',
      moduleBlueprint: ['预算执行摘要', '投入产出指标', '资源诉求', '风险与建议'],
      keyPoints: ['当前预算执行节奏偏慢，需要加快审批。', '设备类支出是主要瓶颈。'],
      kpis: [
        { name: '预算执行率', value: '68%', trend: '本周新增支出审批 2 项' },
      ],
      progress: [
        { stream: '场地资源配置', status: '进行中', outcome: '完成重点项目场地腾挪', owner: '综合保障' },
      ],
      risks: [
        { risk: '采购流程较慢影响设备到位', level: 'high', mitigation: '增加并行审批链路', owner: '采购组' },
      ],
      actions: [
        { task: '完成设备采购排期确认', deadline: '4月4日', owner: '采购组', dependency: '供应商报价' },
      ],
    }),
    'template-09': narrativePayload({
      id: 'template-09',
      name: '国际合作进展简报',
      accent: '#0f766e',
      chip: 'TEMPLATE/09',
      moduleBlueprint: ['合作摘要', '外联指标', '重点合作进展', '窗口期风险', '下周行动'],
      keyPoints: ['论坛窗口期集中在 4 月上旬。', '签约项目需同步法务审核。'],
      highlights: [
        { label: '合作项目', value: '12 项', detail: '其中 3 项进入签约阶段' },
      ],
      stories: [
        { title: '海外院校合作推进', body: '完成第二轮沟通并确认联合活动框架。', tag: '合作项目' },
        { title: '国际论坛筹备', body: '嘉宾名单初步锁定，进入邀约阶段。', tag: '品牌活动' },
      ],
      actions: [
        { task: '发送论坛邀约函', deadline: '4月5日', owner: '国际合作组', dependency: '名单确认' },
      ],
    }),
    'template-10': briefPayload({
      id: 'template-10',
      name: '人才与组织发展简报',
      accent: '#1d4ed8',
      chip: 'TEMPLATE/10',
      moduleBlueprint: ['人才摘要', '关键指标', '组织动作', '风险与支持请求'],
      keyPoints: ['培训资源需继续向新入职教师倾斜。', '考核机制优化方案待征求意见。'],
      highlights: [
        { label: '培训覆盖率', value: '84%', detail: '较上周提升 6 个百分点' },
        { label: '引才进度', value: '5 人', detail: '其中 2 人进入终面阶段' },
      ],
      sectionAbstracts: [
        { title: '青年教师培养', description: '完成第一轮辅导计划匹配并启动跟进。' },
        { title: '组织机制优化', description: '考核与反馈流程完成初版方案审阅。' },
      ],
    }),
  };

  if (inlineStyle?.textContent.includes('__TEMPLATE_STYLE__')) {
    inlineStyle.remove();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = styleHref;
    document.head.appendChild(link);
  }

  if (dataNode?.textContent.includes('__TEMPLATE_DATA__')) {
    dataNode.textContent = JSON.stringify(payloadCatalog[templateId] || payloadCatalog['template-01']);
  }

  if (scriptNode?.textContent.includes('__TEMPLATE_SCRIPT__')) {
    const runtimeScript = document.createElement('script');
    runtimeScript.src = scriptSrc;
    document.body.appendChild(runtimeScript);
  }
})();
