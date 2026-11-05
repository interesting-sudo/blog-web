<template>
  <div class="login-container">
    <el-card
      class="login-card"
      shadow="hover"
      v-motion
      :initial="{ opacity: 0, y: 32, scale: 0.9 }"
      :enter="{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 420, easing: 'easeOutCubic' }
      }"
    >
      <template #header>
        <div class="login-header">
          <div class="logo-icon">✨</div>
          <h2 class="brand-title">iBlog</h2>
          <p>Welcome back, please login to your account</p>
        </div>
      </template>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        size="large"
        @keyup.enter="handleLogin(loginFormRef)"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <div class="form-actions">
          <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
          <el-link type="primary" underline="never" @click="goToForgotPassword">忘记密码?</el-link>
        </div>
        
        <el-form-item label-width="0">
          <el-button 
            type="primary" 
            class="login-btn" 
            :loading="isLoading"
            @click="handleLogin(loginFormRef)"
            round
          >
            {{ isLoading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
        
        <div class="register-prompt">
          还没有账号？ <el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref()
const isLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ]
})

const handleLogin = async (formEl) => {
  if (!formEl) return
  
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      isLoading.value = true
      try {
        const res = await userStore.login({
          username: loginForm.username,
          password: loginForm.password,
          rememberMe: loginForm.rememberMe
        })
        
        // 后端返回结构: { code: 200, msg: "...", data: { ... } }
        if (res.code === 200) {
          ElMessage.success(res.msg || '登录成功！')
          router.push('/home')
        } else {
          ElMessage.error(res.msg || '登录失败')
        }
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        isLoading.value = false
      }
    } else {
      console.log('验证失败', fields)
      ElMessage.error('请填写正确的登录信息')
    }
  })
}

const goToRegister = () => {
  router.push('/register')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
  background:
    radial-gradient(circle at top left, rgba(129, 140, 248, 0.12), transparent 55%),
    radial-gradient(circle at bottom right, rgba(244, 114, 182, 0.12), transparent 55%),
    #f5f5fa;
}

.login-card {
  width: 100%;
  max-width: 520px; /* 增加宽度 */
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  padding: 10px 0;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.login-header h2.brand-title {
  font-family: 'Dancing Script', 'Pacifico', cursive, 'Segoe Script', 'Brush Script MT', sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #303133;
  margin: 0;
  margin-bottom: 0.2rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
  transform: rotate(-3deg);
  display: inline-block;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.login-header p {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #909399;
  font-size: 0.95rem;
  margin: 0;
  margin-top: 10px;
  font-style: italic;
  letter-spacing: 1px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  font-weight: bold;
  letter-spacing: 2px;
  background: linear-gradient(to right, #667eea, #764ba2);
  border: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(118, 75, 162, 0.4);
  background: linear-gradient(to right, #764ba2, #667eea);
}

.login-btn:active {
  transform: translateY(0);
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 8px 11px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset !important;
}

.register-prompt {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: #606266;
}
</style>
