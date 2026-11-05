import router from './router'
import { useUserStore } from './store/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register', '/forgot-password', '/404', '/500', '/401'] // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      next()
    }
  } else {
    // 检查是否需要尝试恢复会话
    // 只有当用户之前选择了“记住我”或者当前会话曾经登录过时才尝试恢复
    const hasLoginSession = sessionStorage.getItem('hasLogin') === 'true'
    const shouldRestore = userStore.rememberMe || hasLoginSession

    if (shouldRestore) {
      // 后台静默恢复会话，不阻塞路由跳转
      // 请求拦截器会处理需要 Token 的 API 请求
      userStore.restoreSession().catch(err => {
        console.warn('Session restore failed:', err)
      })
    }

    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      // 对于受保护的页面：
      // 1. 如果有 rememberMe 或 hasLoginSession，我们乐观地放行 (Optimistic UI)
      //    页面会立即渲染，API 请求会被拦截器挂起直到 restoreSession 完成
      //    如果 restoreSession 失败，API 请求会报 401，然后跳转到登录页
      // 2. 如果没有任何登录标记，说明肯定是未登录状态，直接跳登录页
      if (shouldRestore) {
        next()
      } else {
        next(`/login?redirect=${to.path}`)
        NProgress.done()
      }
    }
  }
})

router.afterEach((to) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  } else {
    document.title = 'iblog' // 默认标题
  }
  NProgress.done()
})
