<template>
  <div class="not-found-container soft-page-bg">
    <div class="content">
      <div class="error-code">404</div>
      <div class="error-desc">Oops! 页面好像迷路了</div>
      <div class="error-detail">您访问的页面不存在或已被移除</div>
      
      <div class="actions">
        <el-button type="primary" round size="large" @click="goHome" class="home-btn">
          <el-icon><HomeFilled /></el-icon> 返回首页
        </el-button>
        <el-button round size="large" @click="goBack" class="back-btn">
          返回上一页
        </el-button>
      </div>

      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { HomeFilled } from '@element-plus/icons-vue'
import { ElButton, ElIcon } from 'element-plus'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/home')
  }
}
</script>

<style scoped>
.not-found-container {
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 60px 80px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  animation: float 6s ease-in-out infinite;
}

.error-code {
  font-size: 120px;
  font-weight: 800;
  background: linear-gradient(45deg, #667eea, #764ba2);
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
  background: linear-gradient(45deg, #667eea, #764ba2);
  border: none;
  transition: transform 0.3s;
}

.home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.back-btn:hover {
  background-color: #f5f7fa;
  color: #667eea;
  border-color: #667eea;
}

/* Decoration Circles */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
  z-index: 1;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: #a1c4fd;
  top: -50px;
  right: -50px;
}

.circle-2 {
  width: 400px;
  height: 400px;
  background: #c2e9fb;
  bottom: -100px;
  left: -100px;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
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
