(() => {
  const MODULE_NAME = 'template-narrative-runtime';
  const root = document.getElementById('template-root');

  const logBusinessJson = (stage, payload) => {
    console.info(
      '[业务JSON]',
      JSON.stringify(
        {
          module: MODULE_NAME,
          stage,
          timestamp: new Date().toISOString(),
          payload,
        },
        null,
        2,
      ),
    );
  };

  const logSystem = (level, event, payload = {}) => {
    const logger = level === 'error' ? console.error : console.info;
    logger(
      '[系统日志]',
      JSON.stringify(
        {
          module: MODULE_NAME,
          level,
          event,
          timestamp: new Date().toISOString(),
          payload,
        },
        null,
        2,
      ),
    );
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

  const readPayload = () => {
    const node = document.getElementById('template-data');
    if (!node) {
      throw new Error('缺少 template-data 节点');
    }
    return JSON.parse(node.textContent || '{}');
  };

  try {
    const start = performance.now();
    logSystem('info', '模板启动');

    const payload = readPayload();
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.narrative) || {};
    const highlights = Array.isArray(vm.highlights) ? vm.highlights.slice(0, 6) : [];
    const stories = Array.isArray(vm.stories) ? vm.stories.slice(0, 8) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 8) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 8) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page narrative-page">
        <header class="hero">
          <div class="hero-top">
            <span class="chip">${escapeHtml(payload.templateName || payload.templateId || '叙事模板')}</span>
            <span class="meta">${escapeHtml(meta.generatedAt || '')}</span>
          </div>
          <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
          <p class="subtitle">${escapeHtml(meta.subtitle || '')}</p>
          <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
        </header>

        <section class="kpi-grid">
          ${toList(
            highlights,
            (item) => `<article class="kpi-card"><div class="label">${escapeHtml(item.label || '指标')}</div><div class="value">${escapeHtml(item.value || '--')}</div><div class="detail">${escapeHtml(item.detail || '')}</div></article>`,
            '<article class="kpi-card"><div class="label">提示</div><div class="value">暂无</div><div class="detail">未提取到高亮指标</div></article>',
          )}
        </section>

        <section class="content-grid">
          <article class="panel">
            <h2>重点叙事</h2>
            <div class="story-list">
              ${toList(
                stories,
                (item) => `<section class="story-item"><div class="tag">${escapeHtml(item.tag || '事项')}</div><h3>${escapeHtml(item.title || '')}</h3><p>${escapeHtml(item.body || '')}</p></section>`,
                '<section class="story-item"><div class="tag">提示</div><h3>暂无叙事内容</h3><p>请补充原始文本后重试。</p></section>',
              )}
            </div>
          </article>

          <article class="panel">
            <h2>关键要点</h2>
            <ul class="bullet-list">
              ${toList(
                keyPoints,
                (item) => `<li>${escapeHtml(item)}</li>`,
                '<li>暂无关键要点</li>',
              )}
            </ul>
          </article>
        </section>

        <article class="panel">
          <h2>下周动作</h2>
          <div class="action-table">
            ${toList(
              actions,
              (item) => `<div class="action-row"><div><strong>${escapeHtml(item.task || '待补充')}</strong><p>依赖：${escapeHtml(item.dependency || '无')}</p></div><div class="meta-col"><span>${escapeHtml(item.deadline || '待定')}</span><span>${escapeHtml(item.owner || '待明确')}</span></div></div>`,
              '<div class="action-row"><div><strong>暂无动作</strong><p>请补充下周计划</p></div><div class="meta-col"><span>待定</span><span>待明确</span></div></div>',
            )}
          </div>
        </article>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      highlights: highlights.length,
      stories: stories.length,
      actions: actions.length,
      keyPoints: keyPoints.length,
    });

    logSystem('info', '模板完成', {
      elapsedMs: Number((performance.now() - start).toFixed(2)),
      status: 'ok',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知异常';
    root.innerHTML = `<main class="tpl-page"><section class="panel"><h2>模板渲染失败</h2><p>${escapeHtml(message)}</p></section></main>`;
    logBusinessJson('render_error', { message });
    logSystem('error', '模板异常', { message });
  }
})();
