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
    const stories = Array.isArray(vm.stories) ? vm.stories.slice(0, 6) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 5) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 6) : [];
    const contextPills = [meta.departmentFocus ? `部门焦点：${meta.departmentFocus}` : '', meta.audienceFocus ? `汇报对象：${meta.audienceFocus}` : ''].filter(Boolean);

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page narrative-atlas">
        <header class="hero">
          <div class="hero-shell">
            <section class="hero-copy">
              <div class="hero-top">
                <span class="chip">${escapeHtml(payload.templateName || payload.templateId || '叙事模板')}</span>
                <span class="meta">${escapeHtml(meta.generatedAt || '')}</span>
              </div>
              <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
              <p class="subtitle">${escapeHtml(meta.subtitle || '阶段主线、成果节点与后续动作的叙事呈现')}</p>
              <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
              <div class="context-row">
                ${toList(contextPills, (item) => `<span class="context-pill">${escapeHtml(item)}</span>`, '<span class="context-pill">综合汇报视角</span>')}
              </div>
            </section>

            <aside class="signal-panel">
              <div class="signal-title">本周抓手</div>
              <div class="signal-list">
                ${toList(
                  keyPoints.slice(0, 3),
                  (item, index) => `
                    <article class="signal-card">
                      <span class="signal-index">0${index + 1}</span>
                      <p>${escapeHtml(item)}</p>
                    </article>
                  `,
                  `
                    <article class="signal-card">
                      <span class="signal-index">01</span>
                      <p>暂无关键要点，请补充原始材料。</p>
                    </article>
                  `,
                )}
              </div>
            </aside>
          </div>

          <section class="kpi-grid">
            ${toList(
              highlights,
              (item, index) => `
                <article class="kpi-card tone-${index % 4}">
                  <div class="label">${escapeHtml(item.label || '指标')}</div>
                  <div class="value">${escapeHtml(item.value || '--')}</div>
                  <div class="detail">${escapeHtml(item.detail || '暂无补充说明')}</div>
                </article>
              `,
              `
                <article class="kpi-card tone-0">
                  <div class="label">提示</div>
                  <div class="value">暂无</div>
                  <div class="detail">未提取到高亮指标</div>
                </article>
              `,
            )}
          </section>
        </header>

        <section class="narrative-grid">
          <article class="panel story-panel">
            <div class="panel-head">
              <h2>重点叙事</h2>
              <span>${escapeHtml(stories.length || 0)} 个重点节点</span>
            </div>
            <div class="story-stack">
              ${toList(
                stories,
                (item, index) => `
                  <article class="story-card ${index === 0 ? 'lead' : ''}">
                    <div class="story-tag">${escapeHtml(item.tag || '事项')}</div>
                    <h3>${escapeHtml(item.title || '')}</h3>
                    <p>${escapeHtml(item.body || '')}</p>
                  </article>
                `,
                `
                  <article class="story-card lead">
                    <div class="story-tag">提示</div>
                    <h3>暂无叙事内容</h3>
                    <p>请补充原始文本后重试。</p>
                  </article>
                `,
              )}
            </div>
          </article>

          <aside class="panel action-panel">
            <div class="panel-head">
              <h2>下周动作</h2>
              <span>按时点推进</span>
            </div>
            <div class="action-list">
              ${toList(
                actions,
                (item, index) => `
                  <article class="action-card">
                    <span class="action-index">${String(index + 1).padStart(2, '0')}</span>
                    <div class="action-body">
                      <strong>${escapeHtml(item.task || '待补充')}</strong>
                      <p>依赖：${escapeHtml(item.dependency || '无')}</p>
                      <div class="action-meta">
                        <span>${escapeHtml(item.deadline || '待定')}</span>
                        <span>${escapeHtml(item.owner || '待明确')}</span>
                      </div>
                    </div>
                  </article>
                `,
                `
                  <article class="action-card">
                    <span class="action-index">00</span>
                    <div class="action-body">
                      <strong>暂无动作</strong>
                      <p>请补充下周计划。</p>
                      <div class="action-meta">
                        <span>待定</span>
                        <span>待明确</span>
                      </div>
                    </div>
                  </article>
                `,
              )}
            </div>

            <div class="mini-panel">
              <h3>延展要点</h3>
              <ul class="bullet-list">
                ${toList(
                  keyPoints.slice(3),
                  (item) => `<li>${escapeHtml(item)}</li>`,
                  '<li>暂无更多要点</li>',
                )}
              </ul>
            </div>
          </aside>
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
