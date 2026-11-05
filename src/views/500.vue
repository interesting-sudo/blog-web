<template>
  <div class="server-error-container soft-page-bg">
    <div class="content">
      <div class="error-code">500</div>
      <div class="error-desc">服务器出了点小差错</div>
      <div class="error-detail">不用担心，我们的技术团队正在紧急修复中</div>
      
      <div class="actions">
        <el-button type="primary" round size="large" @click="goHome" class="home-btn">
          <el-icon><HomeFilled /></el-icon> 返回首页
        </el-button>
        <el-button round size="large" @click="retry" class="retry-btn">
          <el-icon><RefreshRight /></el-icon> 刷新重试
        </el-button>
      </div>

      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { HomeFilled, RefreshRight } from '@element-plus/icons-vue'
import { ElButton, ElIcon } from 'element-plus'

const router = useRouter()
const route = useRoute()

const goHome = () => {
  router.push('/home')
}

const retry = () => {
  // 获取重定向来源路径
  const from = route.query.from
  if (from) {
    // 如果有来源路径，跳转回来源路径（带上重定向参数）
    router.push(decodeURIComponent(from))
  } else {
    // 否则直接刷新当前页面
    window.location.reload()
  }
}
</script>

<style scoped>
.server-error-container {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.content {
  text-align: center;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 60px 80px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  animation: pulse 3s infinite ease-in-out;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  margin-bottom: 20px;
  font-family: 'Arial', sans-serif;
}

.error-desc {
  font-size: 24px;
  color: #333;
  font-weight: 600;
  margin-bottom: 10px;
}

.error-detail {
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  position: relative;
  z-index: 20;
}

.home-btn {
  padding: 12px 30px;
  font-weight: 500;
  background: linear-gradient(45deg, #ff9a9e, #fad0c4);
  border: none;
  transition: transform 0.3s;
  color: #fff;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 154, 158, 0.4);
}

.retry-btn:hover {
  color: #ff9a9e;
  border-color: #ff9a9e;
  background-color: #fff;
}

/* Decoration Circles */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  z-index: 1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #fad0c4;
  top: -50px;
  left: -50px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: #ff9a9e;
  bottom: -50px;
  right: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  background: #a18cd1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.2;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

@media (max-width: 768px) {
  .content {
    padding: 40px 20px;
    width: 90%;
  }
  
  .error-code {
    font-size: 80px;
  }
}
</style>
