import { useEffect, useRef, useState } from 'react'

const desktopMinFrameHeight = 960
const mobileMinFrameHeight = 760
const mobileFrameWidth = 390

function extractIframeHtml(iframeElement) {
  const documentElement = iframeElement?.contentDocument?.documentElement
  if (!documentElement) {
    return ''
  }
  return `<!doctype html>\n${documentElement.outerHTML}`
}

function toggleIframeEditing(iframeElement, enabled) {
  const doc = iframeElement?.contentDocument
  if (!doc?.body) {
    return
  }

  const styleId = '__docs2brief_inline_edit_style__'
  const existingStyle = doc.getElementById(styleId)

  if (enabled) {
    doc.designMode = 'on'
    doc.body.setAttribute('contenteditable', 'true')

    if (!existingStyle) {
      const style = doc.createElement('style')
      style.id = styleId
      style.textContent = `
html {
  scroll-behavior: smooth;
}

body[contenteditable="true"] {
  caret-color: #0ea5e9;
  outline: 3px solid rgba(14, 165, 233, 0.2);
  outline-offset: -6px;
}

body[contenteditable="true"] *:focus {
  outline: 2px dashed rgba(14, 165, 233, 0.42);
  outline-offset: 3px;
}

body[contenteditable="true"] ::selection {
  background: rgba(14, 165, 233, 0.2);
}
`
      doc.head.append(style)
    }

    return
  }

  doc.designMode = 'off'
  doc.body.removeAttribute('contenteditable')
  existingStyle?.remove()
}

