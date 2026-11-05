<template>
  <div class="reset-container">
    <el-card
      class="reset-card"
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
        <div class="reset-header">
          <div class="logo-icon">🔒</div>
          <h2 class="brand-title">修改密码</h2>
          <p>定期修改密码可以保护您的账号安全</p>
        </div>
      </template>

      <div class="form-content">
        <el-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" label-width="0" size="large">
          <el-form-item prop="oldPassword">
            <el-input 
              v-model="passwordForm.oldPassword" 
              type="password" 
              placeholder="请输入旧密码" 
              :prefix-icon="Key"
              show-password
            />
          </el-form-item>
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
            <el-button class="action-btn secondary" @click="$router.push('/settings')">返回</el-button>
            <el-button 
              type="primary" 
              class="action-btn" 
              :loading="isSubmitting"
              @click="handleUpdatePassword(passwordFormRef)"
            >
              确认修改
            </el-button>
          </div>
        </el-form>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { updatePassword } from '@/api/user'
import { Key, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const isSubmitting = ref(false)
const passwordFormRef = ref()

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

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
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validatePass2, trigger: 'blur' }
  ]
}

const handleUpdatePassword = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid) => {
    if (valid) {
      isSubmitting.value = true
      try {
        const res = await updatePassword({
          id: userStore.userInfo.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
        
        if (res.code === 200) {
          ElMessage.success('密码修改成功')
          router.back()
        } else {
          ElMessage.error(res.msg || '密码修改失败')
        }
      } catch (error) {
        console.error('Failed to update password:', error)
      } finally {
        isSubmitting.value = false
      }
    }
  })
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

.reset-container {
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

.reset-card {
  width: 100%;
  max-width: 480px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.reset-header {
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

.reset-header p {
  color: #909399;
  margin-top: 8px;
  font-size: 0.95rem;
}

.form-content {
  padding: 0 20px 30px;
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
