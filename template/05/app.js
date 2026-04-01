(() => {
  const MODULE_NAME = 'template-risk-runtime';
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

  const levelLabel = (level) => {
    const key = levelClass(level);
    if (key === 'high') return '高风险';
    if (key === 'low') return '低风险';
    return '中风险';
  };

  try {
    const start = performance.now();
    logSystem('info', '模板启动');

    const payload = readPayload();
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.risk) || {};

    const risks = Array.isArray(vm.risks) ? vm.risks.slice(0, 8) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 6) : [];
    const keyPoints = Array.isArray(vm.keyPoints) ? vm.keyPoints.slice(0, 6) : [];

    const severity = risks.reduce(
      (result, item) => {
        const key = levelClass(item.level);
        result[key] += 1;
        return result;
      },
      { high: 0, medium: 0, low: 0 },
    );

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page risk-ledger">
        <header class="hero-band">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="template-chip">${escapeHtml(payload.templateName || '风控合规版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '风险优先、责任闭环、状态可追踪')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
          </section>

          <section class="severity-grid">
            <article class="severity-card high">
              <span>高风险</span>
              <strong>${escapeHtml(severity.high)}</strong>
              <p>建议优先升级处理并给出明确责任人与时点。</p>
            </article>
            <article class="severity-card medium">
              <span>中风险</span>
              <strong>${escapeHtml(severity.medium)}</strong>
              <p>保持周度追踪，避免演化为跨部门阻塞。</p>
            </article>
            <article class="severity-card low">
              <span>低风险</span>
              <strong>${escapeHtml(severity.low)}</strong>
              <p>进入观察名单，按周复盘即可。</p>
            </article>
          </section>
        </header>

        <section class="content-grid">
          <article class="panel register-panel">
            <div class="panel-head">
              <h2>风险台账</h2>
              <span>${escapeHtml(risks.length || 0)} 条风险记录</span>
            </div>
            <div class="risk-register">
              ${toList(
                risks,
                (item, index) => `
                  <article class="risk-entry ${levelClass(item.level)}">
                    <div class="risk-entry-top">
                      <span class="risk-index">R${String(index + 1).padStart(2, '0')}</span>
                      <span class="risk-tag">${escapeHtml(levelLabel(item.level))}</span>
                    </div>
                    <h3>${escapeHtml(item.risk || '风险事项')}</h3>
                    <p>${escapeHtml(item.mitigation || '暂无应对方案')}</p>
                    <div class="risk-meta-row">
                      <span>责任人：${escapeHtml(item.owner || '待明确')}</span>
                      <span>状态：${escapeHtml(item.level || 'medium')}</span>
                    </div>
                  </article>
                `,
                `
                  <article class="risk-entry low">
                    <div class="risk-entry-top">
                      <span class="risk-index">R00</span>
                      <span class="risk-tag">低风险</span>
                    </div>
                    <h3>暂无显式风险</h3>
                    <p>当前可继续保持例行监控与周度抽查。</p>
                    <div class="risk-meta-row">
                      <span>责任人：待明确</span>
                      <span>状态：low</span>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <aside class="side-column">
            <section class="panel action-panel">
              <div class="panel-head">
                <h2>闭环动作</h2>
                <span>按节点推进整改</span>
              </div>
              <div class="action-stack">
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
                        <h3>暂无闭环动作</h3>
                        <p>请补充整改计划与责任安排。</p>
                        <div class="action-meta">
                          <span>待定</span>
                          <span>待明确</span>
                        </div>
                      </div>
                    </article>
                  `,
                )}
              </div>
            </section>

            <section class="panel watch-panel">
              <div class="panel-head">
                <h2>关键观察</h2>
                <span>用于周会提示</span>
              </div>
              <ul class="watch-list">
                ${toList(
                  keyPoints,
                  (item) => `<li>${escapeHtml(item)}</li>`,
                  '<li>暂无关键观察</li>',
                )}
              </ul>
            </section>
          </aside>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      severity,
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
