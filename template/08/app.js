(() => {
  const MODULE_NAME = 'template-split-magazine-runtime'
  const MOBILE_SCROLL_OFFSET = 92
  const DESKTOP_SCROLL_OFFSET = 32
  const isPreviewLite = Boolean(window.__FILE2WEB_PREVIEW_LITE__)

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

  const splitValueUnit = (value, fallback = '') => {
    const raw = String(value ?? '').trim()
    if (!raw) return { value: '--', unit: fallback }
    const match = raw.match(/^([+-]?\d+(?:\.\d+)?)(.*)$/)
    if (!match) return { value: raw, unit: fallback }
    return { value: match[1], unit: (match[2] || '').trim() || fallback }
  }

  const toneMeta = (item) => {
    if (item.tone === 'done') return { color: '#2D6A2D', fill: '#7BAE7F', text: '已完成' }
    if (item.tone === 'warning') return { color: '#6A4A1A', fill: '#AA7A4A', text: '待解决' }
    return { color: '#1A4A6A', fill: '#4A7AAA', text: '进行中' }
  }

  const renderWorkCell = (item) => {
    const meta = toneMeta(item)
    return `
      <div class="Wcell">
        <div class="Wstatus" style="color:${meta.color}"><div class="Wsdot" style="background:${meta.fill}"></div>${escapeHtml(item.status || meta.text)}</div>
        <div class="Wtitle">${escapeHtml(item.title || '待补充事项')}</div>
        <div class="Wbody">${escapeHtml(item.body || '暂无补充说明。')}</div>
        <div class="Wprog"><div class="Wtrack"><div class="Wfill" data-w="${escapeHtml(String(item.progress || 0))}%" style="width:0;background:${meta.fill}"></div></div><div class="Wval">${escapeHtml(String(item.progress || 0))}%</div></div>
      </div>
    `
  }

  const navConfig = [
    { id: 'ov', label: '本周要览' },
    { id: 'wk', label: '内部协同' },
    { id: 'co', label: '对外合作' },
    { id: 'vi', label: '交流互访' },
    { id: 'sy', label: '体系建设' },
    { id: 'dt', label: '数据看板' },
  ]

  const getScrollHost = () => {
    const rp = document.getElementById('rp')
    if (!rp) return window
    const style = window.getComputedStyle(rp)
    const canScroll = /(auto|scroll)/.test(style.overflowY) && rp.scrollHeight > rp.clientHeight + 4
    return canScroll ? rp : window
  }

  try {
    const startedAt = performance.now()
    logSystem('info', '模板启动')

    const payload = readPayload()
    const vm = payload.viewModel?.splitMagazine || {}
    const masthead = vm.masthead || {}
    const stats = Array.isArray(vm.stats) ? vm.stats.slice(0, 6) : []
    const overview = Array.isArray(vm.overview) ? vm.overview.slice(0, 6) : []
    const groups = vm.groups || {}
    const data = vm.data || {}
    const footer = vm.footer || {}

    const leftTitle = document.getElementById('left-title')
    const leftMeta = document.getElementById('left-meta')
    const leftFoot = document.getElementById('left-foot')
    if (leftTitle) leftTitle.innerHTML = escapeHtml(masthead.title || payload.meta?.title || '周报').replace(/\s+/g, '<br>')
    if (leftMeta) leftMeta.textContent = masthead.issue || payload.meta?.subtitle || '内部资料'
    if (leftFoot) leftFoot.textContent = masthead.foot || footer.dateOnly || '--'

    const leftKpis = document.getElementById('left-kpis')
    if (leftKpis) {
      const maxTarget = Math.max(1, ...stats.map((item) => Number(item.target || 0)))
      leftKpis.innerHTML = stats
        .map((item) => {
          const valuePart = splitValueUnit(item.value, item.unit)
          const pct = Math.max(8, Math.min(100, Math.round(((Number(item.target || 0) || 0) / maxTarget) * 100)))
          return `
            <div class="Lkpi">
              <div>
                <div class="Lnum">${escapeHtml(valuePart.value)}${valuePart.unit ? `<span class="Lunit">${escapeHtml(valuePart.unit)}</span>` : ''}</div>
                <div class="Lbar"><div class="Lbarfill" data-w="${pct}%" style="width:0"></div></div>
              </div>
              <div class="Linfo"><div class="Llabel">${escapeHtml(item.label || '关键指标').replace(/\s+/g, '<br>')}</div></div>
            </div>
          `
        })
        .join('')
    }

    const leftNav = document.getElementById('left-nav')
    if (leftNav) {
      leftNav.innerHTML = navConfig
        .map(
          (item, index) =>
            `<button class="Lni ${index === 0 ? 'on' : ''}" type="button" data-target="${item.id}" onclick="goTo('${item.id}',this)">● ${escapeHtml(item.label)}<span class="Lnarrow">›</span></button>`,
        )
        .join('')
    }

    const ovList = document.getElementById('ov-list')
    if (ovList) {
      ovList.innerHTML = overview
        .map((item, index) => {
          const colors = ['#C44235', '#7BAE7F', '#4A6B9A', '#8B6A2A', '#7B5E4A', '#4B6A9A']
          return `
            <div class="Eitem">
              <div class="Enum">${String(index + 1).padStart(2, '0')}</div>
              <div>
                <div class="Ecat" style="color:${colors[index % colors.length]}">${escapeHtml(item.tag || '要点')}</div>
                <div class="Etitle">${escapeHtml(item.title || '待补充标题')}</div>
                <div class="Ebody">${escapeHtml(item.body || '暂无补充说明。')}</div>
              </div>
            </div>
          `
        })
        .join('')
    }

    const sectionMap = {
      'wk-grid': groups.internal || [],
      'co-grid': groups.cooperation || [],
      'vi-grid': groups.visit || [],
      'sy-grid': groups.system || [],
    }
    Object.entries(sectionMap).forEach(([id, items]) => {
      const node = document.getElementById(id)
      if (node) node.innerHTML = items.map(renderWorkCell).join('')
    })

    const bigRow = document.getElementById('dt-bigrow')
    const metricCards = (data.keyMetrics || stats).slice(0, 4)
    if (bigRow) {
      bigRow.innerHTML = metricCards
        .map((item, index) => {
          const valuePart = splitValueUnit(item.value, item.unit)
          const colors = ['#C44235', '#1B2B1E', '#7BAE7F', '#AA7A4A']
          return `<div class="Bcell"><div class="Bnum" style="color:${colors[index % colors.length]}">${escapeHtml(valuePart.value)}</div><div class="Blabel">${escapeHtml(item.label || '指标').replace(/\s+/g, '<br>')}</div></div>`
        })
        .join('')
    }

    const cooperationBars = document.getElementById('dt-cooperation-bars')
    if (cooperationBars) {
      cooperationBars.innerHTML = (data.cooperation || [])
        .slice(0, 6)
        .map((item) => {
          const meta = toneMeta(item)
          return `<div class="Bitem"><div class="Bname">${escapeHtml(item.title || '合作项')}</div><div class="Btrack"><div class="Bfill" data-w="${escapeHtml(String(item.progress || 0))}%" style="width:0;background:${meta.fill}"></div></div><div class="Bval">${escapeHtml(String(item.progress || 0))}%</div></div>`
        })
        .join('')
    }

    const defenseTitle = document.getElementById('dt-defense-title')
    const defenseLegend = document.getElementById('dt-defense-legend')
    const defense = data.defense || {}
    const defenseRows = [
      { name: '开题通过', value: defense.pass || 0, color: '#7BAE7F' },
      { name: '未通过', value: defense.fail || 0, color: '#C44235' },
      { name: '修改后通过', value: defense.revised || 0, color: '#AA7A4A' },
      { name: '博资考通过', value: defense.exam || 0, color: '#4A7AAA' },
    ]
    if (defenseTitle) defenseTitle.textContent = `博士生答辩结果（共${defense.total || 0}人）`
    if (defenseLegend) {
      defenseLegend.innerHTML = defenseRows
        .map((item) => `<div class="Drow"><div class="Ddot" style="background:${item.color}"></div><div class="Dname">${escapeHtml(item.name)}</div><div class="Dval">${escapeHtml(String(item.value))}</div></div>`)
        .join('')
    }

    const rightFooter = document.getElementById('right-footer')
    if (rightFooter) {
      rightFooter.innerHTML = `
        <div><div class="Rflabel">报送对象</div><div class="Rfval">${escapeHtml(footer.recipient || '相关负责人')}</div></div>
        <div><div class="Rflabel">发送范围</div><div class="Rfval">${escapeHtml(footer.distribution || '相关部门')}</div></div>
        <div><div class="Rflabel">签发日期</div><div class="Rfval">${escapeHtml(footer.date || '')}</div></div>
      `
    }

    const applyProgressTargets = () => {
      document.querySelectorAll('[data-w]').forEach((el) => {
        const target = el.getAttribute('data-w')
        if (target) {
          el.style.width = target
        }
      })
    }

    if (isPreviewLite) {
      document.querySelectorAll('.rev,.Wcell,.Eitem').forEach((el) => el.classList.add('vis'))
      applyProgressTargets()
    } else {
      window.setTimeout(() => {
        applyProgressTargets()
      }, 120)

      const rp = document.getElementById('rp')
      const observerRoot = getScrollHost() === window ? null : rp
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return
            entry.target.classList.add('vis')
            entry.target.querySelectorAll('.Wcell,.Eitem').forEach((el, index) => {
              window.setTimeout(() => el.classList.add('vis'), index * 24)
            })
            io.unobserve(entry.target)
          })
        },
        { threshold: 0.04, root: observerRoot },
      )
      document.querySelectorAll('.rev,.Wgrid,.Elist,.Bigrow,.Vtwo').forEach((el) => io.observe(el))
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

