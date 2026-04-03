import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const staleChunkReloadMarkKey = 'reportflow-stale-chunk-reload-at'

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault()

  const now = Date.now()
  const previousReloadAt = Number(window.sessionStorage.getItem(staleChunkReloadMarkKey) || 0)
  const canRetryReload = !Number.isFinite(previousReloadAt) || now - previousReloadAt > 10_000

  console.warn(
    `系统日志 | 模块=前端启动 | 事件=检测到动态资源加载失败 | 内容=${JSON.stringify({
      message: event.payload?.message || 'vite preload error',
      canRetryReload,
    })}`,
  )

  if (!canRetryReload) {
    return
  }

  window.sessionStorage.setItem(staleChunkReloadMarkKey, String(now))
  window.location.reload()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
