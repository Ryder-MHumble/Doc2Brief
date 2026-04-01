(() => {
  const MODULE_NAME = 'template-brief-runtime';
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
    const vm = (payload.viewModel && payload.viewModel.brief) || {};

    const highlights = Array.isArray(vm.highlights) ? vm.highlights.slice(0, 6) : [];
    const sectionAbstracts = Array.isArray(vm.sectionAbstracts) ? vm.sectionAbstracts.slice(0, 6) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 8) : [];
    const focusCards = highlights.slice(0, 2);

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page talent-dossier">
        <header class="hero-dossier">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="template-chip">${escapeHtml(payload.templateName || '人才发展版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '围绕引才、培养、机制与组织能力建设的档案式简报')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
          </section>

          <aside class="hero-focus">
            ${toList(
              focusCards,
              (item) => `
                <article class="focus-card">
                  <span>${escapeHtml(item.label || '关键指标')}</span>
                  <strong>${escapeHtml(item.value || '--')}</strong>
                  <p>${escapeHtml(item.detail || '暂无补充说明')}</p>
                </article>
              `,
              `
                <article class="focus-card">
                  <span>关键指标</span>
                  <strong>待补充</strong>
                  <p>上传人才或组织材料后可生成对应简报。</p>
                </article>
              `,
            )}
          </aside>
        </header>

        <section class="highlight-board">
          ${toList(
            highlights,
            (item) => `
              <article class="highlight-card">
                <div class="highlight-top">
                  <span class="highlight-label">${escapeHtml(item.label || '亮点')}</span>
                  <strong>${escapeHtml(item.value || '--')}</strong>
                </div>
                <p>${escapeHtml(item.detail || '暂无补充说明')}</p>
              </article>
            `,
            `
              <article class="highlight-card">
                <div class="highlight-top">
                  <span class="highlight-label">亮点</span>
                  <strong>待补充</strong>
                </div>
                <p>当前未提取到关键亮点。</p>
              </article>
            `,
          )}
        </section>

        <section class="content-grid">
          <article class="panel initiative-panel">
            <div class="panel-head">
              <h2>组织动作</h2>
              <span>本周机制与能力建设进展</span>
            </div>
            <div class="initiative-grid">
              ${toList(
                sectionAbstracts,
                (item) => `
                  <article class="initiative-card">
                    <h3>${escapeHtml(item.title || '组织动作')}</h3>
                    <p>${escapeHtml(item.description || '暂无补充说明')}</p>
                  </article>
                `,
                `
                  <article class="initiative-card">
                    <h3>暂无组织动作</h3>
                    <p>请补充人才与组织发展相关内容。</p>
                  </article>
                `,
              )}
            </div>
          </article>

          <aside class="panel key-panel">
            <div class="panel-head">
              <h2>机制要点</h2>
              <span>适合领导快速浏览</span>
            </div>
            <ol class="key-list">
              ${toList(
                keyPoints,
                (item) => `<li>${escapeHtml(item)}</li>`,
                '<li>暂无机制要点</li>',
              )}
            </ol>
          </aside>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      highlights: highlights.length,
      sectionAbstracts: sectionAbstracts.length,
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
