<template>
  <div class="common-layout">
    <div class="settings-container soft-page-bg">
      <div class="page-inner">
        <Navbar />
        <main class="main-content">
        <div
          class="settings-card"
          v-motion
          :initial="{ opacity: 0, y: 32, scale: 0.95 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 500, easing: 'easeOutCubic' }
          }"
        >
          <div class="card-header">
            <h2>个人资料设置</h2>
            <p class="subtitle">完善你的个人信息，让更多人认识你</p>
          </div>
          
          <el-form 
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            class="settings-form"
            size="large"
          >
            <div class="form-section">
              <div class="avatar-setting">
                <div class="avatar-wrapper" @click="triggerFileInput">
                  <el-avatar :size="100" :src="form.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="preview-avatar" />
                  <div class="avatar-overlay">
                    <el-icon><Camera /></el-icon>
                  </div>
                </div>
                <input 
                  type="file" 
                  ref="fileInput" 
                  accept="image/*" 
                  class="hidden-input" 
                  @change="handleFileChange"
                />
                <div class="avatar-hint">点击头像更换图片</div>
              </div>
            </div>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item label="昵称" prop="nickname">
                  <el-input v-model="form.nickname" placeholder="请输入昵称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-radio-group v-model="form.gender">
                    <el-radio label="男">男</el-radio>
                    <el-radio label="女">女</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="个人签名" prop="motto">
              <el-input 
                v-model="form.motto" 
                type="textarea" 
                :rows="3" 
                placeholder="写一句话介绍自己..."
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" disabled placeholder="邮箱不可修改">
                <template #append>已验证</template>
              </el-input>
            </el-form-item>

            <div class="form-actions">
              <el-button @click="$router.push('/my-home')">取消</el-button>
              <el-button type="primary" :loading="loading" @click="handleSave">保存修改</el-button>
            </div>
          </el-form>
        </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { getUserInfo, updateUserInfo } from '@/api/user'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const fileInput = ref(null)
const loading = ref(false)
const selectedFile = ref(null)

const form = reactive({
  id: userStore.userInfo.id || '',
  username: userStore.userInfo.username || '',
  nickname: userStore.userInfo.nickname || '',
  avatarUrl: userStore.userInfo.avatarUrl || '',
  gender: userStore.userInfo.gender || '男',
  motto: userStore.userInfo.motto || '',
  email: userStore.userInfo.username || ''
})

const rules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.warning('图片大小不能超过 5MB')
      return
    }
    selectedFile.value = file
    form.avatarUrl = URL.createObjectURL(file)
  }
}

const fetchUserInfoData = async () => {
  if (!userStore.userInfo.id) return
  try {
    const res = await getUserInfo(userStore.userInfo.id)
    if (res.code === 200) {
      const data = res.data
      form.id = data.id || data.userId
      form.username = data.username
      form.nickname = data.nickname
      form.avatarUrl = data.avatarUrl
      form.gender = data.gender || '男'
      form.motto = data.motto || data.bio || ''
      form.email = data.email || data.username // Assuming username is email based on register logic
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    ElMessage.error('获取用户信息失败')
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const formData = new FormData()
        
        // 1. Prepare user data object
        const userPart = {
          id: form.id || userStore.userInfo.id,
          nickname: form.nickname,
          gender: form.gender,
          motto: form.motto
        }
        
        // 2. Append user part as a Blob with application/json type
        // This is required for Spring @RequestPart("user") to deserialize it correctly
        formData.append('user', new Blob([JSON.stringify(userPart)], { type: 'application/json' }))
        
        // 3. Append avatar file if selected
        if (selectedFile.value) {
          formData.append('avatar', selectedFile.value)
        }
        
        const res = await updateUserInfo(formData)
        
        if (res.code === 200) {
          ElMessage.success('保存成功')
          // Update store
          userStore.userInfo.nickname = form.nickname
          
          // If backend returns data (e.g. updated avatar URL), use it
          // Otherwise, if we uploaded a file, we might want to refresh user info
          // For now, if we have a local preview, we can update the store to show it immediately
          // But ideally, we should fetch the latest info from backend to get the real URL
          if (selectedFile.value) {
             // Fetch latest info to get the new avatar URL
             await fetchUserInfoData()
             userStore.userInfo.avatarUrl = form.avatarUrl
          }
          
          // Clear selected file
          selectedFile.value = null
        } else {
           ElMessage.error(res.msg || '保存失败')
        }
      } catch (error) {
        console.error('Failed to update user info:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

// Watch for user info changes (in case of page refresh)
watch(() => userStore.userInfo.id, (newId) => {
  if (newId) {
    fetchUserInfoData()
  }
})

onMounted(() => {
  fetchUserInfoData()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

.settings-container {
  min-height: 100vh;
}

.page-inner {
  max-width: 1000px;
  margin: 0 auto;
}

.main-content {
  width: 100%;
  padding: 40px 24px;
  box-sizing: border-box;
}

.settings-card {
  background: var(--card-bg);
  border-radius: 22px;
  padding: 40px;
  box-shadow: var(--card-shadow-soft);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(20px);
}

.card-header {
  margin-bottom: 30px;
  text-align: center;
}

.card-header h2 {
  font-size: 1.8rem;
  color: #303133;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #909399;
  font-size: 1rem;
  margin: 0;
}

.settings-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.avatar-setting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover {
  transform: scale(1.05);
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: #fff;
  font-size: 2rem;
}

.preview-avatar {
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: block;
}

.hidden-input {
  display: none;
}

.avatar-hint {
  font-size: 0.9rem;
  color: #909399;
  margin-top: 8px;
}

.avatar-input {
  width: 100%;
  text-align: center;
}

.hint {
  font-size: 0.85rem;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 1px 11px;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-textarea__inner) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 1px #667eea inset;
}
</style>
