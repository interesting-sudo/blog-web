import { defineStore } from 'pinia'
import { login as loginApi, refreshToken as refreshTokenApi, getUserInfo } from '@/api/user'
import { parseToken } from '@/utils/token-helper'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    tokenExpiration: 0,
    rememberMe: localStorage.getItem('rememberMe') === 'true',
    userInfo: {
      id: null,
      username: '',
      nickname: '',
      avatarUrl: '',
      gender: '男',
      motto: '',
      roleId: null
    },
    // 刷新令牌 Promise 链，用于处理并发刷新请求
    refreshPromise: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => {
      if (state.userInfo.id) return state.userInfo.id
      if (state.token) {
        const decoded = parseToken(state.token)
        return decoded ? (decoded.userId || decoded.sub) : null
      }
      return null
    },
    userRole: (state) => state.userInfo.roleId,
    isAdmin: (state) => state.userInfo.roleId === 1,
    userNickname: (state) => state.userInfo.nickname || '用户',
    userAvatar: (state) => state.userInfo.avatarUrl || '用户头像',
    userGender: (state) => state.userInfo.gender || '男',
    userMotto: (state) => state.userInfo.motto || '',
    userName: (state) => state.userInfo.username || ''
  },
  
  actions: {
    // Login action
    async login(loginForm) {
      try {
        const res = await loginApi(loginForm)
        if (res.code === 200) {
          const { accessToken, expiresIn } = res.data
          
          this.setToken(accessToken, expiresIn, loginForm.rememberMe)
          
          // Manually set nickname from login form as it might not be in the token
          if (loginForm.username) {
            this.userInfo.nickname = loginForm.username
          }
          
          // 刷新用户信息
          await this.fetchUserInfo()
          
          return res
        } else {
          throw new Error(res.msg || '登录失败')
        }
      } catch (error) {
        throw error
      }
    },

    // Set token and update state
    setToken(token, expiresIn, rememberMe = false) {
      this.token = token
      this.rememberMe = rememberMe
      
      // 标记当前会话已登录（刷新页面不丢失）
      sessionStorage.setItem('hasLogin', 'true')

      // Manually manage rememberMe persistence
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      } else {
        localStorage.removeItem('rememberMe')
      }

      if (expiresIn) {
        const expirationTime = Date.now() + expiresIn * 1000
        this.tokenExpiration = expirationTime
      }
      
      // Parse token to extract user info
      const claims = parseToken(token)
      if (claims) {
        // Backend: .setSubject(userId) -> sub
        // Backend: .claim("roleId", roleId) -> roleId
        this.userInfo.id = claims.sub || claims.userId
        this.userInfo.roleId = claims.roleId || claims.roles || null
      }
    },

    // Logout
    logout() {
      this.token = ''
      this.tokenExpiration = 0
      this.userInfo = { id: null, username: '', nickname: '', avatarUrl: '', gender: '男', motto: '', roleId: null }
      
      sessionStorage.removeItem('hasLogin')
      // Removed localStorage removal for token (since we don't store it there anymore)
    },

    // 后台静默恢复会话，不阻塞路由跳转
    async restoreSession() {
      // If a refresh is already in progress, wait for it
      if (this.refreshPromise) {
        return this.refreshPromise
      }

      this.refreshPromise = (async () => {
        try {
          const res = await refreshTokenApi()
          if (res.code === 200 && res.data) {
            const { accessToken, expiresIn } = res.data
            this.setToken(accessToken, expiresIn, this.rememberMe)
            
            // Refresh user info
            // Skip waiting for refreshPromise to avoid deadlock
            await this.fetchUserInfo({ skipRefreshWait: true })
            return true
          }
          return false
        } catch (error) {
          // Silent failure is okay here, user just stays logged out
          return false
        } finally {
           this.refreshPromise = null
        }
      })()

      return this.refreshPromise
    },

    // Fetch User Info manually
    async fetchUserInfo(config = {}) {
      const id = this.userId
      if (!id) return

      try {
        const res = await getUserInfo(id, config)
        if (res.code === 200 && res.data) {
          const u = res.data
          // Backend might return 'id' or 'userId'
          this.userInfo.id = u.userId || u.id || this.userInfo.id
          this.userInfo.username = u.username || this.userInfo.username
          this.userInfo.nickname = u.nickname || this.userInfo.nickname
          this.userInfo.avatarUrl = u.avatarUrl || this.userInfo.avatarUrl
          this.userInfo.gender = u.gender || this.userInfo.gender
          this.userInfo.motto = u.motto || u.bio || this.userInfo.motto
          this.userInfo.roleId = u.roleId || this.userInfo.roleId
          
          return u
        }
      } catch (error) {
        console.warn('Failed to fetch user info:', error)
      }
    }
  }
})
