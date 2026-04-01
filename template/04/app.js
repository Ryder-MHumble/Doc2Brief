(() => {
  const MODULE_NAME = 'template-strategy-runtime';
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

  const focusTokens = (meta, moduleBlueprint) =>
    [
      meta.departmentFocus ? `部门焦点：${meta.departmentFocus}` : '',
      meta.audienceFocus ? `汇报对象：${meta.audienceFocus}` : '',
      ...(Array.isArray(moduleBlueprint) ? moduleBlueprint.slice(0, 3).map((item) => `模块：${item}`) : []),
    ].filter(Boolean);

  try {
    const start = performance.now();
    logSystem('info', '模板启动');

    const payload = readPayload();
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.strategy) || {};

    const kpis = Array.isArray(vm.kpis) ? vm.kpis.slice(0, 4) : [];
    const progress = Array.isArray(vm.progress) ? vm.progress.slice(0, 6) : [];
    const risks = Array.isArray(vm.risks) ? vm.risks.slice(0, 5) : [];
    const decisions = Array.isArray(vm.decisions) ? vm.decisions.slice(0, 4) : [];
    const resources = Array.isArray(vm.resources) ? vm.resources.slice(0, 4) : [];
    const tokens = focusTokens(meta, payload.moduleBlueprint);

    const riskSummary = risks.reduce(
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
      <main class="tpl-page strategy-deck">
        <header class="hero-board">
          <section class="hero-copy">
            <div class="eyebrow">
              <span class="template-chip">${escapeHtml(payload.templateName || '战略总览版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '领导决策输入面板')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
            <div class="context-row">
              ${toList(
                tokens,
                (item) => `<span class="context-pill">${escapeHtml(item)}</span>`,
                '<span class="context-pill">待补充汇报上下文</span>',
              )}
            </div>
          </section>

          <aside class="signal-rail">
            <article class="signal-card">
              <span class="signal-label">决策节奏</span>
              <strong>${escapeHtml(decisions.length || 0)} 项待拍板</strong>
              <p>${escapeHtml(decisions[0] || '当前无待决事项，可继续按既定路径推进。')}</p>
            </article>
            <article class="signal-card warm">
              <span class="signal-label">风险态势</span>
              <strong>${escapeHtml(riskSummary.high)} 高 / ${escapeHtml(riskSummary.medium)} 中 / ${escapeHtml(riskSummary.low)} 低</strong>
              <p>${escapeHtml(resources.length || 0)} 项资源诉求待协调，建议按风险等级安排反馈顺序。</p>
            </article>
          </aside>
        </header>

        <section class="kpi-ribbon">
          ${toList(
            kpis,
            (item) => `
              <article class="metric-card">
                <span class="metric-label">${escapeHtml(item.name || '关键指标')}</span>
                <strong>${escapeHtml(item.value || '--')}</strong>
                <p>${escapeHtml(item.trend || item.note || '持续跟踪中')}</p>
              </article>
            `,
            `
              <article class="metric-card">
                <span class="metric-label">关键指标</span>
                <strong>待补充</strong>
                <p>当前未提取到可展示的指标。</p>
              </article>
            `,
          )}
        </section>

        <section class="board-grid">
          <article class="panel panel-progress">
            <div class="panel-head">
              <h2>关键进展</h2>
              <span>${escapeHtml(progress.length || 0)} 个推进节点</span>
            </div>
            <div class="timeline-list">
              ${toList(
                progress,
                (item, index) => `
                  <article class="timeline-item">
                    <div class="timeline-index">${String(index + 1).padStart(2, '0')}</div>
                    <div class="timeline-body">
                      <div class="timeline-top">
                        <h3>${escapeHtml(item.stream || '推进事项')}</h3>
                        <span class="status-chip">${escapeHtml(item.status || '进行中')}</span>
                      </div>
                      <p>${escapeHtml(item.outcome || '暂无补充说明')}</p>
                      <small>责任人：${escapeHtml(item.owner || '待明确')}</small>
                    </div>
                  </article>
                `,
                `
                  <article class="timeline-item">
                    <div class="timeline-index">01</div>
                    <div class="timeline-body">
                      <div class="timeline-top">
                        <h3>暂无推进事项</h3>
                        <span class="status-chip">待补充</span>
                      </div>
                      <p>请补充进展条目后再生成领导总览页面。</p>
                      <small>责任人：待明确</small>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel panel-risk">
            <div class="panel-head">
              <h2>风险雷达</h2>
              <span>优先关注高位事项</span>
            </div>
            <div class="risk-stack">
              ${toList(
                risks,
                (item) => `
                  <article class="risk-card ${levelClass(item.level)}">
                    <div class="risk-top">
                      <h3>${escapeHtml(item.risk || '风险事项')}</h3>
                      <span class="risk-level">${escapeHtml(item.level || 'medium')}</span>
                    </div>
                    <p>${escapeHtml(item.mitigation || '暂无应对方案')}</p>
                    <small>责任人：${escapeHtml(item.owner || '待明确')}</small>
                  </article>
                `,
                `
                  <article class="risk-card low">
                    <div class="risk-top">
                      <h3>暂无显式风险</h3>
                      <span class="risk-level">low</span>
                    </div>
                    <p>当前可保持周度复盘与例行监测。</p>
                    <small>责任人：待明确</small>
                  </article>
                `,
              )}
            </div>
          </article>
        </section>

        <section class="request-grid">
          <article class="panel request-panel">
            <div class="panel-head">
              <h2>决策请求</h2>
              <span>建议本周内明确</span>
            </div>
            <div class="request-list">
              ${toList(
                decisions,
                (item, index) => `
                  <article class="request-card">
                    <span class="request-index">D${String(index + 1).padStart(2, '0')}</span>
                    <p>${escapeHtml(item)}</p>
                  </article>
                `,
                `
                  <article class="request-card">
                    <span class="request-index">D00</span>
                    <p>当前暂无待拍板事项，可按既有方案推进。</p>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel request-panel resource-panel">
            <div class="panel-head">
              <h2>资源诉求</h2>
              <span>用于协调排期与支持</span>
            </div>
            <div class="request-list">
              ${toList(
                resources,
                (item, index) => `
                  <article class="request-card">
                    <span class="request-index">R${String(index + 1).padStart(2, '0')}</span>
                    <p>${escapeHtml(item)}</p>
                  </article>
                `,
                `
                  <article class="request-card">
                    <span class="request-index">R00</span>
                    <p>暂无新增资源诉求，维持现有配置即可。</p>
                  </article>
                `,
              )}
            </div>
          </article>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      riskSummary,
      kpis: kpis.length,
      progress: progress.length,
      risks: risks.length,
      decisions: decisions.length,
      resources: resources.length,
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
