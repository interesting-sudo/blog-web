<template>
  <div class="comment-manage">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">评论列表</span>
          <div class="card-actions">
            <div class="search-group">
              <el-select v-model="searchType" class="search-type-select">
                <el-option label="内容" value="content" />
                <el-option label="作者" value="nickname" />
                <el-option label="文章" value="blogTitle" />
                <el-option label="状态" value="status" />
              </el-select>
              
              <el-select 
                v-if="searchType === 'status'"
                v-model="searchKeyword"
                placeholder="请选择状态"
                class="search-keyword-input"
                clearable
                @change="handleSearch"
              >
                <el-option label="隐藏" value="0" />
                <el-option label="正常" value="1" />
              </el-select>
              
              <el-input
                v-else
                v-model="searchKeyword"
                placeholder="请输入搜索内容"
                class="search-keyword-input"
                clearable
                @clear="handleSearch"
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button :icon="Search" @click="handleSearch" />
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </template>

      <el-table 
        :data="comments" 
        v-loading="loading" 
        stripe 
        border 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="180" align="center" show-overflow-tooltip />
        <el-table-column prop="content" label="评论内容" min-width="250" show-overflow-tooltip />
        <el-table-column prop="nickname" label="作者" width="120" />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.parentId === 0 ? '' : 'info'" size="small">
              {{ row.parentId === 0 ? '根评论' : '回复' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="blogTitle" label="所属文章" min-width="200" show-overflow-tooltip />
        <el-table-column prop="likeCount" label="获赞" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">正常</el-tag>
            <el-tag v-else-if="row.status === 0" type="danger" size="small">已隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 0" 
              type="success" 
              link 
              size="small" 
              @click="handleStatusChange([row.id], 1)"
            >显示</el-button>
            <el-button 
              v-if="row.status === 1" 
              type="warning" 
              link 
              size="small" 
              @click="handleStatusChange([row.id], 0)"
            >隐藏</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="batch-actions">
          <el-button 
            type="success" 
            :disabled="!selectedIds.length" 
            @click="handleStatusChange(selectedIds, 1)"
          >批量显示</el-button>
          <el-button 
            type="warning" 
            :disabled="!selectedIds.length" 
            @click="handleStatusChange(selectedIds, 0)"
          >批量隐藏</el-button>
        </div>
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
import { ref, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminGetCommentList, adminBatchUpdateStatus } from '@/api/comment'

const loading = ref(false)
const searchType = ref('content')
const searchKeyword = ref('')
const comments = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref([])

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleStatusChange = (ids, status) => {
  const isBatch = ids.length > 1
  const statusName = status === 1 ? '显示' : '隐藏'
  const message = isBatch 
    ? `确定要批量${statusName}选中的 ${ids.length} 条评论吗？` 
    : `确定要${statusName}该评论吗？`
    
  ElMessageBox.confirm(message, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await adminBatchUpdateStatus(ids, status)
      if (res.code === 200) {
        ElMessage.success(`${statusName}成功`)
        fetchComments()
      }
    } catch (error) {
      console.error(`Batch update status error:`, error)
    }
  })
}

const fetchComments = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 动态添加搜索参数
    if (searchKeyword.value !== null && searchKeyword.value !== '') {
      if (searchType.value === 'status') {
        params[searchType.value] = parseInt(searchKeyword.value)
      } else {
        params[searchType.value] = searchKeyword.value
      }
    }

    const res = await adminGetCommentList(params)
    if (res.code === 200 && res.data) {
      comments.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch comments error:', error)
    ElMessage.error('获取评论列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComments()
}

// 监听搜索类型变化，重置关键词
watch(searchType, () => {
  searchKeyword.value = ''
  handleSearch()
})

// 防抖搜索
let timer = null
watch(searchKeyword, () => {
  if (searchType.value === 'status') return // 状态切换不需要防抖，直接触发 change 事件处理
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    handleSearch()
  }, 500)
})

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchComments()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchComments()
}

onMounted(fetchComments)
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

.search-group {
  display: flex;
  align-items: center;
  gap: 0;
}

.search-type-select {
  width: 100px;
}

.search-type-select :deep(.el-input__wrapper) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  box-shadow: 1px 0 0 0 var(--el-input-border-color) inset, 0 1px 0 0 var(--el-input-border-color) inset, 0 -1px 0 0 var(--el-input-border-color) inset;
}

.search-keyword-input {
  width: 300px;
}

.search-keyword-input :deep(.el-input__wrapper),
.search-keyword-input :deep(.el-select__wrapper) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.table-footer {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.batch-actions {
  display: flex;
  gap: 12px;
}
</style>
