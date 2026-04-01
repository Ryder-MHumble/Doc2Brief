(() => {
  const MODULE_NAME = 'template-dashboard-runtime';
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
    const vm = (payload.viewModel && payload.viewModel.dashboard) || {};

    const kpis = Array.isArray(vm.kpis) ? vm.kpis.slice(0, 8) : [];
    const progress = Array.isArray(vm.progress) ? vm.progress.slice(0, 8) : [];
    const risks = Array.isArray(vm.risks) ? vm.risks.slice(0, 8) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 8) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 6) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page dashboard-page">
        <header class="hero">
          <div class="hero-head">
            <span class="chip">${escapeHtml(payload.templateName || '运营看板')}</span>
            <span class="meta">${escapeHtml(meta.generatedAt || '')}</span>
          </div>
          <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
          <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
        </header>

        <section class="kpi-grid">
          ${toList(kpis, (item) => `<article class="kpi-card"><h3>${escapeHtml(item.name || '指标')}</h3><strong>${escapeHtml(item.value || '--')}</strong><p>${escapeHtml(item.trend || item.note || '')}</p></article>`, '<article class="kpi-card"><h3>提示</h3><strong>暂无</strong><p>未提取到指标</p></article>')}
        </section>

        <section class="quad-grid">
          <article class="panel">
            <h2>进展状态</h2>
            ${toList(progress, (item) => `<div class="row"><div><b>${escapeHtml(item.stream || '事项')}</b><p>${escapeHtml(item.outcome || '')}</p></div><span class="status">${escapeHtml(item.status || '进行中')}</span></div>`, '<div class="row"><div><b>暂无进展数据</b></div><span class="status">待补充</span></div>')}
          </article>

          <article class="panel">
            <h2>风险看板</h2>
            ${toList(risks, (item) => `<div class="row risk-${escapeHtml(String(item.level || '').toLowerCase())}"><div><b>${escapeHtml(item.risk || '风险事项')}</b><p>${escapeHtml(item.mitigation || '')}</p></div><span class="status">${escapeHtml(item.level || 'medium')}</span></div>`, '<div class="row"><div><b>暂无风险</b></div><span class="status">low</span></div>')}
          </article>

          <article class="panel">
            <h2>下周动作</h2>
            ${toList(actions, (item) => `<div class="row"><div><b>${escapeHtml(item.task || '待补充')}</b><p>负责人：${escapeHtml(item.owner || '待明确')}</p></div><span class="status">${escapeHtml(item.deadline || '待定')}</span></div>`, '<div class="row"><div><b>暂无动作</b></div><span class="status">待定</span></div>')}
          </article>

          <article class="panel">
            <h2>关键要点</h2>
            <ul class="bullet-list">
              ${toList(keyPoints, (item) => `<li>${escapeHtml(item)}</li>`, '<li>暂无关键要点</li>')}
            </ul>
          </article>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      kpis: kpis.length,
      progress: progress.length,
      risks: risks.length,
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
