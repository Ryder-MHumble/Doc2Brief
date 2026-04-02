(() => {
  const MODULE_NAME = 'template-minimal-runtime'

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const readPayload = () => {
    const node = document.getElementById('template-data')
    if (!node) {
      throw new Error('缺少 template-data 节点')
    }
    return JSON.parse(node.textContent || '{}')
  }

  const logBusinessJson = (stage, payload) => {
    console.info('[业务JSON]', JSON.stringify({ module: MODULE_NAME, stage, timestamp: new Date().toISOString(), payload }, null, 2))
  }

  const logSystem = (level, event, payload = {}) => {
    const logger = level === 'error' ? console.error : console.info
    logger('[系统日志]', JSON.stringify({ module: MODULE_NAME, level, event, timestamp: new Date().toISOString(), payload }, null, 2))
  }

  const badgeClass = (status = '') => {
    if (status.includes('完成')) return 'badge-done'
    if (status.includes('搁置') || status.includes('待推进')) return 'badge-wait'
    return 'badge-prog'
  }

  const dots = (progress = 0) => {
    const filled = Math.max(0, Math.min(5, Math.round(progress / 20)))
    return new Array(5).fill(0).map((_, index) => `<div class="progress-dot ${index < filled ? 'filled' : ''}"></div>`).join('')
  }

  const renderTableRows = (items) =>
    items
      .map(
        (item) => `
          <tr>
            <td><div class="td-title">${escapeHtml(item.title)}</div></td>
            <td><div class="td-desc">${escapeHtml(item.body)}</div></td>
            <td><span class="badge-min ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
            <td>
              <div class="progress-dot-row">${dots(item.progress)}</div>
              <div class="td-pct">${escapeHtml(String(item.progress))}%</div>
            </td>
          </tr>
        `,
      )
      .join('')

  const renderWallColumn = (title, items) => `
    <div>
      <div class="pw-col-title">${escapeHtml(title)}</div>
      ${items
        .map(
          (item) => `
            <div class="pw-item">
              <div class="pw-header"><span class="pw-name">${escapeHtml(item.title)}</span><span class="pw-pct">${escapeHtml(String(item.progress))}%</span></div>
              <div class="pw-track"><div class="pw-fill" data-w="${escapeHtml(String(item.progress))}%" style="width:0%"></div></div>
            </div>
          `,
        )
        .join('')}
    </div>
  `

  try {
    const startedAt = performance.now()
    logSystem('info', '模板启动')

    const payload = readPayload()
    const vm = payload.viewModel?.minimal || {}
    const hero = vm.hero || {}
    const stats = Array.isArray(vm.stats) ? vm.stats.slice(0, 5) : []
    const overview = Array.isArray(vm.overview) ? vm.overview.slice(0, 5) : []
    const groups = vm.groups || {}
    const data = vm.data || {}
    const footer = vm.footer || {}

    document.title = hero.title || payload.meta?.title || '周报预览'
    const heroBlock = document.querySelector('.hero')
    const eyebrow = heroBlock?.querySelector('.hero-eyebrow')
    const title = heroBlock?.querySelector('.hero-h1')
    const desc = heroBlock?.querySelector('.hero-desc')
    const metaRow = heroBlock?.querySelector('.hero-meta-row')
    const bgNumber = heroBlock?.querySelector('.bg-number')

    if (eyebrow) eyebrow.textContent = hero.eyebrow || '自动生成 · 内部周报'
    if (title) title.innerHTML = escapeHtml(hero.title || '未命名周报').replace(/\n/g, '<br>')
    if (desc) desc.textContent = hero.summary || payload.meta?.summary || '暂无摘要信息。'
    if (metaRow) {
      metaRow.innerHTML = `
        <span>${escapeHtml(hero.period || payload.meta?.subtitle || '本周汇总')}</span>
        <span class="hero-meta-sep"></span>
        <span>${escapeHtml(hero.unit || footer.issuedBy || '自动生成周报')}</span>
        <span class="hero-meta-sep"></span>
        <span>发布于 ${escapeHtml(hero.issuedAt || footer.date || '')}</span>
      `
    }
    if (bgNumber) bgNumber.textContent = hero.bgNumber || '01'

    const statsRow = document.querySelector('.hero-kpi-row')
    if (statsRow) {
      statsRow.innerHTML = stats
        .map(
          (item) => `
            <div class="hero-kpi">
              <div class="kpi-n">${escapeHtml(item.value || '--')}${item.unit ? `<span class="data-cell-unit">${escapeHtml(item.unit)}</span>` : ''}</div>
              <div class="kpi-l">${escapeHtml(item.label || '指标').replace(/\s+/g, '<br>')}</div>
            </div>
          `,
        )
        .join('')
    }

    const highlightList = document.querySelector('.highlight-list')
    if (highlightList) {
      highlightList.innerHTML = overview
        .map(
          (item, index) => `
            <div class="hl-item">
              <span class="hl-num">${String(index + 1).padStart(2, '0')}</span>
              <div class="hl-body">
                <div class="hl-tag">${escapeHtml(item.tag || '要点')}</div>
                <div class="hl-title">${escapeHtml(item.title)}</div>
                <div class="hl-text">${escapeHtml(item.body)}</div>
              </div>
            </div>
          `,
        )
        .join('')
    }

    const panelMap = {
      ms1: groups.internal || [],
      ms2: groups.cooperation || [],
      ms3: groups.visit || [],
      ms4: groups.system || [],
    }
    Object.entries(panelMap).forEach(([id, items]) => {
      const tbody = document.querySelector(`#${id} tbody`)
      if (tbody) {
        tbody.innerHTML = renderTableRows(items)
      }
    })

    const dataGrid = document.querySelector('#dt .data-grid')
    if (dataGrid) {
      dataGrid.innerHTML = (data.keyMetrics || [])
        .map(
          (item) => `
            <div class="data-cell">
              <div class="data-cell-num">${escapeHtml(item.value || '--')}${item.unit ? `<span class="data-cell-unit">${escapeHtml(item.unit)}</span>` : ''}</div>
              <div class="data-cell-label">${escapeHtml(item.label || '指标')}</div>
              <div class="data-cell-sub">${escapeHtml(item.sub || '')}</div>
            </div>
          `,
        )
        .join('')
    }

    const progressWall = document.querySelector('#dt .progress-wall')
    if (progressWall) {
      progressWall.innerHTML = [
        renderWallColumn('对外合作推进进度', data.cooperation || []),
        renderWallColumn('体系建设推进进度', data.system || []),
      ].join('')
    }

    const footerBlock = document.querySelector('#ft .footer-minimal')
    if (footerBlock) {
      footerBlock.innerHTML = `
        <div>
          <div class="fm-block-label">报送对象</div>
          <div class="fm-block-val">${escapeHtml(footer.recipient || '相关负责人')}</div>
        </div>
        <div>
          <div class="fm-block-label">发送范围</div>
          <div class="fm-block-val">${escapeHtml(footer.distribution || '相关部门')}</div>
        </div>
        <div>
          <div class="fm-block-label">责编 / 日期</div>
          <div class="fm-block-val">责编：${escapeHtml(footer.editor || '（待填写）')}<br>核发：${escapeHtml(footer.reviewer || '（待填写）')}<br>${escapeHtml(footer.date || '')}</div>
        </div>
      `
    }

    logBusinessJson('render_payload', {
      stats: stats.length,
      overview: overview.length,
      internal: (groups.internal || []).length,
      cooperation: (groups.cooperation || []).length,
      visit: (groups.visit || []).length,
      system: (groups.system || []).length,
    })
    logSystem('info', '模板完成', { elapsedMs: Number((performance.now() - startedAt).toFixed(2)) })
  } catch (error) {
    logSystem('error', '模板渲染失败', { message: error instanceof Error ? error.message : String(error) })
  }
})()

