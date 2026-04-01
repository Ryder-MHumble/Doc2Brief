(() => {
  const MODULE_NAME = 'template-pipeline-runtime';
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

  const statusClass = (status) => {
    const text = String(status || '').toLowerCase();
    if (text.includes('已') || text.includes('完成') || text.includes('done')) return 'done';
    if (text.includes('阻塞') || text.includes('风险') || text.includes('blocked')) return 'blocked';
    if (text.includes('待') || text.includes('计划') || text.includes('pending') || text.includes('plan')) return 'planned';
    return 'active';
  };

  try {
    const start = performance.now();
    logSystem('info', '模板启动');

    const payload = readPayload();
    const meta = payload.meta || {};
    const vm = (payload.viewModel && payload.viewModel.pipeline) || {};

    const metrics = Array.isArray(vm.metrics) ? vm.metrics.slice(0, 6) : [];
    const stages = Array.isArray(vm.stages) ? vm.stages.slice(0, 8) : [];
    const actions = Array.isArray(vm.actions) ? vm.actions.slice(0, 6) : [];
    const heroStats = metrics.slice(0, 3);

    const stageSummary = stages.reduce(
      (result, item) => {
        const key = statusClass(item.status);
        result[key] += 1;
        return result;
      },
      { done: 0, active: 0, planned: 0, blocked: 0 },
    );

    if (payload.theme?.accent) {
      document.documentElement.style.setProperty('--accent', payload.theme.accent);
    }

    root.innerHTML = `
      <main class="tpl-page pipeline-lab">
        <header class="hero-shell">
          <section class="hero-copy">
            <div class="hero-top">
              <span class="template-chip">${escapeHtml(payload.templateName || '科研管线版')}</span>
              <span class="hero-meta">${escapeHtml(meta.generatedAt || '')}</span>
            </div>
            <h1>${escapeHtml(meta.title || '未命名周报')}</h1>
            <p class="subtitle">${escapeHtml(meta.subtitle || '课题、成果、节点与下一步动作集中呈现')}</p>
            <p class="summary">${escapeHtml(meta.summary || '暂无摘要')}</p>
            <div class="status-overview">
              <span class="status-pill">完成 ${escapeHtml(stageSummary.done)}</span>
              <span class="status-pill active">推进中 ${escapeHtml(stageSummary.active)}</span>
              <span class="status-pill planned">计划中 ${escapeHtml(stageSummary.planned)}</span>
              <span class="status-pill blocked">阻塞 ${escapeHtml(stageSummary.blocked)}</span>
            </div>
          </section>

          <aside class="hero-side">
            ${toList(
              heroStats,
              (item) => `
                <article class="hero-stat">
                  <span>${escapeHtml(item.name || '关键指标')}</span>
                  <strong>${escapeHtml(item.value || '--')}</strong>
                  <p>${escapeHtml(item.trend || item.note || '持续追踪中')}</p>
                </article>
              `,
              `
                <article class="hero-stat">
                  <span>关键指标</span>
                  <strong>待补充</strong>
                  <p>上传真实材料后可自动展示科研推进信号。</p>
                </article>
              `,
            )}
          </aside>
        </header>

        <section class="metric-strip">
          ${toList(
            metrics,
            (item) => `
              <article class="metric-card">
                <span class="metric-label">${escapeHtml(item.name || '指标')}</span>
                <strong>${escapeHtml(item.value || '--')}</strong>
                <p>${escapeHtml(item.trend || item.note || '暂无补充说明')}</p>
              </article>
            `,
            `
              <article class="metric-card">
                <span class="metric-label">指标</span>
                <strong>待补充</strong>
                <p>当前暂无可展示的科研指标。</p>
              </article>
            `,
          )}
        </section>

        <section class="main-grid">
          <article class="panel flow-panel">
            <div class="panel-head">
              <h2>课题推进链路</h2>
              <span>${escapeHtml(stages.length || 0)} 个阶段节点</span>
            </div>
            <div class="timeline-track">
              ${toList(
                stages,
                (item, index) => `
                  <article class="stage-card ${statusClass(item.status)}">
                    <div class="stage-node">${String(index + 1).padStart(2, '0')}</div>
                    <div class="stage-body">
                      <div class="stage-top">
                        <h3>${escapeHtml(item.stream || '阶段事项')}</h3>
                        <span class="stage-status">${escapeHtml(item.status || '进行中')}</span>
                      </div>
                      <p>${escapeHtml(item.outcome || '暂无阶段说明')}</p>
                      <small>负责人：${escapeHtml(item.owner || '待明确')}</small>
                    </div>
                  </article>
                `,
                `
                  <article class="stage-card planned">
                    <div class="stage-node">01</div>
                    <div class="stage-body">
                      <div class="stage-top">
                        <h3>暂无阶段信息</h3>
                        <span class="stage-status">待补充</span>
                      </div>
                      <p>请补充课题或项目推进节点。</p>
                      <small>负责人：待明确</small>
                    </div>
                  </article>
                `,
              )}
            </div>
          </article>

          <aside class="panel action-panel">
            <div class="panel-head">
              <h2>下一步关键动作</h2>
              <span>保证节点评审不断档</span>
            </div>
            <div class="action-stack">
              ${toList(
                actions,
                (item, index) => `
                  <article class="action-card">
                    <span class="action-index">A${String(index + 1).padStart(2, '0')}</span>
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
                    <span class="action-index">A00</span>
                    <div class="action-body">
                      <h3>暂无下一步动作</h3>
                      <p>建议补充近期里程碑与责任安排。</p>
                      <div class="action-meta">
                        <span>待定</span>
                        <span>待明确</span>
                      </div>
                    </div>
                  </article>
                `,
              )}
            </div>
          </aside>
        </section>
      </main>
    `;

    logBusinessJson('render_payload', {
      templateId: payload.templateId,
      stageSummary,
      metrics: metrics.length,
      stages: stages.length,
      actions: actions.length,
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
