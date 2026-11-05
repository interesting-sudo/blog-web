<template>
  <div class="common-layout">
    <div class="home-container soft-page-bg">
      <div class="page-inner">
        <Navbar />

        <main class="main-content">
        <!-- Hero Section with Search -->
        <div
          class="hero-section"
          v-motion
          :initial="{ opacity: 0, y: 40, scale: 0.94 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
              duration: 650,
              easing: 'easeOutCubic'
            }
          }"
        >
          <div class="hero-badge">
            <span class="badge-icon">✏️</span>
            记录灵感，沉淀成长
          </div>
          <h1 class="hero-title">
            在 <span class="hero-logo-word">iBlog</span><br />写下你的思考与实践
          </h1>
          <p class="hero-subtitle">
            从代码片段到生活感悟，在这里整理、复盘、分享每一次成长
          </p>
          <div class="search-box">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文章、内容、…"
              class="search-input"
              size="large"
            >
              <template #prefix>
                <el-icon class="search-icon"><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="category-filter" v-if="categories.length">
            <button
              class="category-arrow left"
              type="button"
              @click="scrollCategories('left')"
              v-motion
              :whileHover="{ scale: 1.08 }"
              :whileTap="{ scale: 0.9 }"
            >
              <el-icon><ArrowLeft /></el-icon>
            </button>
            <div class="category-scroll" ref="categoryScrollRef">
              <div
                v-for="cat in categories"
                :key="cat.id"
                class="category-pill"
                :class="{ active: cat.id === activeCategoryId }"
                @click="handleCategoryChange(cat.id)"
              >
                {{ cat.name }}
              </div>
            </div>
            <button
              class="category-arrow right"
              type="button"
              @click="scrollCategories('right')"
              v-motion
              :whileHover="{ scale: 1.08 }"
              :whileTap="{ scale: 0.9 }"
            >
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
        </div>

          <!-- Blog List -->
          <div
            class="blog-list-container"
            v-loading="loading && !loadingMore"
            element-loading-text="正在加载文章..."
            element-loading-background="rgba(255, 255, 255, 0.8)"
          >
            <el-empty v-if="!loading && blogs.length === 0" description="没有找到相关文章" />
            <div v-else-if="!loading" class="masonry-grid">
              <div
                v-for="(blog, index) in blogs"
                :key="blog.id"
                class="masonry-item"
                v-motion
                :initial="{ opacity: 0, y: 40, scale: 0.92 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: index * 90,
                    duration: 420,
                    easing: 'easeOutCubic'
                  }
                }"
              >
                <el-card
                  class="blog-card"
                  shadow="hover"
                  @click="readBlog(blog.id)"
                >
                  <div class="blog-cover" v-if="blog.coverImage">
                    <el-image
                      :src="blog.coverImage"
                      fit="cover"
                      class="cover-image"
                      lazy
                    >
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="cover-overlay">
                      <div class="cover-tags" v-if="blog.tags && blog.tags.length > 0">
                        <span
                          v-for="tag in blog.tags"
                          :key="tag"
                          class="cover-tag-pill"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="blog-main">
                    <h3 class="blog-title" @click.stop="readBlog(blog.id)" v-html="blog.title"></h3>
                    <p class="blog-summary" v-html="blog.summary"></p>
                    <div class="blog-footer">
                      <div class="author-info">
                        <el-avatar :size="22" :src="blog.authorAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
                        <span class="author-name">{{ blog.authorName }}</span>
                      </div>
                      <div class="blog-stats">
                        <span class="stat-item">
                          <Eye class="stat-icon" :stroke-width="1.8" /> {{ blog.views || 0 }}
                        </span>
                        <span class="stat-item">
                          <Heart class="stat-icon" :stroke-width="1.8" /> {{ blog.likes || 0 }}
                        </span>
                        <span class="stat-item">
                          <Bookmark class="stat-icon" :stroke-width="1.8" /> {{ blog.favorites || 0 }}
                        </span>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { EditPen, ArrowLeft, ArrowRight, Search, Picture } from '@element-plus/icons-vue'
import { Eye, Heart, Bookmark } from 'lucide-vue-next'
import { getBlogList, getCategoryList } from '@/api/blog'
import { searchBlogs } from '@/api/search'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const searchQuery = ref('')
const loading = ref(false)
const loadingMore = ref(false)
const blogs = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
let searchTimer = null

const categories = ref([{ id: 0, name: '全部' }])
const activeCategoryId = ref(0)
const categoryScrollRef = ref(null)

