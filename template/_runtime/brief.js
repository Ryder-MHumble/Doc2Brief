(() => {
  const MODULE_NAME = 'template-brief-runtime';
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
    const vm = (payload.viewModel && payload.viewModel.brief) || {};

    const highlights = Array.isArray(vm.highlights) ? vm.highlights.slice(0, 6) : [];
    const sectionAbstracts = Array.isArray(vm.sectionAbstracts) ? vm.sectionAbstracts.slice(0, 10) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 10) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page brief-page">
        <header class="brief-header">
          <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
          <p class="subtitle">${escapeHtml(meta.subtitle || '')}</p>
          <p class="meta">生成时间：${escapeHtml(meta.generatedAt || '')} · 模板：${escapeHtml(payload.templateName || payload.templateId || '')}</p>
        </header>

        <section class="panel summary-panel">
          <h2>摘要</h2>
          <p>${escapeHtml(meta.summary || '暂无摘要')}</p>
        </section>

        <section class="brief-columns">
          <article class="panel">
            <h2>关键亮点</h2>
            ${toList(highlights, (item) => `<div class="brief-item"><b>${escapeHtml(item.label || '指标')}</b><span>${escapeHtml(item.value || '--')}</span><p>${escapeHtml(item.detail || '')}</p></div>`, '<div class="brief-item"><b>暂无</b><span>--</span><p>未抽取到亮点</p></div>')}
          </article>

          <article class="panel">
            <h2>章节摘要</h2>
            ${toList(sectionAbstracts, (item) => `<div class="brief-item"><b>${escapeHtml(item.title || '章节')}</b><p>${escapeHtml(item.description || '')}</p></div>`, '<div class="brief-item"><b>暂无章节</b><p>请补充原文信息</p></div>')}
          </article>
        </section>

        <section class="panel">
          <h2>要点清单</h2>
          <ul class="bullet-list">${toList(keyPoints, (item) => `<li>${escapeHtml(item)}</li>`, '<li>暂无要点</li>')}</ul>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      highlights: highlights.length,
      sectionAbstracts: sectionAbstracts.length,
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