window.goTo = function goTo(id, btn) {
  const host = (() => {
    const rp = document.getElementById('rp')
    if (!rp) return window
    const style = window.getComputedStyle(rp)
    const canScroll = /(auto|scroll)/.test(style.overflowY) && rp.scrollHeight > rp.clientHeight + 4
    return canScroll ? rp : window
  })()
  const el = document.getElementById(id)
  if (el && host === window) {
    const targetTop = window.scrollY + el.getBoundingClientRect().top - MOBILE_SCROLL_OFFSET
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' })
  } else if (el && host) {
    host.scrollTo({ top: Math.max(el.offsetTop - DESKTOP_SCROLL_OFFSET, 0), behavior: 'smooth' })
  }
  document.querySelectorAll('.Lni').forEach((n) => n.classList.remove('on'))
  if (btn) btn.classList.add('on')
}

const syncNavActiveState = () => {
  const ids = ['ov', 'wk', 'co', 'vi', 'sy', 'dt']
  const host = (() => {
    const rp = document.getElementById('rp')
    if (!rp) return window
    const style = window.getComputedStyle(rp)
    const canScroll = /(auto|scroll)/.test(style.overflowY) && rp.scrollHeight > rp.clientHeight + 4
    return canScroll ? rp : window
  })()

  const currentPosition = host === window ? window.scrollY + MOBILE_SCROLL_OFFSET : host.scrollTop + DESKTOP_SCROLL_OFFSET + 28
  let current = 0

  ids.forEach((id, idx) => {
    const section = document.getElementById(id)
    if (!section) return
    const sectionTop = host === window ? window.scrollY + section.getBoundingClientRect().top : section.offsetTop
    if (currentPosition >= sectionTop) current = idx
  })

  document.querySelectorAll('.Lni').forEach((node, idx) => node.classList.toggle('on', idx === current))
}

const bindNavScroll = () => {
  const rp = document.getElementById('rp')
  const host = (() => {
    if (!rp) return window
    const style = window.getComputedStyle(rp)
    const canScroll = /(auto|scroll)/.test(style.overflowY) && rp.scrollHeight > rp.clientHeight + 4
    return canScroll ? rp : window
  })()

  let rafId = 0
  const onScroll = () => {
    if (rafId) return
    rafId = requestAnimationFrame(() => {
      syncNavActiveState()
      rafId = 0
    })
  }

  host.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', () => syncNavActiveState(), { passive: true })
  syncNavActiveState()
}

bindNavScroll()

function exportHTML() {
  const blob = new Blob(['<!DOCTYPE html>\n' + document.documentElement.outerHTML], { type: 'text/html' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = '周报_分屏杂志版.html'
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 3000)
}
