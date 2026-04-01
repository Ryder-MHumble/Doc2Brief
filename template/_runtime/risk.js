(() => {
  const MODULE_NAME = 'template-risk-runtime';
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

  const levelClass = (level) => {
    const text = String(level || '').toLowerCase();
    if (text.includes('高') || text.includes('high')) return 'high';
    if (text.includes('低') || text.includes('low')) return 'low';
    return 'medium';
  };

  try {
    const start = performance.now();
    const payload = JSON.parse(document.getElementById('template-data')?.textContent || '{}');
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.risk) || {};

    const risks = Array.isArray(vm.risks) ? vm.risks.slice(0, 12) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 10) : [];
    const keyPoints = Array.isArray(vm.keyPoints) ? vm.keyPoints.slice(0, 8) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page risk-page">
        <header class="hero">
          <div class="hero-top"><span class="chip">${escapeHtml(payload.templateName || '风控模板')}</span><span class="meta">${escapeHtml(meta.generatedAt || '')}</span></div>
          <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
          <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
        </header>

        <section class="two-col">
          <article class="panel">
            <h2>风险清单</h2>
            ${toList(risks, (item) => `<div class="risk-item ${levelClass(item.level)}"><b>${escapeHtml(item.risk || '风险事项')}</b><p>${escapeHtml(item.mitigation || '')}</p><span>${escapeHtml(item.level || 'medium')} · ${escapeHtml(item.owner || '待明确')}</span></div>`, '<div class="risk-item low"><b>暂无显式风险</b><p>继续保持监控</p><span>low · 待明确</span></div>')}
          </article>

          <article class="panel">
            <h2>闭环动作</h2>
            ${toList(actions, (item) => `<div class="action-row"><b>${escapeHtml(item.task || '待补充')}</b><p>依赖：${escapeHtml(item.dependency || '无')}</p><span>${escapeHtml(item.deadline || '待定')} · ${escapeHtml(item.owner || '待明确')}</span></div>`, '<div class="action-row"><b>暂无闭环动作</b><p>请补充整改计划</p><span>待定 · 待明确</span></div>')}
          </article>
        </section>

        <article class="panel">
          <h2>关键观察</h2>
          <ul class="bullet-list">${toList(keyPoints, (item) => `<li>${escapeHtml(item)}</li>`, '<li>暂无关键观察</li>')}</ul>
        </article>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      risks: risks.length,
      actions: actions.length,
      keyPoints: keyPoints.length,
    });
    logSystem('info', '模板完成', { elapsedMs: Number((performance.now() - start).toFixed(2)), status: 'ok' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知异常';
    root.innerHTML = `<main class="tpl-page"><section class="panel"><h2>模板渲染失败</h2><p>${escapeHtml(message)}</p></section></main>`;
    logBusinessJson('render_error', { message });
    logSystem('error', '模板异常', { message });
  }
})();
