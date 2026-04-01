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
      <main class="tpl-page budget-ledger">
        <header class="hero-ledger">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="template-chip">${escapeHtml(payload.templateName || '预算资源版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '预算执行、资源投放与风险敞口联动呈现')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
          </section>

          <section class="hero-balance">
            <article class="balance-card">
              <span>配置动作</span>
              <strong>${escapeHtml(actions.length || 0)}</strong>
              <p>本周需要安排的资源调整与行动项。</p>
            </article>
            <article class="balance-card warm">
              <span>风险敞口</span>
              <strong>${escapeHtml(risks.length || 0)}</strong>
              <p>关注投入产出偏差与关键瓶颈。</p>
            </article>
          </section>
        </header>

        <section class="kpi-board">
          ${toList(
            kpis,
            (item) => `
              <article class="kpi-card">
                <span class="kpi-label">${escapeHtml(item.name || '预算指标')}</span>
                <strong>${escapeHtml(item.value || '--')}</strong>
                <p>${escapeHtml(item.trend || item.note || '持续跟踪中')}</p>
              </article>
            `,
            `
              <article class="kpi-card">
                <span class="kpi-label">预算指标</span>
                <strong>待补充</strong>
                <p>当前未提取到投入产出指标。</p>
              </article>
            `,
          )}
        </section>

        <section class="ledger-grid">
          <article class="panel table-panel">
            <div class="panel-head">
              <h2>资源投放进展</h2>
              <span>用于复盘投入节奏</span>
            </div>
            <div class="table-list">
              ${toList(
                progress,
                (item) => `
                  <article class="table-row">
                    <div class="row-main">
                      <h3>${escapeHtml(item.stream || '资源事项')}</h3>
                      <p>${escapeHtml(item.outcome || '暂无结果说明')}</p>
                    </div>
                    <div class="row-side">
                      <span class="row-status">${escapeHtml(item.status || '进行中')}</span>
                      <small>${escapeHtml(item.owner || '待明确')}</small>
                    </div>
                  </article>
                `,
                `
                  <article class="table-row">
                    <div class="row-main">
                      <h3>暂无资源进展</h3>
                      <p>请补充预算执行或资源调配记录。</p>
                    </div>
                    <div class="row-side">
                      <span class="row-status">待补充</span>
                      <small>待明确</small>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel risk-panel">
            <div class="panel-head">
              <h2>风险敞口</h2>
              <span>优先识别偏差来源</span>
            </div>
            <div class="table-list">
              ${toList(
                risks,
                (item) => `
                  <article class="table-row risk-row ${levelClass(item.level)}">
                    <div class="row-main">
                      <h3>${escapeHtml(item.risk || '风险事项')}</h3>
                      <p>${escapeHtml(item.mitigation || '暂无应对措施')}</p>
                    </div>
                    <div class="row-side">
                      <span class="row-status">${escapeHtml(item.level || 'medium')}</span>
                      <small>${escapeHtml(item.owner || '待明确')}</small>
                    </div>
                  </article>
                `,
                `
                  <article class="table-row risk-row low">
                    <div class="row-main">
                      <h3>暂无显式风险</h3>
                      <p>当前资源配置总体可控。</p>
                    </div>
                    <div class="row-side">
                      <span class="row-status">low</span>
                      <small>待明确</small>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>
        </section>

        <section class="ledger-grid secondary">
          <article class="panel action-panel">
            <div class="panel-head">
              <h2>配置动作</h2>
              <span>下周需要落地的事项</span>
            </div>
            <div class="action-list">
              ${toList(
                actions,
                (item, index) => `
                  <article class="action-card">
                    <span class="action-index">${String(index + 1).padStart(2, '0')}</span>
                    <div class="action-body">
                      <h3>${escapeHtml(item.task || '待补充动作')}</h3>
                      <p>${escapeHtml(item.dependency || '无外部依赖')}</p>
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
                      <h3>暂无配置动作</h3>
                      <p>当前暂无新增资源动作安排。</p>
                      <div class="action-meta">
                        <span>待定</span>
                        <span>待明确</span>
                      </div>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel insight-panel">
            <div class="panel-head">
              <h2>管理观察</h2>
              <span>给管理层的简短判断</span>
            </div>
            <ul class="insight-list">
              ${toList(
                keyPoints,
                (item) => `<li>${escapeHtml(item)}</li>`,
                '<li>暂无关键观察</li>',
              )}
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