const fetchBlogs = async (isLoadMore = false) => {
  if (loading.value || loadingMore.value) return
  if (isLoadMore && blogs.value.length >= total.value && total.value > 0) return

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    blogs.value = []
  }
  try {
    const res = await getBlogList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: activeCategoryId.value || undefined
    })
    if (res.code === 200) {
      const list = res.data.records.map(blog => ({
        ...blog,
        date: blog.createTime, // Map createTime to date for template
        category: blog.categoryName, // Map categoryName to category for template
        views: blog.viewCount ?? blog.views ?? 0,
        likes: blog.likeCount ?? blog.likes ?? 0,
        favorites: blog.collectCount ?? blog.favorites ?? blog.favoriteCount ?? 0,
        coverImage: blog.coverImage ?? blog.cover ?? '',
        tags: blog.tags ? (Array.isArray(blog.tags) ? blog.tags : blog.tags.split(',')) : [],
        authorId: blog.authorId ?? blog.createBy ?? blog.userId ?? null
      }))
      blogs.value = isLoadMore ? [...blogs.value, ...list] : list
      total.value = res.data.total
    }
  } catch (error) {
    // 忽略 401 错误，因为 request.js 已经处理了重定向
    if (error.response && error.response.status === 401) {
      return
    }
    console.error('Failed to fetch blogs:', error)
  } finally {
    if (isLoadMore) {
      loadingMore.value = false
    } else {
      loading.value = false
    }
  }
}

const handleSearch = async (isLoadMore = false) => {
  if (!searchQuery.value.trim()) {
    pageNum.value = 1
    total.value = 0
    fetchBlogs(false)
    return
  }

  if (loading.value || loadingMore.value) return
  if (isLoadMore && blogs.value.length >= total.value && total.value > 0) return

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    blogs.value = []
  }
  try {
    const res = await searchBlogs({
      keyword: searchQuery.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: activeCategoryId.value || undefined
    })
    if (res.code === 200) {
      const list = res.data.records.map(blog => ({
        ...blog,
        // For search results, we might not get createTime, use date if available or empty
        date: blog.createTime || blog.date || '',
        category: blog.categoryName,
        views: blog.viewCount ?? blog.views ?? 0,
        likes: blog.likeCount ?? blog.likes ?? 0,
        favorites: blog.collectCount ?? blog.favorites ?? blog.favoriteCount ?? 0,
        coverImage: blog.coverImage ?? blog.cover ?? '',
        tags: blog.tags ? (Array.isArray(blog.tags) ? blog.tags : blog.tags.split(',')) : [],
        authorId: blog.authorId ?? blog.createBy ?? blog.userId ?? null
      }))
      blogs.value = isLoadMore ? [...blogs.value, ...list] : list
      total.value = res.data.total
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return
    }
    console.error('Failed to search blogs:', error)
  } finally {
    if (isLoadMore) {
      loadingMore.value = false
    } else {
      loading.value = false
    }
  }
}

watch(searchQuery, (newVal) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageNum.value = 1
    total.value = 0
    handleSearch(false)
  }, 500)
})

onMounted(() => {
  fetchBlogs()
})

const loadCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200 && Array.isArray(res.data)) {
      const list = res.data.map(item => ({
        id: item.id,
        name: item.name
      }))
      categories.value = [{ id: 0, name: '全部' }, ...list]
    }
  } catch (error) {
    if (error.response && error.response.status === 401) return
    console.error('Failed to load categories:', error)
  }
}

loadCategories()

const handleScroll = () => {
  if (loading.value || loadingMore.value) return
  if (blogs.value.length >= total.value && total.value > 0) return

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  const clientHeight = window.innerHeight || document.documentElement.clientHeight || 0
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0

  if (scrollTop + clientHeight + 200 >= scrollHeight) {
    pageNum.value += 1
    if (searchQuery.value.trim()) {
      handleSearch(true)
    } else {
      fetchBlogs(true)
    }
  }
}

window.addEventListener('scroll', handleScroll, { passive: true })

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleCategoryChange = (id) => {
  if (id === activeCategoryId.value) return
  activeCategoryId.value = id
  pageNum.value = 1
  total.value = 0
  if (searchQuery.value.trim()) {
    handleSearch(false)
  } else {
    fetchBlogs(false)
  }
}

