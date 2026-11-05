<template>
  <div class="forgot-container">
    <el-card
      class="forgot-card"
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
        <div class="forgot-header">
          <div class="logo-icon">🔑</div>
          <h2 class="brand-title">找回密码</h2>
          <p>{{ step === 1 ? '验证您的邮箱以重置密码' : '设置新的登录密码' }}</p>
        </div>
      </template>

      <div class="form-content">
        <!-- 步骤 1: 邮箱验证 -->
        <el-form 
          v-if="step === 1"
          ref="emailFormRef" 
          :model="emailForm" 
          :rules="emailRules" 
          label-width="0" 
          size="large"
        >
          <el-form-item prop="email">
            <el-input 
              v-model="emailForm.email" 
              placeholder="请输入邮箱地址" 
              :prefix-icon="Message"
            />
          </el-form-item>
          
          <el-form-item prop="code">
            <div class="code-input-group">
              <el-input 
                v-model="emailForm.code" 
                placeholder="请输入验证码" 
                :prefix-icon="Key"
              />
              <el-button 
                type="primary" 
                :disabled="isCounting" 
                @click="handleSendCode"
                class="send-btn"
              >
                {{ isCounting ? `${count}s后重新获取` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          
          <div class="form-actions">
            <el-button class="action-btn secondary" @click="$router.push('/login')">返回登录</el-button>
            <el-button 
              type="primary" 
              class="action-btn" 
              :loading="isLoading"
              @click="handleVerifyCode(emailFormRef)"
            >
              下一步
            </el-button>
          </div>
        </el-form>

        <!-- 步骤 2: 重置密码 -->
        <el-form 
          v-if="step === 2"
          ref="passwordFormRef" 
          :model="passwordForm" 
          :rules="passwordRules" 
          label-width="0" 
          size="large"
        >
          <el-form-item prop="newPassword">
            <el-input 
              v-model="passwordForm.newPassword" 
              type="password" 
              placeholder="请输入新密码" 
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="passwordForm.confirmPassword" 
              type="password" 
              placeholder="确认新密码" 
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <div class="form-actions">
            <el-button class="action-btn secondary" @click="step = 1">上一步</el-button>
            <el-button 
              type="primary" 
              class="action-btn" 
              :loading="isLoading"
              @click="handleResetPassword(passwordFormRef)"
            >
              确认重置
            </el-button>
          </div>
        </el-form>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Key, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendResetCode, checkResetPasswordCode, resetPassword } from '@/api/user'
import { useUserStore } from '@/store/user'

const router = useRouter()
const userStore = useUserStore()

// 进入页面时清除登录状态
onMounted(() => {
  if (userStore.token) {
    userStore.logout()
  }
})
const step = ref(1)
const isLoading = ref(false)
const username = ref('')
const resetToken = ref('')

// 倒计时逻辑
const count = ref(60)
const isCounting = ref(false)
let timer = null

const startCount = () => {
  isCounting.value = true
  count.value = 60
  timer = setInterval(() => {
    if (count.value > 0) {
      count.value--
    } else {
      clearInterval(timer)
      isCounting.value = false
    }
  }, 1000)
}

// 表单引用
const emailFormRef = ref()
const passwordFormRef = ref()

// 表单数据
const emailForm = reactive({
  email: '',
  code: ''
})

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 验证规则
const emailRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const passwordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

// 操作处理
const handleSendCode = async () => {
  // 单独验证邮箱字段
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱')
    return
  }
  
  // 简单的邮箱格式校验
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  try {
    const res = await sendResetCode(emailForm.email)
    if (res.code === 200) {
      ElMessage.success('验证码已发送')
      startCount()
    } else {
      ElMessage.error(res.msg || '发送失败')
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
  }
}

const handleVerifyCode = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      isLoading.value = true
      try {
        const res = await checkResetPasswordCode({
          email: emailForm.email,
          code: emailForm.code
        })
        
        if (res.code === 200) {
          const tokenFromRes = (res.data && (res.data.resetToken || res.data.reset_token)) || res.data
          if (!tokenFromRes) {
            ElMessage.error('验证码验证成功，但未获取到重置凭证，请重试')
            return
          }
          username.value = emailForm.email
          resetToken.value = tokenFromRes
          
          ElMessage.success('验证通过')
          step.value = 2
        } else {
          ElMessage.error(res.msg || '验证失败')
        }
      } catch (error) {
        console.error('Verify code error:', error)
      } finally {
        isLoading.value = false
      }
    }
  })
}

const handleResetPassword = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      if (!username.value) {
        ElMessage.error('获取用户信息失败，请重新验证邮箱')
        step.value = 1
        return
      }

      if (!resetToken.value) {
        ElMessage.error('验证信息已失效，请重新获取验证码')
        step.value = 1
        return
      }
      
      isLoading.value = true
      try {
        const res = await resetPassword({
          username: username.value,
          newPassword: passwordForm.newPassword,
          resetToken: resetToken.value
        })
        
        if (res.code === 200) {
          ElMessage.success('密码重置成功，请登录')
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '重置失败')
        }
      } catch (error) {
        console.error('Reset password error:', error)
      } finally {
        isLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

.forgot-container {
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

.forgot-card {
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.forgot-header {
  text-align: center;
  padding: 10px 0;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.brand-title {
  font-family: 'Dancing Script', cursive;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.forgot-header p {
  color: #909399;
  margin-top: 8px;
  font-size: 0.95rem;
}

.form-content {
  padding: 0 20px 30px;
}

.code-input-group {
  display: flex;
  gap: 12px;
}

.send-btn {
  width: 120px;
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.form-actions .action-btn {
  flex: 1;
}

.secondary {
  background: #f4f4f5;
  border-color: #e4e7ed;
  color: #606266;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 8px 11px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset !important;
}
</style>