// Tab
function swMin(id, btn) {
  const p = document.getElementById(id);
  if (!p) return;
  p.parentElement.querySelectorAll('.min-panel').forEach(x => x.classList.remove('active'));
  btn.parentElement.querySelectorAll('.min-tab').forEach(x => x.classList.remove('active'));
  p.classList.add('active');
  btn.classList.add('active');
}

// Nav
const navIds = ['ov', 'wk', 'dt', 'ft']
const navLinks = Array.from(document.querySelectorAll('.nav-a'))

function activateNavById(id) {
  const idx = navIds.indexOf(id)
  if (idx < 0) return
  navLinks.forEach((link, linkIdx) => link.classList.toggle('active', linkIdx === idx))
}

function setN(el, evt) {
  evt?.preventDefault()
  const targetId = (el.getAttribute('href') || '').replace(/^#/, '')
  if (!targetId) return
  activateNavById(targetId)
  const section = document.getElementById(targetId)
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// KPI 数字
function countUp(el, target) {
  let start = 0;
  const step = () => {
    start += Math.ceil(target / 60);
    if (start >= target) { el.textContent = target; return; }
    el.textContent = start;
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
setTimeout(() => {
  countUp(document.getElementById('kn1'), 5);
  countUp(document.getElementById('kn2'), 34);
  countUp(document.getElementById('kn3'), 19);
  countUp(document.getElementById('kn4'), 470);
  countUp(document.getElementById('kn5'), 700);
}, 600);

// 滚动动画
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      // 列表动画
      e.target.querySelectorAll('.hl-item').forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 100);
      });
      // 进度条
      e.target.querySelectorAll('.pw-fill').forEach(el => {
        const w = el.getAttribute('data-w');
        if (w) setTimeout(() => el.style.width = w, 400);
      });
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.appear').forEach(el => io.observe(el));

const navSpy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      activateNavById(entry.target.id)
    })
  },
  { rootMargin: '-35% 0px -55% 0px' },
)

navIds.forEach((id) => {
  const section = document.getElementById(id)
  if (section) navSpy.observe(section)
})

// 导出
function exportHTML() {
  const b = new Blob(['<!DOCTYPE html>\n' + document.documentElement.outerHTML], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = '周报_极简版.html';
  a.click();
}
