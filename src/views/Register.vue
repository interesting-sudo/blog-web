<template>
  <div class="register-container">
    <el-card
      class="register-card"
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
        <div class="register-header">
          <div class="logo-icon">✨</div>
          <h2 class="brand-title">iBlog</h2>
          <p>Join us to start your blogging journey</p>
        </div>
      </template>

      <!-- Step Indicator -->
      <div class="steps-wrapper">
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step title="验证邮箱" />
          <el-step title="设置账号" />
          <el-step title="完善信息" />
        </el-steps>
      </div>

      <!-- Step 1: Email Verification -->
      <div v-if="activeStep === 0" class="step-content">
        <el-form ref="emailFormRef" :model="emailForm" :rules="emailRules" label-width="0" size="large">
          <el-form-item prop="email">
            <el-input 
              v-model.trim="emailForm.email" 
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
                class="send-code-btn"
              >
                {{ isCounting ? `${countDown}s 后重新获取` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-button 
            type="primary" 
            class="action-btn" 
            :loading="isCheckingCode"
            @click="handleStep1Next(emailFormRef)"
          >
            {{ isCheckingCode ? '校验中...' : '下一步' }}
          </el-button>
        </el-form>
      </div>

      <!-- Step 2: Account Setup -->
      <div v-if="activeStep === 1" class="step-content">
        <el-form ref="accountFormRef" :model="accountForm" :rules="accountRules" label-width="0" size="large">
          <el-form-item prop="username">
            <el-input 
              v-model="accountForm.username" 
              placeholder="请输入用户名" 
              :prefix-icon="User"
              disabled
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input 
              v-model="accountForm.password" 
              type="password" 
              placeholder="请输入密码" 
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input 
              v-model="accountForm.confirmPassword" 
              type="password" 
              placeholder="确认密码" 
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <div class="step-actions">
            <el-button class="action-btn secondary" @click="prevStep">上一步</el-button>
            <el-button type="primary" class="action-btn" @click="handleStep2Next(accountFormRef)">下一步</el-button>
          </div>
        </el-form>
      </div>

      <!-- Step 3: Profile Info -->
      <div v-if="activeStep === 2" class="step-content">
        <el-form ref="profileFormRef" :model="profileForm" :rules="profileRules" label-width="0" size="large">
          <el-form-item prop="nickname">
            <el-input 
              v-model="profileForm.nickname" 
              placeholder="请输入昵称" 
              :prefix-icon="UserFilled"
            />
          </el-form-item>
          <el-form-item prop="gender">
            <el-radio-group v-model="profileForm.gender">
              <el-radio label="男">男</el-radio>
              <el-radio label="女">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="motto">
            <el-input 
              v-model="profileForm.motto" 
              placeholder="请输入座右铭" 
              :prefix-icon="Edit"
            />
          </el-form-item>
          <div class="step-actions">
            <el-button class="action-btn secondary" @click="prevStep">上一步</el-button>
            <el-button 
              type="primary" 
              class="action-btn" 
              :loading="isSubmitting" 
              @click="handleRegister(profileFormRef)"
            >
              {{ isSubmitting ? '注册中...' : '完成注册' }}
            </el-button>
          </div>
        </el-form>
      </div>

      <div class="login-link">
        已有账号？ <el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Message, Key, User, Lock, UserFilled, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { sendRegisterCode, register, checkEmailCode } from '@/api/user'

const router = useRouter()
const activeStep = ref(0)
const isSubmitting = ref(false)
const isCheckingCode = ref(false)
let isEmailVerified = false // Security flag

// Step 1: Email
const emailFormRef = ref()
const emailForm = reactive({
  email: '',
  code: ''
})
const isCounting = ref(false)
const countDown = ref(60)

const validateEmail = (rule, value, callback) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(value)) {
    callback(new Error('请输入有效的邮箱地址'))
  } else {
    callback()
  }
}

const emailRules = reactive({
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: validateEmail, trigger: ['blur', 'change'] }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
})

const handleSendCode = async () => {
  // Validate email only
  emailFormRef.value.validateField('email', async (valid) => {
    if (valid) {
      try {
        isCounting.value = true
        emailForm.code = '' // Clear code input
        // Call API to send code
        await sendRegisterCode(emailForm.email)
        ElMessage.success('验证码已发送')
        
        // Start countdown
        const timer = setInterval(() => {
          countDown.value--
          if (countDown.value <= 0) {
            clearInterval(timer)
            isCounting.value = false
            countDown.value = 60
          }
        }, 1000)
        
      } catch (error) {
        isCounting.value = false
        console.error(error)
      }
    }
  })
}

const handleStep1Next = (formEl) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      isCheckingCode.value = true
      try {
        const res = await checkEmailCode({
          email: emailForm.email,
          code: emailForm.code
        })
        
        if (res.code === 200) {
          activeStep.value = 1
          isEmailVerified = true
          accountForm.username = emailForm.email // Prefill username with email
        } else {
          ElMessage.error(res.msg || '验证码错误')
        }
      } catch (error) {
        console.error('Check code failed:', error)
      } finally {
        isCheckingCode.value = false
      }
    }
  })
}

// Step 2: Account
const accountFormRef = ref()
const accountForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== accountForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const accountRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
})

const handleStep2Next = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      activeStep.value = 2
    }
  })
}

// Step 3: Profile
const profileFormRef = ref()
const profileForm = reactive({
  nickname: '',
  gender: '男',
  motto: ''
})

const profileRules = reactive({
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
})

const handleRegister = async (formEl) => {
  if (!isEmailVerified) {
    ElMessage.error('请先完成邮箱验证！')
    activeStep.value = 0
    return
  }
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true
      try {
        const data = {
          username: accountForm.username,
          password: accountForm.password,
          nickname: profileForm.nickname,
          gender: profileForm.gender,
          motto: profileForm.motto,
          avatarUrl: ''
        }
        
        const res = await register(data)
        if (res.code === 200) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } else {
          ElMessage.error(res.msg || '注册失败')
        }
      } catch (error) {
        console.error('Registration failed:', error)
      } finally {
        isSubmitting.value = false
      }
    }
  })
}

const prevStep = () => {
  if (activeStep.value > 0) {
    activeStep.value--
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');

.register-container {
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

.register-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.register-header {
  text-align: center;
  padding: 10px 0;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.brand-title {
  font-family: 'Dancing Script', cursive;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.register-header p {
  color: #909399;
  font-size: 0.95rem;
  margin: 10px 0 0;
  font-style: italic;
}

.steps-wrapper {
  margin: 20px 0 40px;
  padding: 0 10px;
}

:deep(.el-step__title) {
  font-size: 14px;
}

.step-content {
  padding: 0 20px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.code-input-group {
  display: flex;
  gap: 12px;
}

.send-code-btn {
  width: 140px;
}

.action-btn {
  width: 100%;
  margin-top: 10px;
  font-weight: bold;
  letter-spacing: 1px;
}

.step-actions {
  display: flex;
  gap: 16px;
}

.step-actions .action-btn {
  flex: 1;
}

.secondary {
  background: #f4f4f5;
  border-color: #e4e7ed;
  color: #606266;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 8px 11px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset !important;
}
</style>
