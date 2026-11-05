<template>
  <div class="article-manage">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">博客列表</span>
          <div class="card-actions">
            <div class="search-group">
              <el-select v-model="searchType" class="search-type-select">
                <el-option label="标题" value="title" />
                <el-option label="作者" value="authorName" />
                <el-option label="标签" value="tags" />
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
                <el-option label="草稿" value="0" />
                <el-option label="已上架" value="1" />
                <el-option label="已下架" value="2" />
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
        :data="articles" 
        v-loading="loading" 
        stripe 
        border 
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="authorName" label="作者" min-width="120" />
        <el-table-column prop="categoryName" label="分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.categoryName || '默认分类' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" min-width="150">
          <template #default="{ row }">
            <div class="tag-group">
              <el-tag 
                v-for="tag in (row.tags ? row.tags.split(',') : [])" 
                :key="tag" 
                size="small" 
                class="article-tag"
              >
                {{ tag }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info" size="small">草稿</el-tag>
            <el-tag v-else-if="row.status === 1" type="success" size="small">已上架</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger" size="small">已下架</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="阅读" width="80" align="center" />
        <el-table-column prop="likeCount" label="获赞" width="80" align="center" />
        <el-table-column prop="favoriteCount" label="收藏" width="80" align="center" />
        <el-table-column prop="createTime" label="发布时间" width="180" align="center" />
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 2 || row.status === 0" 
              type="success" 
              link 
              size="small" 
              @click="handleStatusChange([row.id], 1)"
            >上架</el-button>
            <el-button 
              v-if="row.status === 1" 
              type="warning" 
              link 
              size="small" 
              @click="handleStatusChange([row.id], 2)"
            >下架</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-footer">
        <div class="batch-actions">
          <el-button 
            type="success" 
            :disabled="!selectedIds.length" 
            @click="handleStatusChange(selectedIds, 1)"
          >批量上架</el-button>
          <el-button 
            type="warning" 
            :disabled="!selectedIds.length" 
            @click="handleStatusChange(selectedIds, 2)"
          >批量下架</el-button>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { adminGetBlogList, adminBatchUpdateStatus } from '@/api/blog'

const router = useRouter()
const loading = ref(false)
const searchType = ref('title')
const searchKeyword = ref('')
const articles = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const selectedIds = ref([])

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleStatusChange = (ids, status) => {
  const isBatch = ids.length > 1
  const statusName = status === 1 ? '上架' : '下架'
  const message = isBatch 
    ? `确定要批量${statusName}选中的 ${ids.length} 篇文章吗？` 
    : `确定要${statusName}该文章吗？`
    
  ElMessageBox.confirm(message, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await adminBatchUpdateStatus(ids, status)
      if (res.code === 200) {
        ElMessage.success(`${statusName}成功`)
        fetchArticles()
      }
    } catch (error) {
      console.error(`Batch update status error:`, error)
    }
  })
}

const fetchArticles = async () => {
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

    const res = await adminGetBlogList(params)
    if (res.code === 200 && res.data) {
      articles.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch articles error:', error)
    ElMessage.error('获取文章列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchArticles()
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
  fetchArticles()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchArticles()
}

onMounted(fetchArticles)
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

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.article-tag {
  margin-right: 4px;
  margin-bottom: 4px;
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
