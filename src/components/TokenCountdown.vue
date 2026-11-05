<template>
  <transition name="slide-fade">
    <div v-if="isVisible" class="token-countdown" :class="{ 'is-warning': isWarning }">
      <div class="countdown-content">
        <el-icon class="icon"><Timer /></el-icon>
        <div class="time-wrapper">
          <span class="time">{{ formattedTime }}</span>
          <span class="label">{{ isRefreshing ? '刷新中...' : '认证令牌有效期' }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Timer } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const remainingTime = ref(0)
const timer = ref(null)
const isRefreshing = ref(false)

const isVisible = computed(() => {
  // 不在登录页显示，且剩余时间大于0
  return route.path !== '/login' && remainingTime.value > 0
})

const isWarning = computed(() => {
  return remainingTime.value < 300 // 少于5分钟变色
})

const formattedTime = computed(() => {
  if (remainingTime.value <= 0) return '00:00:00'
  const hours = Math.floor(remainingTime.value / 3600)
  const minutes = Math.floor((remainingTime.value % 3600) / 60)
  const seconds = remainingTime.value % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const checkTime = async () => {
  const expiration = userStore.tokenExpiration
  // 如果没有过期时间（可能是旧的登录状态或者未登录），不显示
  if (!expiration) {
    remainingTime.value = 0
    return
  }
  
  const now = Date.now()
  const expirationTime = parseInt(expiration, 10)
  
  // 安全检查
  if (isNaN(expirationTime)) {
    console.error('TokenCountdown: Invalid expiration time in store', expiration)
    remainingTime.value = 0
    return
  }

  const diff = Math.floor((expirationTime - now) / 1000)
  
  if (diff <= 30) {
    if (!isRefreshing.value) {
       console.warn('TokenCountdown: Auto-refresh triggered (diff <= 30s)')
       // 即使 diff <= 0 (已过期)，只要 Refresh Token 有效，依然可以抢救
       await handleRefreshToken()
    }
  } else {
    remainingTime.value = diff
  }
}

const handleRefreshToken = async () => {
  isRefreshing.value = true
  try {
    const success = await userStore.restoreSession()
    if (success) {
      // 立即更新一次剩余时间
      checkTime()
    } else {
      // 刷新失败
      throw new Error('Refresh failed')
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    // 刷新失败（可能是401过期），执行退出
    handleExpire()
  } finally {
    isRefreshing.value = false
  }
}

const handleExpire = () => {
  if (timer.value) clearInterval(timer.value)
  // 清除本地存储
  userStore.logout()
  
  // 避免在登录页重复弹窗
  if (route.path !== '/login') {
      ElMessageBox.alert('您的登录凭证已过期，请重新登录', '会话过期', {
        confirmButtonText: '确定',
        callback: () => {
          router.push('/login')
        }
      })
  }
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    checkTime()
  }
}

onMounted(() => {
  checkTime()
  timer.value = setInterval(checkTime, 1000)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  if (timer.value) clearInterval(timer.value)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.token-countdown {
  position: fixed;
  right: 20px;
  bottom: 100px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  z-index: 999999;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  user-select: none;
  cursor: default;
}

.token-countdown:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.token-countdown.is-warning {
  background: #fef0f0;
  border-color: #fde2e2;
  box-shadow: 0 4px 20px rgba(245, 108, 108, 0.15);
  animation: pulse 2s infinite;
}

.countdown-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 20px;
  color: #667eea;
  display: flex;
  align-items: center;
}

.token-countdown.is-warning .icon {
  color: #f56c6c;
}

.time-wrapper {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.time {
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #303133;
  letter-spacing: 0.5px;
}

.token-countdown.is-warning .time {
  color: #f56c6c;
}

.label {
  font-size: 10px;
  color: #909399;
  margin-top: 2px;
  transform: scale(0.9);
  transform-origin: left;
}

/* 动画效果 */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(245, 108, 108, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0); }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
