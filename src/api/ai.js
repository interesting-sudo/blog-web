import request from '@/utils/request'

const isDemo = import.meta.env.VITE_DEMO_MODE === 'true'

/**
 * 演示模式下模拟流式输出，避免打到本地 8080 后端
 */
function demoStream(text, onMessage, onComplete) {
  const step = 5
  let i = 0
  const timer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(timer)
      if (onComplete) onComplete()
      return
    }
    if (onMessage) onMessage(text.slice(i, i + step))
    i += step
  }, 45)
}


// AI 生成标题
export function generateTitle(content) {
  return request({
    url: '/ai/title',
    method: 'post',
    data: {
      content
    },
    skipShowError: true
  })
}

// AI 生成标签
export function generateTags(content) {
  return request({
    url: '/ai/tags',
    method: 'post',
    data: {
      content
    },
    skipShowError: true
  })
}

// AI 生成摘要（流式）
// 注意：流式请求通常使用 fetch 或 EventSource，因为 axios 对流式支持不如原生 fetch 方便
// 这里我们提供一个基于 fetch 的 helper 函数
export async function generateSummaryStream(content, onMessage, onError, onComplete) {
  if (isDemo) {
    demoStream(
      '把单体后端按变更频率拆成网关、用户、内容、检索、AI 等七个服务，重点不是代码量变少，而是每次改动的影响半径变小。文中记录了边界划分、Nacos 注册、网关统一鉴权三个真实踩坑点。',
      onMessage,
      onComplete
    )
    return
  }
  try {
    const { useUserStore } = await import('@/store/user')
    const userStore = useUserStore()

    if (userStore.refreshPromise) {
      await userStore.refreshPromise
    }

    const token = userStore.token
    const baseURL = request.defaults.baseURL
    const doRequest = async () => {
      const response = await fetch(`${baseURL}/ai/summary/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify({ content })
      })

      return response
    }

    let response = await doRequest()

    if (response.status === 401) {
      const restored = await userStore.restoreSession()
      if (restored) {
        const newToken = userStore.token
        response = await fetch(`${baseURL}/ai/summary/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': newToken ? `Bearer ${newToken}` : ''
          },
          credentials: 'include',
          body: JSON.stringify({ content })
        })
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        if (onComplete) onComplete()
        break
      }
      
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        let data = line.slice(5).trim()
        if (!data) continue

        let isError = false
        let errorMsg = ''
        let text = ''

        if (data.startsWith('{') || data.startsWith('[')) {
          try {
            const parsed = JSON.parse(data)
            if (parsed && typeof parsed === 'object') {
              if (Object.prototype.hasOwnProperty.call(parsed, 'code')) {
                const code = parsed.code
                if (code !== 200) {
                  isError = true
                  errorMsg = parsed.msg || '生成摘要失败'
                } else if (parsed.data != null) {
                  text = String(parsed.data)
                }
              } else if (parsed.msg && !parsed.data) {
                isError = true
                errorMsg = parsed.msg
              }
            }
          } catch (e) {
            text = data
          }
        } else {
          if (data.includes('正文质量太差') || data.includes('无法生成摘要')) {
            isError = true
            errorMsg = data
          } else {
            text = data
          }
        }

        if (isError) {
          if (onError) onError(new Error(errorMsg))
          return
        }

        if (text && onMessage) {
          onMessage(text)
        }
      }
    }
  } catch (error) {
    if (onError) onError(error)
  }
}

/**
 * AI 选区内容处理（流式）
 * @param {Object} data - 请求参数 { selectedContent, userInstruction, contextBefore, contextAfter }
 * @param {Function} onMessage - 消息回调
 * @param {Function} onError - 错误回调
 * @param {Function} onComplete - 完成回调
 */
export async function processContentStream(data, onMessage, onError, onComplete) {
  if (isDemo) {
    demoStream(
      '（演示模式）这里会显示 AI 处理后的选区内容。接上真实后端后，它会根据你的指令对选中段落做改写、扩写或精简，并流式替换回编辑器。',
      onMessage,
      onComplete
    )
    return
  }
  try {
    const { useUserStore } = await import('@/store/user')
    const userStore = useUserStore()

    if (userStore.refreshPromise) {
      await userStore.refreshPromise
    }

    const token = userStore.token
    const baseURL = request.defaults.baseURL
    
    const doRequest = async () => {
      const response = await fetch(`${baseURL}/ai/process/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })
      return response
    }

    let response = await doRequest()

    // 处理 401
    if (response.status === 401) {
      const restored = await userStore.restoreSession()
      if (restored) {
        const newToken = userStore.token
        response = await fetch(`${baseURL}/ai/process/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': newToken ? `Bearer ${newToken}` : ''
          },
          credentials: 'include',
          body: JSON.stringify(data)
        })
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        if (onComplete) onComplete()
        break
      }
      
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        let rawData = line.slice(5).trim()
        if (!rawData) continue

        let text = ''
        // 尝试解析 JSON（后端 Flux<String> 通常直接返回字符串，但 SSE 规范可能会包装）
        if (rawData.startsWith('{') || rawData.startsWith('[')) {
          try {
            const parsed = JSON.parse(rawData)
            text = parsed.data || parsed.content || rawData
          } catch (e) { text = rawData }
        } else {
          text = rawData
        }

        if (text && onMessage) {
          onMessage(text)
        }
      }
    }
  } catch (error) {
    console.error('AI Process Stream Error:', error)
    if (onError) onError(error)
  }
}
