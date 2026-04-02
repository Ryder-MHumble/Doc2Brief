(() => {
  const MODULE_NAME = 'template-magazine-runtime'

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')

  const readPayload = () => {
    const node = document.getElementById('template-data')
    if (!node) throw new Error('缺少 template-data 节点')
    return JSON.parse(node.textContent || '{}')
  }

  const logBusinessJson = (stage, payload) => {
    console.info('[业务JSON]', JSON.stringify({ module: MODULE_NAME, stage, timestamp: new Date().toISOString(), payload }, null, 2))
  }

  const logSystem = (level, event, payload = {}) => {
    const logger = level === 'error' ? console.error : console.info
    logger('[系统日志]', JSON.stringify({ module: MODULE_NAME, level, event, timestamp: new Date().toISOString(), payload }, null, 2))
  }

  const splitValueUnit = (value, fallbackUnit = '') => {
    const raw = String(value ?? '').trim()
    if (!raw) return { value: '--', unit: fallbackUnit }
    const match = raw.match(/^([+-]?\d+(?:\.\d+)?)(.*)$/)
    if (!match) return { value: raw, unit: fallbackUnit }
    return {
      value: match[1],
      unit: (match[2] || '').trim() || fallbackUnit,
    }
  }

  const richTextHtml = (value) =>
    escapeHtml(value || '暂无补充说明。').replace(/(\d+(?:\.\d+)?(?:\s*[+％%余人项名所位个场国月日期年]))/g, '<strong>$1</strong>')

  const statusClass = (item) => {
    if (item.tone === 'done') return 'status-done'
    if (item.tone === 'warning') return 'status-pending'
    return 'status-progress'
  }

  const progressColor = (item) => {
    if (item.tone === 'done') return 'var(--accent-sage)'
    if (item.tone === 'warning') return 'var(--accent-gold)'
    return 'var(--accent-red)'
  }

  const sectionLabelMap = {
    internal: '内部协同 · Internal Coordination',
    cooperation: '对外合作 · External Cooperation',
    visit: '交流互访 · Academic Exchange',
    system: '体系建设 · System Development',
  }

  const getIssueNumber = (issueLabel) => {
    const match = String(issueLabel || '').match(/(\d+)/)
    return String(match?.[1] || '1').padStart(2, '0')
  }

  const renderWorkItem = (item, index, total) => {
    const extraStyle = total === 5 && index === total - 1 ? ' style="grid-column:span 2;"' : ''
    return `
      <div class="work-item"${extraStyle}>
        <div class="work-item-header">
          <div class="work-item-title">${escapeHtml(item.title || '待补充事项')}</div>
          <span class="status-pill ${statusClass(item)}">${escapeHtml(item.status || '进行中')}</span>
        </div>
        <div class="work-item-text">${richTextHtml(item.body)}</div>
        <div class="work-progress">
          <div class="progress-track"><div class="progress-fill" data-w="${escapeHtml(String(item.progress || 0))}%" style="width:0%;background:${progressColor(item)}"></div></div>
          <span class="progress-num">${escapeHtml(String(item.progress || 0))}%</span>
        </div>
      </div>
    `
  }

  const renderOverviewItem = (item, index, overviewLength, stats) => {
    const quote = stats[index]?.value || item.number || String(index + 1).padStart(2, '0')
    const spanStyle = overviewLength >= 5 && index === overviewLength - 1 ? ' style="grid-column: span 2;"' : ''
    return `
      <div class="overview-item"${spanStyle}>
        <div class="pull-quote-num">${escapeHtml(quote)}</div>
        <div class="drop-cap-label">${escapeHtml(item.tag || '要览')}</div>
        <div class="overview-title">${escapeHtml(item.title || '待补充标题')}</div>
        <div class="overview-text">${richTextHtml(item.body)}</div>
      </div>
    `
  }

  const renderChartRow = (label, displayValue, percent, color) => `
    <div class="chart-row">
      <span class="chart-label">${escapeHtml(label)}</span>
      <div class="chart-track"><div class="chart-fill" data-w="${escapeHtml(String(percent))}%" style="width:0%;${color ? `background:${color}` : ''}"></div></div>
      <span class="chart-val">${escapeHtml(displayValue)}</span>
    </div>
  `

  try {
    const startedAt = performance.now()
    logSystem('info', '模板启动')

    const payload = readPayload()
    const vm = payload.viewModel?.magazine || {}
    const cover = vm.cover || {}
    const stats = Array.isArray(vm.stats) ? vm.stats.slice(0, 4) : []
    const overview = Array.isArray(vm.overview) ? vm.overview.slice(0, 5) : []
    const groups = vm.groups || {}
    const data = vm.data || {}
    const footer = vm.footer || {}
    const toc = Array.isArray(vm.toc) ? vm.toc : []
    const decks = Array.isArray(cover.decks) ? cover.decks.filter(Boolean).slice(0, 2) : []
    const issueNumber = getIssueNumber(cover.issueLabel)
    const year = String(footer.dateOnly || '').slice(0, 4) || new Date().getFullYear()

    document.title = cover.headline || payload.meta?.title || '周报预览'

    const mastheadPre = document.querySelector('.masthead-pre')
    const issueLabel = document.querySelector('.issue-label')
    const mastheadCn = document.querySelector('.masthead-cn')
    const colLeft = document.querySelector('.col-left')
    const colCenter = document.querySelector('.col-center')
    const colRight = document.querySelector('.col-right')
    const toolbarBrand = document.querySelector('.toolbar-brand')

    if (mastheadPre) mastheadPre.textContent = `${footer.issuedBy || 'file2web'} · Internal Affairs Report`
    if (issueLabel) issueLabel.textContent = cover.issueLabel || `Vol.${issueNumber} · ${year} · 第${issueNumber}期`
    if (mastheadCn) mastheadCn.textContent = `${footer.issuedBy || '自动生成周报'} · 周报`
    if (toolbarBrand) toolbarBrand.textContent = `周报 · 第${issueNumber}期`

    if (colLeft) {
      colLeft.innerHTML = `
        <div class="col-left-title">本期数据</div>
        ${stats
          .map((item) => {
            const parsed = splitValueUnit(item.value, item.unit)
            return `
              <div class="col-left-item">
                <div class="col-left-label">${escapeHtml(item.label || '关键指标')}</div>
                <div class="col-left-val">${escapeHtml(parsed.value)}${parsed.unit ? `<span style="font-size:18px;margin-left:4px">${escapeHtml(parsed.unit)}</span>` : ''}</div>
                <div class="col-left-desc">${escapeHtml(item.detail || '')}</div>
              </div>
            `
          })
          .join('')}
      `
    }

    if (colCenter) {
      colCenter.innerHTML = `
        <div class="headline">${escapeHtml(cover.headline || payload.meta?.title || '未命名周报')}</div>
        ${decks.map((item) => `<div class="deck">${escapeHtml(item)}</div>`).join('')}
        <div class="byline">
          <span>📅 ${escapeHtml(cover.period || payload.meta?.subtitle || '本周汇总')}</span>
          <span>🏛️ ${escapeHtml(cover.unit || footer.issuedBy || '自动生成周报')}</span>
        </div>
      `
    }

    if (colRight) {
      colRight.innerHTML = `
        <div class="col-right-title">本期目录</div>
        ${toc
          .map(
            (item, index) => `
              <div class="toc-item">
                <span class="toc-num">${['一', '二', '三', '四', '五', '六', '七'][index] || String(index + 1)}</span>
                <span class="toc-dots"></span>
                <span class="toc-text">${escapeHtml(item)}</span>
              </div>
            `,
          )
          .join('')}
      `
    }

    const overviewGrid = document.querySelector('.overview-grid')
    if (overviewGrid) {
      overviewGrid.innerHTML = overview.map((item, index) => renderOverviewItem(item, index, overview.length, stats)).join('')
    }

    const panelConfig = [
      { id: 'tab-sync2', key: 'internal' },
      { id: 'tab-collab2', key: 'cooperation' },
      { id: 'tab-visit2', key: 'visit' },
      { id: 'tab-system2', key: 'system' },
    ]

    panelConfig.forEach(({ id, key }) => {
      const panel = document.getElementById(id)
      const items = Array.isArray(groups[key]) ? groups[key] : []
      const labelNode = panel?.querySelector('.work-cat-label')
      const gridNode = panel?.querySelector('.work-items-grid')
      if (labelNode) labelNode.textContent = sectionLabelMap[key] || '重点工作'
      if (gridNode) gridNode.innerHTML = items.map((item, index) => renderWorkItem(item, index, items.length)).join('')
    })

    const dataStatsRow = document.querySelector('.data-stats-row')
    if (dataStatsRow) {
      dataStatsRow.innerHTML = (data.keyMetrics || []).slice(0, 5)
        .map((item) => {
          const parsed = splitValueUnit(item.value, item.unit)
          return `
            <div class="data-stat">
              <div class="data-stat-num">${escapeHtml(parsed.value)}${parsed.unit ? `<span class="data-stat-unit">${escapeHtml(parsed.unit)}</span>` : ''}</div>
              <div class="data-stat-label">${escapeHtml(item.label || '指标')}</div>
            </div>
          `
        })
        .join('')
    }

    const chartBoxes = document.querySelectorAll('.chart-box')
    if (chartBoxes[0]) {
      const defense = data.defense || {}
      const total = Math.max(Number(defense.total || 0), 1)
      chartBoxes[0].innerHTML = `
        <div class="chart-box-title">博士生答辩结果</div>
        ${renderChartRow('开题通过', `${defense.pass || 0}人`, Number((((defense.pass || 0) / total) * 100).toFixed(1)), '')}
        ${renderChartRow('未通过', `${defense.fail || 0}人`, Number((((defense.fail || 0) / total) * 100).toFixed(1)), '#C8382A')}
        ${renderChartRow('修改后通过', `${defense.revised || 0}人`, Number((((defense.revised || 0) / total) * 100).toFixed(1)), '#D4A017')}
        ${renderChartRow('博资考通过', `${defense.exam || 0}人`, Number((((defense.exam || 0) / total) * 100).toFixed(1)), '#4A6741')}
      `
    }

    if (chartBoxes[1]) {
      chartBoxes[1].innerHTML = `
        <div class="chart-box-title">对外合作推进进度</div>
        ${(data.cooperation || [])
          .slice(0, 6)
          .map((item) => renderChartRow(item.title, `${item.progress || 0}%`, item.progress || 0, progressColor(item)))
          .join('')}
      `
    }

    const colophonInfo = document.querySelector('.colophon-info')
    const stampNum = document.querySelector('.stamp-num')
    const stampTexts = document.querySelectorAll('.stamp-text')
    if (colophonInfo) {
      colophonInfo.innerHTML = `
        <strong>报送 · Distribution</strong>
        报：${escapeHtml(footer.recipient || '相关负责人')}<br>
        发：${escapeHtml(footer.distribution || '相关部门')}<br><br>
        <strong>责编 · Editorial</strong>
        责编：${escapeHtml(footer.editor || '（待填写）')}&emsp;|&emsp;核发：${escapeHtml(footer.reviewer || '（待填写）')}<br>
        出版日期：${escapeHtml(footer.date || '')}
      `
    }
    if (stampNum) stampNum.textContent = issueNumber
    if (stampTexts[0]) stampTexts[0].textContent = 'ISSUE'
    if (stampTexts[1]) stampTexts[1].textContent = year

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

function switchTab(name, btn) {
  const panel = document.getElementById('tab-' + name)
  if (!panel) return
  const allPanels = panel.parentElement.querySelectorAll('.tab-panel')
  const allBtns = btn.parentElement.querySelectorAll('.tab-btn')
  allPanels.forEach((item) => item.classList.remove('active'))
  allBtns.forEach((item) => item.classList.remove('active'))
  panel.classList.add('active')
  btn.classList.add('active')
  panel.querySelectorAll('.progress-fill, .chart-fill').forEach((el) => {
    const width = el.getAttribute('data-w')
    if (width) {
      el.style.width = '0%'
      setTimeout(() => {
        el.style.width = width
      }, 60)
    }
  })
}

const navIds = ['overview', 'work', 'data-section', 'footer-col']
const navLinks = Array.from(document.querySelectorAll('.nav-link'))

function activateNavById(id) {
  const idx = navIds.indexOf(id)
  if (idx < 0) return
  navLinks.forEach((link, linkIdx) => link.classList.toggle('active', linkIdx === idx))
}

function setNav(el, evt) {
  evt?.preventDefault()
  const targetId = (el.getAttribute('href') || '').replace(/^#/, '')
  if (!targetId) return
  activateNavById(targetId)
  const section = document.getElementById(targetId)
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const ro = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('visible')
      entry.target.querySelectorAll('.progress-fill, .chart-fill').forEach((el) => {
        const width = el.getAttribute('data-w')
        if (width) {
          setTimeout(() => {
            el.style.width = width
          }, 300)
        }
      })
    })
  },
  { threshold: 0.08 },
)

document.querySelectorAll('.reveal').forEach((el) => ro.observe(el))

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

function exportHTML() {
  const blob = new Blob(['<!DOCTYPE html>\n' + document.documentElement.outerHTML], { type: 'text/html' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '周报_杂志版.html'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 3000)
}
