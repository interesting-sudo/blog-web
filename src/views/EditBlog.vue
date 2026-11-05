<template>
  <BlogEditor 
    :initial-data="blogData"
    :submit-text="blogData.status === '1' ? '更新博客' : '更新草稿'"
    :loading="isUpdating"
    @submit="handleUpdate"
  />
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { editBlog, getBlogDetail } from '@/api/blog'
import { useUserStore } from '@/store/user'
import BlogEditor from '@/components/BlogEditor.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isUpdating = ref(false)

const blogData = ref({
  title: '',
  content: '',
  tags: [],
  summary: '',
  coverUrl: '',
  status: '1',
  categoryId: null
})

const loadBlog = async () => {
  const id = route.params.id 
  if (!id) return
  
  // 如果用户信息还没加载出来，先不发送请求，等待监听器触发
  const userId = userStore.userInfo?.id
  if (!userId) {
    console.log('EditBlog: User info not ready, waiting...')
    return
  }

  try {
    const res = await getBlogDetail(id, userId)
    if (res.code === 200 && res.data) {
      const data = res.data
      // 使用 .value = { ... } 替换整个对象，这样会改变 props.initialData 的引用，触发子组件监听
      blogData.value = {
        ...data,
        tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',')) : [],
        status: String(data.status),
        // 关键修复：显式映射 categoryId 和 coverUrl，并提供 categoryName 用于兜底匹配
        categoryId: data.categoryId || null,
        categoryName: data.categoryName || '',
        coverUrl: data.coverImage || data.coverUrl || ''
      }
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return
    }
    console.error('Load blog error:', error)
  }
}

// 监听路由参数和用户信息，确保在刷新或直接输入 URL 时能正确获取数据
watch(
  () => [route.params.id, userStore.userInfo.id],
  ([newId, newUserId]) => {
    if (newId && newUserId) {
      loadBlog()
    }
  },
  { immediate: true }
)

onMounted(loadBlog)

const handleUpdate = async (formData) => {
  isUpdating.value = true
  try {
    const authorId = userStore.userId
    const blogReq = {
      id: route.params.id, // 修改为 params.id
      title: formData.title,
      content: formData.content,
      summary: formData.summary,
      authorId: authorId,
      categoryId: formData.categoryId,
      tags: formData.tags.join(','),
      status: parseInt(formData.status)
    }

    const data = new FormData()
    data.append('blog', new Blob([JSON.stringify(blogReq)], { type: 'application/json' }))
    if (formData.rawCoverFile) {
      data.append('coverImage', formData.rawCoverFile)
    }

    const res = await editBlog(data)
    if (res.code === 200) {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })

      await Toast.fire({
        icon: 'success',
        title: '更新成功！内容已同步✨',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff'
      })

      router.push('/home')
    } else {
      ElMessage.error(res.msg || '更新失败')
    }
  } catch (error) {
    console.error('Update error:', error)
    ElMessage.error('更新服务出错')
  } finally {
    isUpdating.value = false
  }
}
</script>
