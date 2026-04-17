(() => {
  const MODULE_NAME = 'template-editorial-newspaper-runtime'
  const previewLite = Boolean(window.__Doc2Brief_PREVIEW_LITE__)

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

  const toneClassMap = {
    red: 'jc-red',
    navy: 'jc-navy',
    gold: 'jc-gold',
  }

  const toArray = (value) => (Array.isArray(value) ? value : [])

  const renderSectionBand = (section, extraClass = '') => `
    <div class="j-secband j-reveal ${extraClass}" id="${escapeHtml(section.id || '')}">
      <div class="jsb-bar"></div>
      <span class="jsb-num">${escapeHtml(section.ordinal || '')}</span>
      <span class="jsb-cn">${escapeHtml(section.title || '')}</span>
      <span class="jsb-en">${escapeHtml(section.enTitle || '')}</span>
      <div class="jsb-rule"></div>
    </div>
  `

  const renderListBlock = (block) => `
    <div class="jc ${escapeHtml(block.span || 'c4')} ${toneClassMap[block.tone] || ''} j-reveal">
      <div class="ch"><div class="ch-dot"></div>${escapeHtml(block.title || '内容板块')}</div>
      ${toArray(block.items)
        .map(
          (item) => `
            <div class="it">
              <div class="it-title"><span class="it-mark">■</span>${escapeHtml(item.title || '待补充事项')}</div>
              <p class="it-body">${escapeHtml(item.body || '暂无补充说明。')}</p>
              ${item.meta ? `<span class="it-meta">${escapeHtml(item.meta)}</span>` : ''}
            </div>
          `,
        )
        .join('')}
    </div>
  `

  const renderStatsBlock = (block) => `
    <div class="jc ${escapeHtml(block.span || 'c2')} jc-stat j-reveal">
      ${toArray(block.items)
        .map(
          (item) => `
            <div class="stat-group">
              <div class="stat-n">${escapeHtml(item.value || '--')}</div>
              <div class="stat-u">${escapeHtml(item.unit || '')}</div>
              <div class="stat-l">${escapeHtml(item.label || '关键指标')}</div>
            </div>
          `,
        )
        .join('')}
    </div>
  `

  const renderPullquoteBlock = (block) => `
    <div class="jc ${escapeHtml(block.span || 'c2')} jc-pull j-reveal">
      <div class="pull-eye">${escapeHtml(block.eye || '本周焦点')}</div>
      <div class="pull-quote">${escapeHtml(block.quote || '暂无焦点').replace(/\n/g, '<br />')}</div>
      <div class="pull-rule"></div>
      <div class="pull-sub">${escapeHtml(block.sub || '暂无补充说明。')}</div>
    </div>
  `

  const renderBlock = (block) => {
    if (block.type === 'stats') return renderStatsBlock(block)
    if (block.type === 'pullquote') return renderPullquoteBlock(block)
    return renderListBlock(block)
  }

  const renderSpecialItem = (item) => `
    <div class="j-special j-reveal">
      <div class="special-label">${escapeHtml(item.label || '▶ 风险提示')}</div>
      <div class="special-body">
        <div class="special-title">${escapeHtml(item.title || '待补充标题')}</div>
        <p class="special-text">${escapeHtml(item.text || '暂无补充说明。')}</p>
        <div class="special-tags">
          ${toArray(item.tags)
            .map((tag) => `<span class="special-tag">${escapeHtml(tag)}</span>`)
            .join('')}
        </div>
      </div>
    </div>
  `

  const renderPlanCard = (item, index) => `
    <div class="plan-card j-reveal j-d${(index % 4) + 1}">
      <div class="pc-tags">
        <span class="pc-tag">${escapeHtml(item.tag || '推进事项')}</span>
        <span class="pc-deadline">截止 ${escapeHtml(item.deadline || '待补充')}</span>
      </div>
      <div class="pc-title">${escapeHtml(item.title || '待补充标题')}</div>
      <p class="pc-body">${escapeHtml(item.body || '暂无补充说明。')}</p>
      <span class="pc-owner">负责人：${escapeHtml(item.owner || '待分配')}</span>
    </div>
  `

  const setupScrollProgress = () => {
    const progressBar = document.getElementById('j-progress-bar')
    const backToTop = document.getElementById('j-btt')
    if (!progressBar || !backToTop) return

    const sync = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const ratio = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0
      progressBar.style.width = `${ratio}%`
      backToTop.classList.toggle('show', window.scrollY > 500)
    }

    sync()
    window.addEventListener('scroll', sync, { passive: true })
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  const setupReveal = () => {
    const targets = document.querySelectorAll('.j-reveal')
    if (previewLite || typeof window.IntersectionObserver !== 'function') {
      targets.forEach((node) => node.classList.add('j-in'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('j-in')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.04, rootMargin: '0px 0px -24px 0px' },
    )

    targets.forEach((node) => observer.observe(node))
  }

  const setupToc = () => {
    const tocLinks = document.querySelectorAll('.toc-link')
    const sections = document.querySelectorAll('[id^="s-"]')

    tocLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault()
        const target = document.querySelector(link.getAttribute('href') || '')
        const toc = document.getElementById('j-toc')
        if (!target || !toc) return
        const nextTop = target.getBoundingClientRect().top + window.scrollY - toc.offsetHeight - 8
        window.scrollTo({ top: nextTop, behavior: 'smooth' })
      })
    })

    if (previewLite || typeof window.IntersectionObserver !== 'function') {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          tocLinks.forEach((link) => link.classList.remove('is-active'))
          const activeLink = document.querySelector(`.toc-link[href="#${entry.target.id}"]`)
          if (activeLink) activeLink.classList.add('is-active')
        })
      },
      { threshold: 0.25, rootMargin: '-10% 0px -65% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
  }

  const setupAccessibility = () => {
    document.querySelectorAll('.it, .plan-card').forEach((node) => node.setAttribute('tabindex', '0'))
  }

  try {
    const startedAt = performance.now()
    logSystem('info', '模板启动', { previewLite })

    const payload = readPayload()
    const vm = payload.viewModel?.editorialNewspaper || {}
    const masthead = vm.masthead || {}
    const note = vm.note || {}
    const sections = toArray(vm.sections)
    const toc = toArray(vm.toc)
    const special = vm.special || {}
    const plan = vm.plan || {}
    const footer = vm.footer || {}

    document.title = masthead.title || payload.meta?.title || '电子报刊周报'

    const textBindings = [
      ['np-org-name', masthead.orgName],
      ['np-dept-name', masthead.deptName],
      ['np-vol-info', masthead.volInfo],
      ['np-title', masthead.title || payload.meta?.title],
      ['np-title-en', masthead.titleEn],
      ['np-issue-number', masthead.issueNumber],
      ['np-date-range', masthead.dateRange || payload.meta?.subtitle],
      ['np-week-label', masthead.weekLabel],
      ['np-editorial-info', masthead.editorialInfo],
      ['np-motto', masthead.motto],
      ['np-badge', masthead.badge],
      ['np-note-eyebrow', note.eyebrow],
      ['np-note-text', note.text || payload.meta?.summary],
      ['np-footer-dept', footer.department],
      ['np-footer-cn', footer.disclaimerCn],
      ['np-footer-en', footer.disclaimerEn],
      ['np-footer-issue', footer.issueText],
      ['np-footer-date', footer.publishDate ? `出版日期：${footer.publishDate}` : '出版日期：待补充'],
    ]

    textBindings.forEach(([id, value]) => {
      const node = document.getElementById(id)
      if (node && value) node.textContent = value
    })

    const tocLinks = document.getElementById('np-toc-links')
    if (tocLinks) {
      tocLinks.innerHTML = toc
        .map((item) => `<a class="toc-link" href="#${escapeHtml(item.id || '')}">${escapeHtml(item.label || '目录项')}</a>`)
        .join('')
    }

    const mainGrid = document.getElementById('np-main-grid')
    if (mainGrid) {
      mainGrid.innerHTML = [
        ...sections.map((section) => `${renderSectionBand(section)}${toArray(section.blocks).map(renderBlock).join('')}`),
        renderSectionBand(special, 'is-accent'),
        ...toArray(special.items).map(renderSpecialItem),
        renderSectionBand(plan, 'is-plan'),
        `<div class="j-plan-wrap j-reveal"><div class="plan-grid">${toArray(plan.items)
          .map(renderPlanCard)
          .join('')}</div></div>`,
      ].join('')
    }

    setupScrollProgress()
    setupReveal()
    setupToc()
    setupAccessibility()

    logBusinessJson('render_payload', {
      toc: toc.length,
      sections: sections.length,
      specialItems: toArray(special.items).length,
      planItems: toArray(plan.items).length,
    })
    logSystem('info', '模板完成', { elapsedMs: Number((performance.now() - startedAt).toFixed(2)) })
  } catch (error) {
    logSystem('error', '模板渲染失败', { message: error instanceof Error ? error.message : String(error) })
  }
})()
