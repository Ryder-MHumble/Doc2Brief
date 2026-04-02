(() => {
  const MODULE_NAME = 'template-ink-runtime'

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

  const toneMeta = (item) => {
    if (item.tone === 'done') {
      return {
        badge: 'badge-done',
        fill: 'fill-jade',
        color: 'var(--jade)',
      }
    }
    if (item.tone === 'warning') {
      return {
        badge: 'badge-pending',
        fill: 'fill-gold',
        color: 'var(--gold)',
      }
    }
    return {
      badge: 'badge-progress',
      fill: 'fill-indigo',
      color: 'var(--indigo)',
    }
  }

  const tonePalette = ['var(--red)', 'var(--jade)', 'var(--indigo)', 'var(--gold)', 'var(--copper)']
  const enLabelMap = {
    科研组织: 'Achievement',
    科研申报: 'Fund Apply',
    国际交流: 'Int\'l Forum',
    学术交流: 'Forum',
    学术研讨: 'Seminar',
    少年学院: 'Youth Award',
    招生: 'Admissions',
    培养: 'Talent Dev',
    要览: 'Highlights',
  }

  const issueDigitToCn = (value) => {
    const map = { '0': '零', '1': '一', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六', '7': '七', '8': '八', '9': '九' }
    return String(value || '1')
      .split('')
      .map((char) => map[char] || char)
      .join('')
  }

  const formatHighlightHtml = (value) =>
    escapeHtml(value || '暂无补充说明。').replace(/(\d+(?:\.\d+)?(?:\s*[+％%余人项名所位个场国月日期年]))/g, '<span class="hl-num">$1</span>')

  const formatCardHtml = (value) =>
    escapeHtml(value || '暂无补充说明。')
      .replace(/(\d+(?:\.\d+)?(?:\s*[+％%余人项名所位个场国月日期年]))/g, '<span class="bc-num">$1</span>')
      .replace(/(“[^”]+”|"[^"]+")/g, '<span class="bc-key">$1</span>')

  const extractGlyph = (value) => {
    const match = String(value || '').match(/[\u4e00-\u9fffA-Za-z]/)
    return match ? match[0] : '报'
  }

  const toEnLabel = (tag, index) => {
    const text = String(tag || '').trim()
    if (enLabelMap[text]) return enLabelMap[text]
    if (text.includes('合作')) return 'Cooperation'
    if (text.includes('交流')) return 'Exchange'
    if (text.includes('体系')) return 'System'
    if (text.includes('招生')) return 'Admissions'
    return ['Insight', 'Agenda', 'Forum', 'Update', 'Focus'][index % 5]
  }

  const buildDonutSection = (defense) => {
    const total = Number(defense.total || 0)
    const safeTotal = total > 0 ? total : 1
    const radius = 58
    const circumference = 2 * Math.PI * radius
    const segments = [
      { value: Number(defense.pass || 0), color: '#00665A' },
      { value: Number(defense.fail || 0), color: '#C41E3A' },
      { value: Number(defense.revised || 0), color: '#B8860B' },
    ]

    let offset = 0
    const circles = segments
      .filter((item) => item.value > 0)
      .map((item) => {
        const length = Number(((item.value / safeTotal) * circumference).toFixed(1))
        const dashOffset = Number((-offset).toFixed(1))
        offset += length
        return `
          <circle cx="75" cy="75" r="58"
                  fill="none"
                  stroke="${item.color}"
                  stroke-width="18"
                  stroke-dasharray="${length} ${Number((circumference + 200).toFixed(1))}"
                  stroke-dashoffset="${dashOffset}"
                  transform="rotate(-90 75 75)"
                  filter="url(#df-shadow)"/>
        `
      })
      .join('')

    return `
      <div class="defense-donut">
        <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="df-shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.1"/>
            </filter>
          </defs>
          <circle cx="75" cy="75" r="58" fill="none" stroke="rgba(26,18,8,0.06)" stroke-width="18"/>
          ${circles}
          <text x="75" y="68" text-anchor="middle" font-family="'Noto Serif SC', serif" font-size="26" font-weight="900" fill="#1A1208">${escapeHtml(String(total || 0))}</text>
          <text x="75" y="84" text-anchor="middle" font-family="'Noto Serif SC', serif" font-size="10" fill="#9A8060" letter-spacing="3">参与人数</text>
        </svg>
      </div>
      <div class="defense-info">
        <div class="defense-title">博士生补充答辩结果分布</div>
        <div class="defense-legend">
          <div class="dl-item"><div class="dl-color-block" style="background:var(--jade)"></div><div class="dl-content"><div class="dl-val" style="color:var(--jade)">${escapeHtml(String(defense.pass || 0))}</div><div class="dl-label">开题通过</div></div></div>
          <div class="dl-item"><div class="dl-color-block" style="background:var(--red)"></div><div class="dl-content"><div class="dl-val" style="color:var(--red)">${escapeHtml(String(defense.fail || 0))}</div><div class="dl-label">未通过</div></div></div>
          <div class="dl-item"><div class="dl-color-block" style="background:var(--gold)"></div><div class="dl-content"><div class="dl-val" style="color:var(--gold)">${escapeHtml(String(defense.revised || 0))}</div><div class="dl-label">修改后通过</div></div></div>
          <div class="dl-item"><div class="dl-color-block" style="background:var(--indigo)"></div><div class="dl-content"><div class="dl-val" style="color:var(--indigo)">${escapeHtml(String(defense.exam || 0))}</div><div class="dl-label">博资考通过</div></div></div>
        </div>
      </div>
    `
  }

  const renderOverviewEntry = (item, index) => {
    const color = tonePalette[index % tonePalette.length]
    return `
      <div class="hl-entry">
        <div class="hl-sidebar">
          <span class="hl-seq-num">${escapeHtml(item.number || String(index + 1).padStart(2, '0'))}</span>
          <div class="hl-category-indicator" style="color:${color};background:${color}"></div>
          <span class="hl-en-rotated">${escapeHtml(toEnLabel(item.tag, index))}</span>
        </div>
        <div class="hl-body-content">
          <div class="hl-category-tag">
            <div class="hl-cat-diamond" style="background:${color}"></div>
            ${escapeHtml(item.tag || '要览')}
          </div>
          <div class="hl-title">${escapeHtml(item.title || '待补充标题')}</div>
          <div class="hl-text">${formatHighlightHtml(item.body)}</div>
        </div>
      </div>
    `
  }

  const renderBambooCard = (item, index, total) => {
    const meta = toneMeta(item)
    const spanClass = total === 5 && index === total - 1 ? ' span-2' : ''
    return `
      <div class="bamboo-card${spanClass}" data-glyph="${escapeHtml(extractGlyph(item.title || item.status))}">
        <div class="bc-header">
          <div class="bc-title">${escapeHtml(item.title || '待补充事项')}</div>
          <span class="ink-badge ${meta.badge}">${escapeHtml(item.status || '进行中')}</span>
        </div>
        <div class="bc-text">${formatCardHtml(item.body)}</div>
        <div class="ink-prog-wrap">
          <div class="ink-prog-track">
            <div class="ink-prog-fill ${meta.fill}" data-w="${escapeHtml(String(item.progress || 0))}%" style="width:0%"></div>
          </div>
          <span class="ink-prog-pct" style="color:${meta.color}">${escapeHtml(String(item.progress || 0))}%</span>
        </div>
      </div>
    `
  }

  const renderProgressBox = (title, items) => `
    <div class="prog-chart-box">
      <div class="pcb-title">${escapeHtml(title)}</div>
      ${items
        .map((item) => {
          const meta = toneMeta(item)
          return `
            <div class="pcb-item">
              <div class="pcb-header">
                <span class="pcb-name">${escapeHtml(item.title || '事项')}</span>
                <span class="pcb-pct" style="color:${meta.color}">${escapeHtml(String(item.progress || 0))}%</span>
              </div>
              <div class="pcb-track">
                <div class="pcb-fill" data-w="${escapeHtml(String(item.progress || 0))}%" style="width:0%;background:linear-gradient(90deg,${meta.color},${meta.color})"></div>
              </div>
            </div>
          `
        })
        .join('')}
    </div>
  `

  try {
    const startedAt = performance.now()
    logSystem('info', '模板启动')

    const payload = readPayload()
    const vm = payload.viewModel?.ink || {}
    const cover = vm.cover || {}
    const overview = Array.isArray(vm.overview) ? vm.overview.slice(0, 5) : []
    const groups = vm.groups || {}
    const data = vm.data || {}
    const footer = vm.footer || {}
    const stats = Array.isArray(cover.stats) ? cover.stats.slice(0, 5) : []
    const issueDigits = String((cover.subTitle || '').match(/(\d+)/)?.[1] || '1')
    const issueCn = issueDigitToCn(issueDigits)

    document.title = cover.title || payload.meta?.title || '周报预览'

    const coverEn = document.querySelector('.cover-en')
    const coverZhMain = document.querySelector('.cover-zh-main')
    const coverZhSub = document.querySelector('.cover-zh-sub')
    const cisValues = document.querySelectorAll('.cis-val')
    const navBrand = document.querySelector('.nav-brand')
    const coverKpiWrap = document.querySelector('.cover-kpi-wrap')

    if (coverEn) coverEn.textContent = cover.enTitle || `${footer.issuedBy || 'file2web'} · Weekly Report`
    if (coverZhMain) coverZhMain.textContent = cover.title || payload.meta?.title || '未命名周报'
    if (coverZhSub) coverZhSub.textContent = cover.subTitle || `第${issueCn}期 · 自动生成`
    if (cisValues[0]) cisValues[0].textContent = cover.period || payload.meta?.subtitle || '本周汇总'
    if (cisValues[1]) cisValues[1].textContent = cover.unit || footer.issuedBy || '自动生成周报'
    if (cisValues[2]) cisValues[2].textContent = cover.issuedAt || footer.date || ''
    if (navBrand) navBrand.innerHTML = `<div class="nav-brand-dot"></div>${escapeHtml(footer.issuedBy || '自动生成周报')} · 周报`

    if (coverKpiWrap) {
      coverKpiWrap.innerHTML = stats
        .map((item, index) => {
          const parsed = splitValueUnit(item.value, item.unit)
          return `
            <div class="cover-kpi-item">
              <div class="cki-num"><span class="kpi-figure" data-target="${escapeHtml(String(item.target || 0))}">0</span><span class="cki-unit"> ${escapeHtml(parsed.unit || item.unit || '')}</span></div>
              <div class="cki-label">${escapeHtml(item.label || '指标').replace(/\s+/g, '<br>')}</div>
            </div>
          `
        })
        .join('')
    }

    const scrollContainer = document.querySelector('.scroll-container')
    if (scrollContainer) {
      scrollContainer.innerHTML = `<div class="scroll-rod"></div>${overview.map((item, index) => renderOverviewEntry(item, index)).join('')}`
    }

    const panelMap = {
      'tab-sync': groups.internal || [],
      'tab-collab': groups.cooperation || [],
      'tab-visit': groups.visit || [],
      'tab-system': groups.system || [],
    }

    Object.entries(panelMap).forEach(([id, items]) => {
      const panel = document.getElementById(id)
      const grid = panel?.querySelector('.bamboo-grid')
      if (grid) grid.innerHTML = items.map((item, index) => renderBambooCard(item, index, items.length)).join('')
    })

    const dataBigGrid = document.querySelector('.data-big-grid')
    if (dataBigGrid) {
      dataBigGrid.innerHTML = stats.slice(0, 4)
        .map((item) => {
          const parsed = splitValueUnit(item.value, item.unit)
          return `
            <div class="dbg-cell">
              <div class="dbg-num">${escapeHtml(parsed.value)}${parsed.unit ? `<span class="dbg-unit"> ${escapeHtml(parsed.unit)}</span>` : ''}</div>
              <div class="dbg-label">${escapeHtml(item.label || '指标')}</div>
              <div class="dbg-note">${escapeHtml(item.detail || '')}</div>
            </div>
          `
        })
        .join('')
    }

    const defenseSection = document.querySelector('.defense-section')
    if (defenseSection) defenseSection.innerHTML = buildDonutSection(data.defense || {})

    const progressCharts = document.querySelector('.progress-charts')
    if (progressCharts) {
      progressCharts.innerHTML = [
        renderProgressBox('对外合作推进进度', (data.cooperation || []).slice(0, 6)),
        renderProgressBox('内部体系建设进度', (data.system || []).slice(0, 6)),
      ].join('')
    }

    const extraStats = document.querySelector('.extra-stats')
    if (extraStats) {
      extraStats.innerHTML = (data.keyMetrics || []).slice(0, 6)
        .map((item) => {
          const parsed = splitValueUnit(item.value, item.unit)
          return `
            <div class="es-card">
              <div class="es-num">${escapeHtml(parsed.value)}${parsed.unit ? `<span class="es-unit"> ${escapeHtml(parsed.unit)}</span>` : ''}</div>
              <div class="es-label">${escapeHtml(item.label || '指标').replace(/\s+/g, '<br>')}</div>
            </div>
          `
        })
        .join('')
    }

    const colophonIssue = document.querySelector('.colophon-issue')
    const colophonBody = document.querySelector('.colophon-body')
    const colophonDate = document.querySelector('.colophon-date')
    const colophonOrg = document.querySelector('.colophon-org')
    const cornerChop = document.querySelector('.corner-chop-text')
    const footerLines = document.querySelectorAll('.ipf-line')

    if (colophonIssue) colophonIssue.textContent = cover.subTitle || `第${issueCn}期`
    if (colophonBody) {
      colophonBody.innerHTML = `
        <div>
          <div class="cb-block-label">报送对象</div>
          <div class="cb-block-val">${escapeHtml(footer.recipient || '相关负责人')}</div>
        </div>
        <div>
          <div class="cb-block-label">发送范围</div>
          <div class="cb-block-val">${escapeHtml(footer.distribution || '相关部门').replace(/\s*[,，；;]\s*/g, '<br>')}</div>
        </div>
        <div>
          <div class="cb-block-label">责编 / 核发</div>
          <div class="cb-block-val">责编：${escapeHtml(footer.editor || '（待填写）')}<br>核发：${escapeHtml(footer.reviewer || '（待填写）')}</div>
        </div>
      `
    }
    if (colophonDate) colophonDate.innerHTML = `${escapeHtml(footer.date || '')} &emsp;|&emsp; ${escapeHtml(footer.issuedBy || '自动生成周报')}`
    if (colophonOrg) colophonOrg.textContent = footer.issuedBy || '自动生成周报'
    if (cornerChop) cornerChop.innerHTML = `第<br>${escapeHtml(issueCn)}<br>期`
    if (footerLines[0]) footerLines[0].textContent = `${footer.issuedBy || '自动生成周报'} · 内部资料 · 请勿外传`
    if (footerLines[1]) footerLines[1].textContent = cover.enTitle || 'file2web · Weekly Report'

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

function inkCountUp(element, target, delay) {
  setTimeout(() => {
    if (!element) return
    let current = 0
    const duration = 1400
    const startedAt = performance.now()
    function step(now) {
      const elapsed = now - startedAt
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      current = Math.round(eased * target)
      element.textContent = String(current)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, delay)
}

function switchTab(panelId, btn) {
  const panel = document.getElementById(panelId)
  if (!panel) return

  const allPanels = panel.parentElement.querySelectorAll('.ink-tab-panel')
  const allBtns = btn.parentElement.querySelectorAll('.ink-tab-btn')

  allPanels.forEach((item) => item.classList.remove('active'))
  allBtns.forEach((item) => item.classList.remove('active'))

  panel.classList.add('active')
  btn.classList.add('active')

  panel.querySelectorAll('.ink-prog-fill').forEach((fill) => {
    const width = fill.getAttribute('data-w')
    if (!width) return
    fill.style.width = '0%'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = width
      })
    })
  })
}

function setNav(el, evt) {
  evt?.preventDefault()
  document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'))
  el.classList.add('active')
  const targetId = (el.getAttribute('href') || '').replace(/^#/, '')
  if (!targetId) return
  const section = document.getElementById(targetId)
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      const target = entry.target
      target.classList.add('ink-shown')

      target.querySelectorAll('.hl-entry').forEach((item, index) => {
        setTimeout(() => item.classList.add('entry-show'), index * 160)
      })

      target.querySelectorAll('.ink-tab-panel.active .ink-prog-fill, .ink-prog-fill').forEach((fill) => {
        const width = fill.getAttribute('data-w')
        if (!width) return
        setTimeout(() => {
          fill.style.width = width
        }, 500)
      })

      target.querySelectorAll('.pcb-fill').forEach((fill) => {
        const width = fill.getAttribute('data-w')
        if (!width) return
        setTimeout(() => {
          fill.style.width = width
        }, 500)
      })

      revealObserver.unobserve(target)
    })
  },
  { threshold: 0.06 },
)

document.querySelectorAll('.ink-reveal').forEach((el) => revealObserver.observe(el))

const sections = [
  { id: 'section-ov', link: 0 },
  { id: 'section-wk', link: 1 },
  { id: 'section-dt', link: 2 },
  { id: 'section-ft', link: 3 },
]
const navLinks = document.querySelectorAll('.nav-link')

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const index = sections.findIndex((item) => item.id === entry.target.id)
      if (index === -1) return
      navLinks.forEach((item) => item.classList.remove('active'))
      if (navLinks[index]) navLinks[index].classList.add('active')
    })
  },
  { rootMargin: '-30% 0px -60% 0px' },
)

sections.forEach((item) => {
  const el = document.getElementById(item.id)
  if (el) navObserver.observe(el)
})

function exportHTML() {
  const html = '<!DOCTYPE html>\n' + document.documentElement.outerHTML
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '教科人管理中心周报_国风版.html'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 3000)
}

window.addEventListener('load', () => {
  document.querySelectorAll('.kpi-figure[data-target]').forEach((element, index) => {
    inkCountUp(element, Number(element.dataset.target || 0), 800 + index * 180)
  })

  document.querySelectorAll('#tab-sync .ink-prog-fill').forEach((fill) => {
    const width = fill.getAttribute('data-w')
    if (width) {
      setTimeout(() => {
        fill.style.width = width
      }, 2800)
    }
  })
})
