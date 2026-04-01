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

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page brief-dossier">
        <header class="brief-header">
          <div class="masthead">
            <span class="doc-chip">${escapeHtml(payload.templateName || payload.templateId || '正式简报版')}</span>
            <span class="doc-meta">${escapeHtml(meta.generatedAt || '')}</span>
          </div>
          <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
          <p class="subtitle">${escapeHtml(meta.subtitle || '归档、上会与打印阅读场景适用')}</p>
        </header>

        <section class="panel summary-panel">
          <h2>摘要</h2>
          <p class="summary-text">${escapeHtml(meta.summary || '暂无摘要')}</p>
        </section>

        <section class="brief-grid">
          <article class="panel">
            <div class="panel-head">
              <h2>关键亮点</h2>
              <span>用于上会口头汇报</span>
            </div>
            <div class="highlight-list">
              ${toList(
                highlights,
                (item, index) => `
                  <article class="brief-item">
                    <span class="item-index">${String(index + 1).padStart(2, '0')}</span>
                    <div class="item-body">
                      <div class="item-top">
                        <strong>${escapeHtml(item.label || '指标')}</strong>
                        <span class="item-value">${escapeHtml(item.value || '--')}</span>
                      </div>
                      <p>${escapeHtml(item.detail || '暂无补充说明')}</p>
                    </div>
                  </article>
                `,
                `
                  <article class="brief-item">
                    <span class="item-index">00</span>
                    <div class="item-body">
                      <div class="item-top">
                        <strong>暂无亮点</strong>
                        <span class="item-value">--</span>
                      </div>
                      <p>未抽取到亮点信息。</p>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <h2>章节摘要</h2>
              <span>用于归档留痕</span>
            </div>
            <div class="abstract-list">
              ${toList(
                sectionAbstracts,
                (item) => `
                  <article class="abstract-card">
                    <h3>${escapeHtml(item.title || '章节')}</h3>
                    <p>${escapeHtml(item.description || '暂无补充说明')}</p>
                  </article>
                `,
                `
                  <article class="abstract-card">
                    <h3>暂无章节</h3>
                    <p>请补充原文信息。</p>
                  </article>
                `,
              )}
            </div>
          </article>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>归档要点</h2>
            <span>便于形成正式纪要</span>
          </div>
          <ol class="key-list">
            ${toList(
              keyPoints,
              (item) => `<li>${escapeHtml(item)}</li>`,
              '<li>暂无要点</li>',
            )}
          </ol>
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
