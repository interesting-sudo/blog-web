<template>
  <div class="navbar-placeholder">
    <el-header class="app-header">
      <div class="header-inner">
        <div class="header-center">
          <div class="brand" @click="goTo('/home')">
            <span class="logo-icon">✨</span>
            <span class="brand-title">iBlog</span>
          </div>

          <div class="nav-pill">
            <div
              v-for="item in navItems"
              :key="item.key"
              class="nav-item"
              :class="{ active: activeNavKey === item.key }"
              @click="handleNavClick(item.path)"
            >
              <el-icon class="nav-icon">
                <component :is="item.icon" />
              </el-icon>
              <span class="nav-label">{{ item.label }}</span>
            </div>
          </div>

          <div class="header-right">
            <template v-if="userStore.isLoggedIn">
              <el-dropdown>
                <div class="user-profile">
                  <el-avatar
                    :size="32"
                    :src="userStore.userInfo.avatarUrl || defaultAvatar"
                  />
                  <span class="username">{{ userStore.userNickname }}</span>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="userStore.isAdmin" @click="goToAdmin">
                      进入后台
                    </el-dropdown-item>
                    <el-dropdown-item @click="goTo('/my-home')">
                      我的主页
                    </el-dropdown-item>
                    <el-dropdown-item @click="goTo('/publish')">
                      创作文章
                    </el-dropdown-item>
                    <el-dropdown-item @click="goTo('/settings')">
                      个人设置
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button
                round
                type="primary"
                class="login-btn"
                @click="goTo('/login')"
              >
                登录
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </el-header>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, EditPen, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isViewingSelfHome = computed(() => {
  const path = route.path
  if (!path.startsWith('/my-home')) return true
  const loggedId = userStore.userInfo.id
  const queryId = route.query.userId
  if (!queryId) return true
  if (!loggedId) return false
  return String(queryId) === String(loggedId)
})

const navItems = computed(() => [
  { key: 'explore', label: '探索', path: '/home', icon: HomeFilled },
  { key: 'create', label: '创作', path: '/publish', icon: EditPen },
  { key: 'mine', label: isViewingSelfHome.value ? '我的' : '主页', path: '/my-home', icon: User }
])

const activeNavKey = computed(() => {
  const path = route.path
  if (path.startsWith('/publish')) return 'create'
  if (
    path.startsWith('/my-home') ||
    path.startsWith('/settings') ||
    path.startsWith('/change-password')
  ) {
    return 'mine'
  }
  return 'explore'
})

const defaultAvatar =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const goTo = (path) => {
  if (route.path !== path) {
    router.push(path)
  }
}

const goToAdmin = () => {
  router.push('/admin')
}

const handleNavClick = (path) => {
  goTo(path)
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

.navbar-placeholder {
  height: 80px; /* 预留出导航栏的高度，防止下方内容被遮挡 */
  width: 100%;
}

.app-header {
  background: transparent !important; /* 去掉整行白色背景 */
  padding: 12px 0 8px;
  border-bottom: none;
  box-shadow: none;
  position: fixed; /* 改为 fixed，确保在所有页面都绝对固定 */
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  height: 80px;
}

.header-inner {
  width: 100%;
  display: flex;
  justify-content: center;
}

.header-center {
  width: 100%;
  max-width: 1000px;
  height: 60px;
  padding: 0 24px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-pill {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: transparent;
  gap: 4px;
}

.brand {
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-right: 8px;
}

.logo-icon {
  font-size: 1.6rem;
}

.brand-title {
  margin-left: 6px;
  font-family: 'Dancing Script', cursive;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-items {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 999px;
  cursor: pointer;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.18s ease;
}

.nav-item:hover {
  background: #ffffff;
  color: #4f46e5;
}

.nav-item.active {
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(88, 80, 236, 0.25);
}

.nav-item.active .nav-icon {
  color: #ffffff;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.nav-label {
  white-space: nowrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.login-btn {
  padding: 8px 20px;
  font-weight: 600;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border: none;
}

.login-btn:hover {
  filter: brightness(1.05);
}
</style>
