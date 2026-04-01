(() => {
  const MODULE_NAME = 'template-dashboard-runtime';
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

  const levelClass = (level) => {
    const text = String(level || '').toLowerCase();
    if (text.includes('高') || text.includes('high')) return 'high';
    if (text.includes('低') || text.includes('low')) return 'low';
    return 'medium';
  };

  try {
    const start = performance.now();
    logSystem('info', '模板启动');

    const payload = readPayload();
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.dashboard) || {};

    const kpis = Array.isArray(vm.kpis) ? vm.kpis.slice(0, 4) : [];
    const progress = Array.isArray(vm.progress) ? vm.progress.slice(0, 6) : [];
    const risks = Array.isArray(vm.risks) ? vm.risks.slice(0, 5) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 5) : [];
    const keyPoints = Array.isArray(payload.keyPoints) ? payload.keyPoints.slice(0, 6) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page operations-console">
        <header class="console-hero">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="chip">${escapeHtml(payload.templateName || '运营看板')}</span>
              <span class="meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '执行状态、依赖关系与动作排布的控制台视图')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
          </section>

          <section class="status-board">
            <article class="status-card">
              <span>推进项</span>
              <strong>${escapeHtml(progress.length || 0)}</strong>
              <p>当前正在跟踪的执行节点。</p>
            </article>
            <article class="status-card warn">
              <span>风险项</span>
              <strong>${escapeHtml(risks.length || 0)}</strong>
              <p>优先清理影响主链路的障碍。</p>
            </article>
            <article class="status-card">
              <span>动作项</span>
              <strong>${escapeHtml(actions.length || 0)}</strong>
              <p>本周需落地的具体动作。</p>
            </article>
          </section>
        </header>

        <section class="metric-grid">
          ${toList(
            kpis,
            (item) => `
              <article class="metric-card">
                <span class="metric-label">${escapeHtml(item.name || '指标')}</span>
                <strong>${escapeHtml(item.value || '--')}</strong>
                <p>${escapeHtml(item.trend || item.note || '持续跟踪中')}</p>
              </article>
            `,
            `
              <article class="metric-card">
                <span class="metric-label">指标</span>
                <strong>待补充</strong>
                <p>当前暂无可展示指标。</p>
              </article>
            `,
          )}
        </section>

        <section class="console-grid">
          <article class="panel panel-wide">
            <div class="panel-head">
              <h2>进展状态</h2>
              <span>当前执行面</span>
            </div>
            <div class="row-list">
              ${toList(
                progress,
                (item) => `
                  <article class="row-card">
                    <div class="row-main">
                      <h3>${escapeHtml(item.stream || '事项')}</h3>
                      <p>${escapeHtml(item.outcome || '暂无说明')}</p>
                    </div>
                    <div class="row-meta">
                      <span class="status-pill">${escapeHtml(item.status || '进行中')}</span>
                      <small>${escapeHtml(item.owner || '待明确')}</small>
                    </div>
                  </article>
                `,
                `
                  <article class="row-card">
                    <div class="row-main">
                      <h3>暂无进展数据</h3>
                      <p>请补充原始材料。</p>
                    </div>
                    <div class="row-meta">
                      <span class="status-pill">待补充</span>
                      <small>待明确</small>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <h2>风险看板</h2>
              <span>按优先级分类</span>
            </div>
            <div class="stack-list">
              ${toList(
                risks,
                (item) => `
                  <article class="risk-card ${levelClass(item.level)}">
                    <h3>${escapeHtml(item.risk || '风险事项')}</h3>
                    <p>${escapeHtml(item.mitigation || '暂无应对方案')}</p>
                    <small>${escapeHtml(item.level || 'medium')} · ${escapeHtml(item.owner || '待明确')}</small>
                  </article>
                `,
                `
                  <article class="risk-card low">
                    <h3>暂无风险</h3>
                    <p>当前可继续按计划推进。</p>
                    <small>low · 待明确</small>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <h2>动作队列</h2>
              <span>本周需落地</span>
            </div>
            <div class="stack-list">
              ${toList(
                actions,
                (item, index) => `
                  <article class="task-card">
                    <span class="task-index">${String(index + 1).padStart(2, '0')}</span>
                    <div class="task-body">
                      <strong>${escapeHtml(item.task || '待补充')}</strong>
                      <p>${escapeHtml(item.dependency || '无外部依赖')}</p>
                      <small>${escapeHtml(item.deadline || '待定')} · ${escapeHtml(item.owner || '待明确')}</small>
                    </div>
                  </article>
                `,
                `
                  <article class="task-card">
                    <span class="task-index">00</span>
                    <div class="task-body">
                      <strong>暂无动作</strong>
                      <p>请补充下周计划。</p>
                      <small>待定 · 待明确</small>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel">
            <div class="panel-head">
              <h2>关键要点</h2>
              <span>管理层摘要</span>
            </div>
            <ol class="feed-list">
              ${toList(
                keyPoints,
                (item) => `<li>${escapeHtml(item)}</li>`,
                '<li>暂无关键要点</li>',
              )}
            </ol>
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
