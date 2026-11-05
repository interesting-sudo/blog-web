<template>
  <div class="category-manage">
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">分类列表</span>
          <div class="card-actions">
            <el-button type="primary" @click="handleAdd">新增分类</el-button>
          </div>
        </div>
      </template>

      <el-table :data="categories" v-loading="loading" stripe border style="width: 100%">
        <el-table-column prop="id" label="ID" width="100" align="center" />
        <el-table-column prop="name" label="分类名称" width="150" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="blogCount" label="关联文章数量" width="120" align="center" />
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

    <!-- 新增/编辑分类对话框 -->
    <el-dialog v-model="dialogVisible" :title="editForm.id ? '编辑分类' : '新增分类'" width="450px">
      <el-form :model="editForm" label-width="80px" @submit.prevent="saveCategory">
        <el-form-item label="分类名称" required>
          <el-input v-model="editForm.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入分类描述" 
            maxlength="100" 
            show-word-limit 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="saveCategory">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminGetCategoryList, adminAddCategory, adminUpdateCategory, adminDeleteCategory } from '@/api/blog'

const loading = ref(false)
const submitting = ref(false)
const categories = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editForm = reactive({
  id: null,
  name: '',
  description: ''
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await adminGetCategoryList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    })
    if (res.code === 200 && res.data) {
      categories.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch categories error:', error)
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchCategories()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchCategories()
}

const handleAdd = () => {
  editForm.id = null
  editForm.name = ''
  editForm.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editForm.id = row.id
  editForm.name = row.name
  editForm.description = row.description || ''
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？此操作不可撤销。`, '警告', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res = await adminDeleteCategory(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCategories()
      }
    } catch (error) {
      console.error('Delete category error:', error)
    }
  })
}

const saveCategory = async () => {
  if (!editForm.name.trim()) {
    return ElMessage.warning('请输入分类名称')
  }
  
  submitting.value = true
  try {
    let res
    const data = {
      name: editForm.name,
      description: editForm.description
    }
    
    if (editForm.id) {
      res = await adminUpdateCategory({ id: editForm.id, ...data })
    } else {
      res = await adminAddCategory(data)
    }
    
    if (res.code === 200) {
      ElMessage.success(editForm.id ? '更新成功' : '新增成功')
      dialogVisible.value = false
      fetchCategories()
    }
  } catch (error) {
    console.error('Save category error:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(fetchCategories)
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

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
