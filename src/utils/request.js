import axios from 'axios'
import { ElMessage } from 'element-plus'
import JSONbig from 'json-bigint'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
  withCredentials: true, // 允许携带 cookie
  transformResponse: [function (data) {
    try {
      // 使用 json-bigint 解析数据，将长整型转换为字符串，避免精度丢失
      return JSONbig({ storeAsString: true }).parse(data)
    } catch (err) {
      return data
    }
  }]
})


// 请求拦截器
service.interceptors.request.use(
  async config => {
    // 在发送请求之前做些什么
    // 使用动态导入解决循环依赖
    const { useUserStore } = await import('@/store/user')
    const userStore = useUserStore()

    // 如果当前正在进行 Token刷新（静默登录），且当前请求不是刷新请求本身
    // 并且该请求没有被标记为跳过等待（例如获取用户信息的请求）
    // 则等待刷新完成后再继续
    if (userStore.refreshPromise && !config.url.includes('/auth/refresh') && !config.skipRefreshWait) {
      await userStore.refreshPromise
    }

    const token = userStore.token
    if (token && !config.skipToken) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 根据后端约定的状态码判断，200 为成功
    if (res.code === 200) {
      return res
    } else {
      // 如果配置了 skipShowError，则不显示全局错误提示
      if (response.config.skipShowError) {
        return res
      }
      // 非 200 状态码，显示错误信息
      ElMessage({
        message: res.msg || '系统错误',
        type: 'error',
        duration: 5 * 1000
      })
      return res
    }
  },
  async error => {
    console.log('err' + error)
    
    // 使用动态导入解决循环依赖
    const { useUserStore } = await import('@/store/user')
    const userStore = useUserStore()
    const router = (await import('@/router')).default

    // --- 灾难性错误（宕机/500/超时）优先处理，不受 skipShowError 影响 ---
    // 1. 没有 response 说明服务器完全没响应（宕机、断网、跨域等）
    // 2. response.status >= 500 说明服务器崩溃
    // 3. ECONNABORTED 说明请求超时
    const isNetworkError = !error.response
    const isServerError = error.response && error.response.status >= 500
    const isTimeout = error.code === 'ECONNABORTED'

    if (isNetworkError || isServerError || isTimeout) {
      if (!window.location.pathname.includes('/500')) {
        const from = encodeURIComponent(window.location.pathname + window.location.search)
        const targetUrl = `/500?from=${from}`
        
        console.error('检测到服务器不可用，正在跳转 500 页面...', error)
        
        // 优先使用路由跳转，如果失败则强制刷新跳转
        try {
          router.push(targetUrl)
        } catch (e) {
          window.location.href = targetUrl
        }
        return Promise.reject(error)
      }
    }

    // 如果配置了 skipShowError，则不显示全局错误提示 (ElMessage)
    if (error.config && error.config.skipShowError) {
      return Promise.reject(error)
    }

    // 处理 401 未授权
    if (error.response && error.response.status === 401) {
      const config = error.config
      
      // 如果是刷新 Token 的请求本身报错，或者已经重试过了，则直接登出
      if (config.url.includes('/auth/refresh') || config._retry) {
        userStore.logout()
        router.push('/login')
        return Promise.reject(error)
      }

      config._retry = true
      
      try {
        // 尝试刷新 Token (restoreSession 内部有单例锁 refreshPromise)
        const success = await userStore.restoreSession()
        if (success) {
          // 重试当前请求
          config.headers['Authorization'] = 'Bearer ' + userStore.token
          return service(config)
        } else {
          // 刷新失败，登出
          userStore.logout()
          router.push('/login')
          return Promise.reject(error)
        }
      } catch (e) {
        userStore.logout()
        router.push('/login')
        return Promise.reject(e)
      }
    }

    let message = error.message
    if (error.response) {
      if (error.response.data && error.response.data.msg) {
        message = error.response.data.msg
      }
    }
    
    ElMessage({
      message: message,
      type: 'error',
      duration: 3 * 1000,
      grouping: true
    })
    return Promise.reject(error)
  }
)

export default service
