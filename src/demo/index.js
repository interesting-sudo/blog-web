/**
 * 演示模式入口
 *
 * 开启方式：环境变量 VITE_DEMO_MODE=true（见 .env.demo / npm run build:demo）
 * 开启后：
 *   1. axios 换成 mock adapter，所有接口返回内置示例数据；
 *   2. 自动注入一个演示账号，跳过登录页直接进首页。
 * 所有 mock 资源都是动态 import，未开启时生产构建完全不会包含这部分代码。
 */
import { useUserStore } from '@/store/user'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export async function initDemo() {
  if (!isDemoMode) return

  const [{ default: demoAdapter }, { default: request }, mock] = await Promise.all([
    import('./adapter'),
    import('@/utils/request'),
    import('./mockData')
  ])

  // 1. 接管网络层
  request.defaults.adapter = demoAdapter

  // 2. 注入演示账号（管理员，便于同时展示后台页面）
  const store = useUserStore()
  store.token = mock.DEMO_TOKEN
  store.tokenExpiration = Date.now() + 7 * 24 * 3600 * 1000
  store.rememberMe = false
  store.userInfo = {
    id: mock.currentUser.id,
    username: mock.currentUser.username,
    nickname: mock.currentUser.nickname,
    avatarUrl: mock.currentUser.avatarUrl,
    gender: mock.currentUser.gender,
    motto: mock.currentUser.motto,
    roleId: 1
  }
  sessionStorage.setItem('hasLogin', 'true')

  // 3. 页面上给个明确标识，避免被误当成真实数据
  const badge = document.createElement('div')
  badge.textContent = '演示模式 · 数据为示例内容'
  badge.style.cssText = [
    'position:fixed',
    'right:14px',
    'bottom:14px',
    'z-index:99999',
    'padding:6px 12px',
    'border-radius:999px',
    'font:500 12px/1.4 -apple-system,Segoe UI,Helvetica,Arial,sans-serif',
    'color:#fff',
    'background:linear-gradient(135deg,#6366f1,#8b5cf6)',
    'box-shadow:0 6px 18px rgba(99,102,241,.35)',
    'pointer-events:none',
    'opacity:.92'
  ].join(';')
  document.body.appendChild(badge)
}