export function PreviewPane({
  copiedReady,
  copyReady,
  exportReady,
  fullscreenTargetRef,
  fullscreenReady,
  hasEditedContent,
  iframeHtml,
  iframeKey,
  isEditMode,
  onApplyEdit,
  onCancelEdit,
  onCopyLink,
  onDeviceChange,
  onEditChange,
  onEditStart,
  onExport,
  onFullscreen,
  previewDevice,
  previewStageRef,
  previewState,
  previewTitle,
}) {
  const [frameHeight, setFrameHeight] = useState(desktopMinFrameHeight)
  const [frameReady, setFrameReady] = useState(false)
  const iframeRef = useRef(null)
  const boundDocumentRef = useRef(null)
  const boundInputHandlerRef = useRef(null)
  const measureTimersRef = useRef([])

  const clearMeasureTimers = () => {
    measureTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    measureTimersRef.current = []
  }

  const getFallbackFrameHeight = () => (previewDevice === 'mobile' ? mobileMinFrameHeight : desktopMinFrameHeight)

  const syncFrameLayout = () => {
    const iframeElement = iframeRef.current
    const doc = iframeElement?.contentDocument
    const root = doc?.documentElement
    const body = doc?.body

    if (!root || !body) {
      return
    }

    const nextHeight = Math.max(
      root.scrollHeight,
      body.scrollHeight,
      root.offsetHeight,
      body.offsetHeight,
      getFallbackFrameHeight(),
    )

    setFrameHeight((prev) => (Math.abs(prev - nextHeight) > 2 ? nextHeight : prev))
    setFrameReady(true)
  }

  const scheduleFrameMeasurement = () => {
    clearMeasureTimers()

    const runMeasurement = () => {
      window.requestAnimationFrame(() => {
        syncFrameLayout()
      })
    }

    runMeasurement()
    measureTimersRef.current = [80, 240, 520].map((delay) => window.setTimeout(runMeasurement, delay))
  }

  const detachInputListener = () => {
    if (boundDocumentRef.current && boundInputHandlerRef.current) {
      boundDocumentRef.current.removeEventListener('input', boundInputHandlerRef.current, true)
    }
    boundDocumentRef.current = null
    boundInputHandlerRef.current = null
  }

  const syncEditorMode = () => {
    const iframeElement = iframeRef.current
    const doc = iframeElement?.contentDocument
    if (!doc?.body) {
      return
    }

    detachInputListener()
    toggleIframeEditing(iframeElement, isEditMode)

    if (!isEditMode) {
      scheduleFrameMeasurement()
      return
    }

    const handleInput = () => {
      onEditChange({ htmlLength: extractIframeHtml(iframeElement).length })
      scheduleFrameMeasurement()
    }

    doc.addEventListener('input', handleInput, true)
    boundDocumentRef.current = doc
    boundInputHandlerRef.current = handleInput
    scheduleFrameMeasurement()
  }

  const captureCurrentHtml = () => extractIframeHtml(iframeRef.current)

  const handleEditToggle = () => {
    onEditStart()
  }

  const handleApplyClick = () => {
    const currentHtml = captureCurrentHtml()
    if (!currentHtml) {
      return
    }
    onApplyEdit(currentHtml, { trigger: 'toolbar-save' })
  }

  const handleCancelClick = () => {
    onCancelEdit()
  }

  const handleExportClick = () => {
    onExport()
  }

  const handleCopyClick = () => {
    void onCopyLink()
  }

  const handleFrameLoad = () => {
    setFrameReady(false)
    syncEditorMode()
    scheduleFrameMeasurement()
  }

  useEffect(() => {
    setFrameReady(false)
    setFrameHeight(getFallbackFrameHeight())

    const frameRequest = window.requestAnimationFrame(() => {
      scheduleFrameMeasurement()
    })

    return () => {
      window.cancelAnimationFrame(frameRequest)
    }
  }, [iframeHtml, iframeKey, previewDevice])

  useEffect(() => {
    syncEditorMode()
    return () => {
      detachInputListener()
      clearMeasureTimers()
    }
  }, [iframeHtml, iframeKey, isEditMode])

  useEffect(() => {
    const handleResize = () => {
      scheduleFrameMeasurement()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [iframeHtml, iframeKey, previewDevice])

  const canEdit = previewState === 'done' && Boolean(iframeHtml)
  const frameSource = iframeHtml || '<!doctype html><html><head><meta charset="utf-8" /></head><body></body></html>'

  return (
    <section className={`preview-pane-shell glass-panel preview-pane-shell--${previewState}`}>
      <div className="preview-toolbar">
        <div className="preview-toolbar__left">
          <div className="device-toggle">
            <button
              className={previewDevice === 'desktop' ? 'is-active' : ''}
              onClick={() => onDeviceChange('desktop')}
              type="button"
            >
              网页视图
            </button>
            <button
              className={previewDevice === 'mobile' ? 'is-active' : ''}
              onClick={() => onDeviceChange('mobile')}
              type="button"
            >
              手机视图
            </button>
          </div>

          {!isEditMode ? (
            <button className="toolbar-button toolbar-button--ghost" disabled={!canEdit} onClick={handleEditToggle} type="button">
              <span className="toolbar-button__icon" aria-hidden="true">
                ✎
              </span>
              <span>{hasEditedContent ? '继续润色' : '编辑内容'}</span>
            </button>
          ) : (
            <>
              <button className="toolbar-button toolbar-button--primary" onClick={handleApplyClick} type="button">
                <span className="toolbar-button__icon" aria-hidden="true">
                  ✓
                </span>
                <span>应用修改</span>
              </button>
              <button className="toolbar-button toolbar-button--ghost" onClick={handleCancelClick} type="button">
                <span className="toolbar-button__icon" aria-hidden="true">
                  ↺
                </span>
                <span>取消编辑</span>
              </button>
            </>
          )}
        </div>

        <div className="preview-toolbar__right">
          <button className="toolbar-button toolbar-button--ghost" disabled={!fullscreenReady} onClick={onFullscreen} type="button">
            <span className="toolbar-button__icon" aria-hidden="true">
              ⛶
            </span>
            <span>全屏</span>
          </button>
          <button
            className={`toolbar-button toolbar-button--ghost ${copiedReady ? 'toolbar-button--copied' : ''}`}
            disabled={!copyReady || isEditMode}
            onClick={handleCopyClick}
            type="button"
          >
            <span className="toolbar-button__icon" aria-hidden="true">
              ⧉
            </span>
            <span>{copiedReady ? '已复制' : '复制链接'}</span>
          </button>
          <button className="toolbar-button toolbar-button--primary" disabled={!exportReady || isEditMode} onClick={handleExportClick} type="button">
            <span className="toolbar-button__icon" aria-hidden="true">
              ⬇
            </span>
            <span>导出 HTML</span>
          </button>
        </div>
      </div>

      <div className={`preview-stage preview-stage--${previewState}`} ref={previewStageRef}>
        <div className="preview-atmosphere" aria-hidden="true">
          <span className="preview-atmosphere__aurora" />
          <span className="preview-atmosphere__rays" />
          <span className="preview-atmosphere__grain" />
        </div>

        <div className="preview-stage-body preview-stage-body--frame preview-stage-body--minimal">
          <div className="preview-fullscreen-target" ref={fullscreenTargetRef}>
            <div className={`preview-viewport ${previewDevice === 'mobile' ? 'is-mobile' : ''}`}>
              <div className="preview-viewport__scroll">
                <div className={`iframe-shell ${previewDevice === 'mobile' ? 'is-mobile' : ''} ${isEditMode ? 'is-editing' : ''}`}>
                  <iframe
                    key={iframeKey}
                    className={`preview-frame ${previewDevice === 'mobile' ? 'is-mobile' : ''} ${frameReady ? '' : 'is-measuring'}`}
                    onLoad={handleFrameLoad}
                    ref={iframeRef}
                    srcDoc={frameSource}
                    style={{
                      height: `${frameHeight}px`,
                      width: previewDevice === 'mobile' ? `${mobileFrameWidth}px` : '100%',
                    }}
                    title={previewTitle || 'Docs2Brief Preview'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
