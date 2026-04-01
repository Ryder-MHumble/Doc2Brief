(() => {
  const MODULE_NAME = 'template-pipeline-runtime';
  const root = document.getElementById('template-root');

  const logBusinessJson = (stage, payload) => {
    console.info('[业务JSON]', JSON.stringify({ module: MODULE_NAME, stage, timestamp: new Date().toISOString(), payload }, null, 2));
  };

  const logSystem = (level, event, payload = {}) => {
    const logger = level === 'error' ? console.error : console.info;
    logger('[系统日志]', JSON.stringify({ module: MODULE_NAME, level, event, timestamp: new Date().toISOString(), payload }, null, 2));
  };

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');

  const toList = (items, render, fallback) =>
    Array.isArray(items) && items.length > 0 ? items.map(render).join('') : fallback;

  try {
    const start = performance.now();
    const payload = JSON.parse(document.getElementById('template-data')?.textContent || '{}');
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.pipeline) || {};

    const metrics = Array.isArray(vm.metrics) ? vm.metrics.slice(0, 8) : [];
    const stages = Array.isArray(vm.stages) ? vm.stages.slice(0, 12) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 10) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page pipeline-page">
        <header class="hero">
          <div class="hero-top"><span class="chip">${escapeHtml(payload.templateName || '科研管线')}</span><span class="meta">${escapeHtml(meta.generatedAt || '')}</span></div>
          <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
          <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
        </header>

        <section class="kpi-grid">
          ${toList(metrics, (item) => `<article class="kpi-card"><h3>${escapeHtml(item.name || '指标')}</h3><strong>${escapeHtml(item.value || '--')}</strong><p>${escapeHtml(item.trend || item.note || '')}</p></article>`, '<article class="kpi-card"><h3>指标</h3><strong>待补充</strong><p>暂无数据</p></article>')}
        </section>

        <section class="panel">
          <h2>项目管线</h2>
          <div class="pipeline-list">
            ${toList(stages, (item) => `<div class="stage-row"><div class="stage-head"><b>${escapeHtml(item.stream || '事项')}</b><span>${escapeHtml(item.status || '进行中')}</span></div><p>${escapeHtml(item.outcome || '')}</p><small>负责人：${escapeHtml(item.owner || '待明确')}</small></div>`, '<div class="stage-row"><div class="stage-head"><b>暂无阶段信息</b><span>待补充</span></div><p>请补充项目进展</p></div>')}
          </div>
        </section>

        <section class="panel">
          <h2>下一步动作</h2>
          <ul class="bullet-list">${toList(actions, (item) => `<li>${escapeHtml(item.task || '待补充')}（截止：${escapeHtml(item.deadline || '待定')}，责任：${escapeHtml(item.owner || '待明确')}）</li>`, '<li>暂无动作计划</li>')}</ul>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      metrics: metrics.length,
      stages: stages.length,
      actions: actions.length,
    });
    logSystem('info', '模板完成', { elapsedMs: Number((performance.now() - start).toFixed(2)), status: 'ok' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知异常';
    root.innerHTML = `<main class="tpl-page"><section class="panel"><h2>模板渲染失败</h2><p>${escapeHtml(message)}</p></section></main>`;
    logBusinessJson('render_error', { message });
    logSystem('error', '模板异常', { message });
  }
})();
