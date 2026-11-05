<template>
  <div class="tag-manage">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">标签列表</span>
          <div class="card-actions">
            <el-input
              v-model="search"
              placeholder="搜索标签名称"
              class="search-input"
              clearable
              prefix-icon="Search"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button type="primary" @click="handleAdd">新增标签</el-button>
          </div>
        </div>
      </template>

      <el-table :data="tags" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="100" align="center" />
        <el-table-column prop="name" label="标签名称" min-width="150">
          <template #default="{ row }">
            <el-tag :type="getRandomTagType(row.id)">{{ row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="blogCount" label="关联文章数" width="150" align="center">
          <template #default="{ row }">
            {{ row.blogCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="200" align="center" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <!-- 新增/编辑标签对话框 -->
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑标签' : '新增标签'" width="400px">
      <el-form :model="editForm" label-width="80px" @submit.prevent="saveTag">
        <el-form-item label="标签名称" required>
          <el-input v-model="editForm.name" placeholder="请输入标签名称" maxlength="20" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveTag">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminGetTagList, adminAddTag, adminUpdateTag, adminDeleteTag } from '@/api/blog'

const loading = ref(false)
const submitting = ref(false)
const search = ref('')
const tags = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)

const editForm = reactive({
  id: null,
  name: ''
})

const fetchTags = async () => {
  loading.value = true
  try {
    const res = await adminGetTagList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      name: search.value
    })
    if (res.code === 200 && res.data) {
      tags.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch tags error:', error)
    ElMessage.error('获取标签列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTags()
}

// 防抖搜索
let timer = null
watch(search, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    handleSearch()
  }, 500)
})

const handleAdd = () => {
  editForm.id = null
  editForm.name = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.name = row.name
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除标签 "${row.name}" 吗？此操作可能影响关联文章的展示。`, '警告', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await adminDeleteTag(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchTags()
      }
    } catch (error) {
      console.error('Delete tag error:', error)
    }
  })
}

const saveTag = async () => {
  if (!editForm.name.trim()) {
    return ElMessage.warning('请输入标签名称')
  }
  
  submitting.value = true
  try {
    let res
    if (editForm.id) {
      res = await adminUpdateTag({ id: editForm.id, name: editForm.name })
    } else {
      res = await adminAddTag({ name: editForm.name })
    }
    
    if (res.code === 200) {
      ElMessage.success(editForm.id ? '更新成功' : '新增成功')
      dialogVisible.value = false
      fetchTags()
    }
  } catch (error) {
    console.error('Save tag error:', error)
  } finally {
    submitting.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchTags()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchTags()
}

const getRandomTagType = (id) => {
  const types = ['', 'success', 'info', 'warning', 'danger']
  return types[id % types.length]
}

onMounted(fetchTags)
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

.card-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
