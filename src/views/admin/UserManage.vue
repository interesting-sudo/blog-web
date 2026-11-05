<template>
  <div class="user-manage">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">用户列表</span>
          <div class="card-actions">
            <el-input
              v-model="search"
              placeholder="请输入搜索关键词"
              class="search-input"
              clearable
            >
              <template #prepend>
                <el-select v-model="searchType" placeholder="搜索类型" style="width: 100px">
                  <el-option label="昵称" value="nickname" />
                  <el-option label="用户名" value="username" />
                </el-select>
              </template>
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="users" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatarUrl || defaultAvatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="150" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="gender" label="性别" width="70" align="center" />
        <el-table-column prop="roleId" label="角色" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.roleId === 1 ? 'danger' : 'info'">
              {{ row.roleId === 1 ? '管理员' : '普通用户' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" align="center" />
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <template v-if="row.roleId !== 1">
              <el-button 
                :type="row.status === 1 ? 'danger' : 'success'" 
                link 
                size="small" 
                @click="handleStatusChange(row)"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button type="primary" link size="small" @click="handleResetPassword(row)">重置密码</el-button>
            </template>
            <span v-else class="admin-action-hint">系统管理员</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatTime } from '@/utils/date'
import { adminGetUserList, adminUpdateUserStatus, adminResetPassword } from '@/api/user'

const loading = ref(false)
const search = ref('')
const searchType = ref('nickname') // 默认搜索昵称
const users = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      [searchType.value]: search.value || null // 动态设置字段，避免同时发送导致 AND 过滤失效
    }
    
    const res = await adminGetUserList(params)
    if (res.code === 200 && res.data) {
      users.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch users error:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

// 监听搜索输入，防抖处理
let searchTimer = null
watch(search, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
})

// 监听搜索类型切换，立即触发搜索
watch(searchType, () => {
  if (search.value) {
    handleSearch()
  }
})

const handleStatusChange = (row) => {
  const newStatus = row.status === 1 ? 0 : 1
  const actionText = newStatus === 0 ? '禁用' : '启用'
  
  ElMessageBox.confirm(`确定要${actionText}用户 "${row.nickname || row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adminUpdateUserStatus(row.id, newStatus)
      if (res.code === 200) {
        ElMessage.success(`${actionText}成功`)
        fetchUsers() // 刷新列表
      }
    } catch (error) {
      console.error('Update status error:', error)
    }
  })
}

const handleResetPassword = (row) => {
  ElMessageBox.confirm(`确定要重置用户 "${row.nickname || row.username}" 的密码吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await adminResetPassword(row.id)
      if (res.code === 200) {
        ElMessage.success('密码重置成功')
      }
    } catch (error) {
      console.error('Reset password error:', error)
    }
  })
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUsers()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.search-input {
  width: 240px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.admin-action-hint {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}
</style>
