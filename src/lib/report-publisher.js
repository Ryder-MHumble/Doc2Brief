function buildPublishEndpoint() {
  const baseUrl = String(import.meta.env.VITE_REPORT_API_BASE_URL || '').trim().replace(/\/+$/, '')
  if (!baseUrl) {
    return '/api/reports/publish'
  }
  return `${baseUrl}/api/reports/publish`
}

export async function publishReportHtml(payload) {
  const endpoint = buildPublishEndpoint()
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const rawText = await response.text()
  let data = {}
  if (rawText) {
    try {
      data = JSON.parse(rawText)
    } catch {
      data = { message: rawText }
    }
  }

  if (!response.ok) {
    const message = data.message || `发布失败（HTTP ${response.status}）`
    throw new Error(message)
  }

  if (!data.shareUrl) {
    throw new Error('发布接口未返回 shareUrl')
  }

  return data
}
