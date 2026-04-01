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

    const highlights = Array.isArray(vm.highlights) ? vm.highlights.slice(0, 4) : [];
    const stories = Array.isArray(vm.stories) ? vm.stories.slice(0, 7) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 4) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 6) : [];

    const leadStories = stories.slice(0, 3);
    const trailStories = stories.slice(3);

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page international-journal">
        <header class="hero-salon">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="passport-chip">${escapeHtml(payload.templateName || '国际合作版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '合作项目、外联窗口与品牌节点的刊物式呈现')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
          </section>

          <aside class="hero-aside">
            <div class="aside-title">合作窗口</div>
            ${toList(
              highlights,
              (item) => `
                <article class="hero-signal">
                  <span>${escapeHtml(item.label || '关键指标')}</span>
                  <strong>${escapeHtml(item.value || '--')}</strong>
                  <p>${escapeHtml(item.detail || '暂无补充说明')}</p>
                </article>
              `,
              `
                <article class="hero-signal">
                  <span>关键指标</span>
                  <strong>待补充</strong>
                  <p>上传合作材料后可展示国际合作窗口数据。</p>
                </article>
              `,
            )}
          </aside>
        </header>

        <section class="story-layout">
          <article class="feature-panel">
            <div class="panel-head">
              <h2>重点合作进展</h2>
              <span>本周主叙事</span>
            </div>
            <div class="feature-list">
              ${toList(
                leadStories,
                (item, index) => `
                  <article class="feature-story ${index === 0 ? 'lead' : ''}">
                    <div class="story-tag">${escapeHtml(item.tag || '合作事项')}</div>
                    <h3>${escapeHtml(item.title || '合作进展')}</h3>
                    <p>${escapeHtml(item.body || '暂无补充内容')}</p>
                  </article>
                `,
                `
                  <article class="feature-story lead">
                    <div class="story-tag">提示</div>
                    <h3>暂无重点合作进展</h3>
                    <p>请补充合作项目与活动节点后再生成刊物版页面。</p>
                  </article>
                `,
              )}
            </div>
          </article>

          <aside class="side-column">
            <section class="panel side-panel">
              <div class="panel-head">
                <h2>窗口提醒</h2>
                <span>适合在会上直接引用</span>
              </div>
              <ul class="window-list">
                ${toList(
                  keyPoints,
                  (item) => `<li>${escapeHtml(item)}</li>`,
                  '<li>暂无窗口提醒</li>',
                )}
              </ul>
            </section>

            <section class="panel side-panel">
              <div class="panel-head">
                <h2>下周外联动作</h2>
                <span>按窗口期推进</span>
              </div>
              <div class="action-list">
                ${toList(
                  actions,
                  (item, index) => `
                    <article class="action-card">
                      <span class="action-index">A${String(index + 1).padStart(2, '0')}</span>
                      <div class="action-body">
                        <h3>${escapeHtml(item.task || '待补充动作')}</h3>
                        <p>${escapeHtml(item.dependency || '无外部依赖')}</p>
                        <small>${escapeHtml(item.deadline || '待定')} · ${escapeHtml(item.owner || '待明确')}</small>
                      </div>
                    </article>
                  `,
                  `
                    <article class="action-card">
                      <span class="action-index">A00</span>
                      <div class="action-body">
                        <h3>暂无外联动作</h3>
                        <p>当前暂无新增跟进事项。</p>
                        <small>待定 · 待明确</small>
                      </div>
                    </article>
                  `,
                )}
              </div>
            </section>
          </aside>
        </section>

        <section class="trail-grid">
          ${toList(
            trailStories,
            (item) => `
              <article class="trail-story">
                <div class="story-tag">${escapeHtml(item.tag || '合作事项')}</div>
                <h3>${escapeHtml(item.title || '合作动态')}</h3>
                <p>${escapeHtml(item.body || '暂无补充内容')}</p>
              </article>
            `,
            `
              <article class="trail-story">
                <div class="story-tag">补充</div>
                <h3>暂无更多合作动态</h3>
                <p>当前重点内容已在上方展示。</p>
              </article>
            `,
          )}
        </section>
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