const scrollCategories = (direction) => {
  const el = categoryScrollRef.value
  if (!el) return

  const distance = 160
  const start = el.scrollLeft
  const target = start + (direction === 'left' ? -distance : distance)
  const duration = 420
  const startTime = performance.now()

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

  const step = (now) => {
    const elapsed = now - startTime
    const t = Math.min(1, elapsed / duration)
    const eased = easeOutCubic(t)
    el.scrollLeft = start + (target - start) * eased
    if (t < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

const getTagType = (category) => {
  const types = ['', 'success', 'warning', 'danger', 'info']
  return types[category?.length % types.length] || ''
}

const readBlog = (id) => {
  router.push(`/article/${id}`)
}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

.page-inner {
  max-width: 1180px;
  margin: 0 auto;
}

.main-content {
  width: 100%;
  padding: 20px 24px 40px;
  box-sizing: border-box;
}

.hero-section {
  text-align: center;
  margin-bottom: 0px;
  padding: 0px 0 24px;
}

.hero-title {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC",
    "Microsoft YaHei", "Segoe UI", system-ui, sans-serif;
  font-size: 2.9rem;
  line-height: 1.3;
  margin-bottom: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: linear-gradient(120deg, #8064ff, #b06bff);
  -webkit-background-clip: text;
  color: transparent;
}

.hero-logo-word {
  font-family: 'Dancing Script', cursive;
  font-weight: 800;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  /* margin-bottom: -px; */
  font-size: 13px;
  border-radius: 999px;
  background: rgba(248, 150, 69, 0.08);
  color: #c05621;
}

.badge-icon {
  font-size: 14px;
}

.hero-subtitle {
  margin: 0 0 20px;
  font-size: 0.95rem;
  color: #4b5563;
}

.search-box {
  max-width: 600px;
  margin: 0 auto;
}

.category-filter {
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 4px 0;
}

.category-scroll {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  max-width: 720px;
  overflow-x: auto;
  padding: 4px 2px;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-arrow {
  width: 26px;
  height: 26px;
  border-radius: 999px;
  border: none;
  background: #f3f1ed;
  color: #a0a4b1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
}

.category-arrow:hover {
  background: #e4e0d9;
  color: #6b7280;
}

.category-pill {
  min-width: 64px;
  padding: 7px 18px;
  border-radius: 999px;
  background: #ebe8e5;
  color: #5f6473;
  font-size: 13px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #e0ddd8;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.category-pill:hover {
  background: #f8f6f2;
  border-color: #d7d2c7;
}

.category-pill.active {
  background: linear-gradient(135deg, #a855f7, #3b82f6);
  color: #ffffff;
  border-color: transparent;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 50px;
  padding-left: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
  transition: all 0.3s;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  border-color: #667eea;
}

.blog-list-container {
  width: 100%;
  padding: 0;
  min-height: 300px; /* Ensure loading spinner has space */
}

.masonry-grid {
  column-count: 3;
  column-gap: 20px;
}

.masonry-item {
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  display: inline-block;
  width: 100%;
  margin: 0 0 20px;
}

.blog-card {
  border-radius: 20px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  transition: all 0.3s ease;
  box-shadow: var(--card-shadow-soft);
  cursor: pointer;
  backdrop-filter: blur(18px);
  padding: 0;
  overflow: hidden;
}

.blog-card :deep(.el-card__body) {
  padding: 0;
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 55px rgba(15, 23, 42, 0.12);
}

.blog-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 16px 12px;
}

.blog-cover {
  width: 100%;
  height: 190px;
  position: relative;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.blog-card:hover .cover-image {
  transform: scale(1.05);
}

.blog-card:active .cover-image {
  transform: scale(1.03);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(248, 250, 252, 0.78) 0%,
    rgba(248, 250, 252, 0.0) 32%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px 14px 10px;
  pointer-events: none;
}

.cover-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cover-tag-pill {
  padding: 3px 10px;
  font-size: 12px;
  border-radius: 999px;
  background: rgba(196, 181, 253, 0.92);
  color: #fff;
  pointer-events: auto;
}

.cover-action-btn {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: none;
  background: rgba(15, 23, 42, 0.6);
  color: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;
}

.cover-action-btn:hover {
  background: rgba(37, 99, 235, 0.9);
  color: #f9fafb;
}

.blog-tags {
  display: flex;
  gap: 8px;
  margin-left: auto; /* Push tags to the right side of the footer, effectively near the image */
}

.blog-tag {
  border: none;
  background-color: #f4f4f5;
  color: #909399;
}

@media (max-width: 1200px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (max-width: 768px) {
  .masonry-grid {
    column-count: 1;
  }
}

.blog-date {
  color: #909399;
  font-size: 0.85rem;
}

.blog-title {
  margin: 0 0 5px 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1.3;
}

.blog-title:hover {
  color: #667eea;
}

.blog-summary {
  color: #555;
  font-size: 0.90rem;
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
}

.blog-stats {
  display: flex;
  gap: 12px;
  color: #909399;
  font-size: 0.9rem;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  width: 14px;
  height: 14px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 0.72rem;
  color: #606266;
  font-weight: 500;
}

.read-more {
  font-size: 0.95rem;
  font-weight: 600;
  color: #667eea;
  margin-left: auto;
}

.read-more:hover {
  color: #764ba2;
}

.blog-title :deep(em),
.blog-summary :deep(em) {
  color: #f56c6c;
  font-style: normal;
  font-weight: bold;
}
</style>
