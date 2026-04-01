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

  try {
    const start = performance.now();
    logSystem('info', '模板启动');

    const payload = readPayload();
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.strategy) || {};

    const kpis = Array.isArray(vm.kpis) ? vm.kpis.slice(0, 4) : [];
    const progress = Array.isArray(vm.progress) ? vm.progress.slice(0, 6) : [];
    const risks = Array.isArray(vm.risks) ? vm.risks.slice(0, 4) : [];
    const decisions = Array.isArray(vm.decisions) ? vm.decisions.slice(0, 4) : [];
    const resources = Array.isArray(vm.resources) ? vm.resources.slice(0, 4) : [];

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page execution-board">
        <header class="hero-strip">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="template-chip">${escapeHtml(payload.templateName || '执行推进版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '任务推进、责任链与协同依赖集中调度')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
          </section>

          <section class="hero-counters">
            <article class="counter-card">
              <span>推进任务</span>
              <strong>${escapeHtml(progress.length || 0)}</strong>
              <p>按事项拆解执行节点与责任人。</p>
            </article>
            <article class="counter-card warm">
              <span>协同事项</span>
              <strong>${escapeHtml(decisions.length + resources.length)}</strong>
              <p>包含待决策事项与资源协同请求。</p>
            </article>
          </section>
        </header>

        <section class="metric-grid">
          ${toList(
            kpis,
            (item) => `
              <article class="metric-card">
                <span class="metric-label">${escapeHtml(item.name || '执行指标')}</span>
                <strong>${escapeHtml(item.value || '--')}</strong>
                <p>${escapeHtml(item.trend || item.note || '持续跟踪中')}</p>
              </article>
            `,
            `
              <article class="metric-card">
                <span class="metric-label">执行指标</span>
                <strong>待补充</strong>
                <p>当前未提取到执行指标。</p>
              </article>
            `,
          )}
        </section>

        <section class="ops-grid">
          <article class="panel lane-panel">
            <div class="panel-head">
              <h2>任务推进</h2>
              <span>按责任链组织</span>
            </div>
            <div class="lane-list">
              ${toList(
                progress,
                (item, index) => `
                  <article class="lane-card">
                    <div class="lane-head">
                      <span class="lane-index">${String(index + 1).padStart(2, '0')}</span>
                      <span class="lane-status">${escapeHtml(item.status || '进行中')}</span>
                    </div>
                    <h3>${escapeHtml(item.stream || '任务事项')}</h3>
                    <p>${escapeHtml(item.outcome || '暂无阶段说明')}</p>
                    <small>责任人：${escapeHtml(item.owner || '待明确')}</small>
                  </article>
                `,
                `
                  <article class="lane-card">
                    <div class="lane-head">
                      <span class="lane-index">00</span>
                      <span class="lane-status">待补充</span>
                    </div>
                    <h3>暂无任务推进</h3>
                    <p>请补充执行事项后再生成看板。</p>
                    <small>责任人：待明确</small>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel blocker-panel">
            <div class="panel-head">
              <h2>阻塞与依赖</h2>
              <span>优先清理影响主链路的障碍</span>
            </div>
            <div class="blocker-list">
              ${toList(
                risks,
                (item) => `
                  <article class="blocker-card ${levelClass(item.level)}">
                    <div class="blocker-top">
                      <h3>${escapeHtml(item.risk || '阻塞事项')}</h3>
                      <span class="blocker-level">${escapeHtml(item.level || 'medium')}</span>
                    </div>
                    <p>${escapeHtml(item.mitigation || '暂无应对措施')}</p>
                    <small>责任人：${escapeHtml(item.owner || '待明确')}</small>
                  </article>
                `,
                `
                  <article class="blocker-card low">
                    <div class="blocker-top">
                      <h3>暂无阻塞项</h3>
                      <span class="blocker-level">low</span>
                    </div>
                    <p>当前可按既定排期继续推进。</p>
                    <small>责任人：待明确</small>
                  </article>
                `,
              )}
            </div>
          </article>
        </section>

        <section class="support-grid">
          <article class="panel support-panel">
            <div class="panel-head">
              <h2>待决策事项</h2>
              <span>需要拍板才能继续推进</span>
            </div>
            <div class="support-list">
              ${toList(
                decisions,
                (item, index) => `
                  <article class="support-card">
                    <span class="support-index">D${String(index + 1).padStart(2, '0')}</span>
                    <p>${escapeHtml(item)}</p>
                  </article>
                `,
                `
                  <article class="support-card">
                    <span class="support-index">D00</span>
                    <p>当前暂无待决策事项。</p>
                  </article>
                `,
              )}
            </div>
          </article>

          <article class="panel support-panel resource-panel">
            <div class="panel-head">
              <h2>协同资源</h2>
              <span>用于排期、支持与跨部门协调</span>
            </div>
            <div class="support-list">
              ${toList(
                resources,
                (item, index) => `
                  <article class="support-card">
                    <span class="support-index">R${String(index + 1).padStart(2, '0')}</span>
                    <p>${escapeHtml(item)}</p>
                  </article>
                `,
                `
                  <article class="support-card">
                    <span class="support-index">R00</span>
                    <p>当前暂无新增协同资源诉求。</p>
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
