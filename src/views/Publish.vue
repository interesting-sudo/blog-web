<template>
  <BlogEditor 
    :submit-text="form.status === '1' ? '发布博客' : '保存草稿'"
    :loading="isPublishing"
    @submit="handlePublish"
  />
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import { publishBlog } from '@/api/blog'
import { useUserStore } from '@/store/user'
import BlogEditor from '@/components/BlogEditor.vue'

const router = useRouter()
const userStore = useUserStore()
const isPublishing = ref(false)

const form = reactive({
  status: '1'
})

const handlePublish = async (formData) => {
  isPublishing.value = true
  try {
    const authorId = userStore.userId
    if (!authorId) {
      ElMessage.error('无法获取用户信息，请重新登录')
      return
    }

    const blogReq = {
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

    const res = await publishBlog(data)
    if (res.code === 200) {
      const isDraft = formData.status === '0'
      const message = isDraft ? '草稿保存成功！' : '文章发布成功！'
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })

      await Toast.fire({
        icon: 'success',
        title: isDraft ? message : '芜湖～发布成功！这波输出直接拉满💥',
        background: isDraft ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: isDraft ? '#555' : '#fff'
      })

      router.push('/home')
    } else {
      ElMessage.error(res.msg || '发布失败')
    }
  } catch (error) {
    console.error('Publish error:', error)
    ElMessage.error('发布服务出错')
  } finally {
    isPublishing.value = false
  }
}
</script>
