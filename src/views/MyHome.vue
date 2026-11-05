<template>
  <div class="common-layout">
    <div class="my-home-container soft-page-bg">
      <div class="page-inner">
        <Navbar />
        <main class="main-content">
        <!-- Profile Header Card -->
        <div
          class="profile-header-card"
          v-motion
          :initial="{ opacity: 0, y: 32, scale: 0.95 }"
          :enter="{
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 500, easing: 'easeOutCubic' }
          }"
        >
          <div class="profile-banner"></div>
          <div class="profile-content">
            <div class="profile-main">
              <div class="avatar-wrapper">
                <el-avatar :size="100" :src="userInfo.avatarUrl || userStore.userInfo.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="profile-avatar" />
              </div>
              <div class="profile-text">
                <h1 class="profile-name">{{ userInfo.nickname || userStore.userInfo.nickname || '用户' }}</h1>
                <p class="profile-bio">{{ userInfo.motto || userInfo.bio || '在星河中寻找灵感的旅人' }}</p>
                <p class="profile-join-date">
                  <el-icon><Calendar /></el-icon> {{ joinText }}
                </p>
              </div>
              <div class="profile-actions" v-if="isSelfProfile">
                <el-button v-if="userStore.isAdmin" type="warning" round class="admin-btn" @click="goToAdmin">
                  <el-icon><Monitor /></el-icon> 管理面板
                </el-button>
                <el-button type="primary" round class="edit-btn" @click="$router.push('/settings')">
                  <el-icon><Edit /></el-icon> 编辑资料
                </el-button>
                <el-button circle class="share-btn" @click="$router.push('/change-password')" title="修改密码">
                  <el-icon><Lock /></el-icon>
                </el-button>
              </div>
            </div>
            
            <div class="profile-stats">
              <div
                class="stat-item stat-articles"
                v-motion
                :initial="{ opacity: 0, y: 40, scale: 0.85 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: 120, duration: 520, easing: 'easeOutCubic' }
                }"
              >
                <FileText class="stat-icon stat-icon-articles" stroke-width="1.2" />
                <span class="stat-value">{{ userInfo.blogCount || blogs.length || 0 }}</span>
                <span class="stat-label">文章</span>
              </div>
              <div
                class="stat-item stat-likes"
                v-motion
                :initial="{ opacity: 0, y: 40, scale: 0.85 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: 220, duration: 520, easing: 'easeOutCubic' }
                }"
              >
                <Heart class="stat-icon stat-icon-likes" stroke-width="1.2" />
                <span class="stat-value">{{ userInfo.totalLikes || '0' }}</span>
                <span class="stat-label">获赞</span>
              </div>
              <div
                class="stat-item stat-views"
                v-motion
                :initial="{ opacity: 0, y: 40, scale: 0.85 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: 320, duration: 520, easing: 'easeOutCubic' }
                }"
              >
                <Eye class="stat-icon stat-icon-views" stroke-width="1.2" />
                <span class="stat-value">{{ userInfo.totalViews || '0' }}</span>
                <span class="stat-label">阅读</span>
              </div>
              <div
                class="stat-item stat-fans"
                v-motion
                :initial="{ opacity: 0, y: 40, scale: 0.85 }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: 420, duration: 520, easing: 'easeOutCubic' }
                }"
              >
                <StarIcon class="stat-icon stat-icon-fans" stroke-width="1.2" />
                <span class="stat-value">{{ userInfo.totalFavorites || '0' }}</span>
                <span class="stat-label">收藏</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Content Tabs -->
        <div class="content-tabs-wrapper">
          <div class="tab-button-group">
            <button
              type="button"
              class="tab-pill"
              :class="{ active: activeTab === 'articles' }"
              @click="activeTab = 'articles'"
            >
              <FileText class="tab-pill-icon" stroke-width="1.2" :size="16" />
              <span>{{ isSelfProfile ? '我的文章' : '创作文章' }}</span>
            </button>
            <button
              v-if="isSelfProfile"
              type="button"
              class="tab-pill"
              :class="{ active: activeTab === 'collections' }"
              @click="activeTab = 'collections'"
            >
              <Heart class="tab-pill-icon" stroke-width="1.2" :size="16" />
              <span>我的收藏</span>
            </button>
          </div>

          <div v-if="activeTab === 'articles'" v-loading="loading" class="blog-list">
            <el-empty v-if="!loading && blogs.length === 0" description="暂无文章，快去创作吧！" />
            <el-row :gutter="20" v-else>
              <el-col :span="24" v-for="(blog, index) in blogs" :key="blog.id" class="blog-col">
                <el-card
                  class="blog-card"
                  shadow="hover"
                  @click="readBlog(blog.id)"
                  v-motion
                  :initial="{ opacity: 0, y: 24, scale: 0.95 }"
                  :enter="{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        delay: index * 80,
                        duration: 360,
                        easing: 'easeOutCubic'
                      }
                    }"
                  >
                    <!-- 文章状态水印 -->
                    <div v-if="isSelfProfile" class="article-status-badge" :class="{
                      'is-published': blog.status === 1,
                      'is-draft': blog.status === 0,
                      'is-hidden': blog.status === 2
                    }">
                      {{ blog.status === 1 ? '已发布' : (blog.status === 2 ? '强制下架' : '草稿') }}
                    </div>

                    <div class="blog-content-wrapper">
                    <div class="blog-cover" v-if="blog.coverImage">
                      <el-image :src="blog.coverImage" fit="cover" class="cover-image" lazy>
                        <template #placeholder>
                          <div class="image-placeholder">
                            <el-icon><Picture /></el-icon>
                          </div>
                        </template>
                      </el-image>
                    </div>
                    <div class="blog-main">
                      <h3 class="blog-title">{{ blog.title }}</h3>
                      <p class="blog-summary">{{ blog.summary }}</p>
                      <div class="blog-footer">
                        <div class="blog-meta">
                          <span class="meta-item date">{{ blog.date }}</span>
                          <div class="blog-stats">
                          <span class="blog-stat-item">
                            <Eye class="blog-stat-icon" :stroke-width="1.8" /> {{ blog.views || 0 }}
                          </span>
                          <span class="blog-stat-item">
                            <Heart class="blog-stat-icon" :stroke-width="1.8" /> {{ blog.likes || 0 }}
                          </span>
                          <span class="blog-stat-item">
                            <Bookmark class="blog-stat-icon" :stroke-width="1.8" /> {{ blog.favorites || 0 }}
                          </span>
                          </div>
                        </div>
                        <div class="blog-actions" v-if="isSelfProfile">
                          <el-tooltip
                            v-if="blog.status === 2"
                            content="该文章已被强制下架，无法编辑"
                            placement="top"
                          >
                            <span class="is-disabled-link">
                              <el-button type="primary" link :icon="Edit" disabled>编辑</el-button>
                            </span>
                          </el-tooltip>
                          <el-button v-else type="primary" link :icon="Edit" @click.stop="handleEdit(blog.id)">编辑</el-button>
                          <el-button type="danger" link :icon="Delete" @click.stop="handleDelete(blog.id)">删除</el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <div
            v-else-if="activeTab === 'collections' && isSelfProfile"
            v-loading="loading"
            class="blog-list"
          >
            <el-empty v-if="!loading && favoriteBlogs.length === 0" description="暂无收藏的文章" />
            <el-row :gutter="20" v-else>
              <el-col
                v-for="(blog, index) in favoriteBlogs"
                :key="blog.id"
                :xs="24"
                :sm="24"
                :md="12"
                :lg="12"
                class="blog-col"
              >
                <el-card
                  class="blog-card collection-card"
                  shadow="hover"
                  @click="readBlog(blog.id)"
                  v-motion
                  :initial="{ opacity: 0, y: 24, scale: 0.95 }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      delay: index * 80,
                      duration: 360,
                      easing: 'easeOutCubic'
                    }
                  }"
                >
                  <div v-if="blog.coverImage" class="collection-cover">
                    <el-image :src="blog.coverImage" fit="cover" class="collection-cover-image" lazy>
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                  <div class="collection-main">
                    <h3 class="collection-title">{{ blog.title }}</h3>
                    <div class="collection-meta">
                      <span class="collection-author">
                        {{ blog.authorName || userInfo.nickname || userStore.userInfo.nickname || '作者' }}
                      </span>
                      <span class="collection-dot"> - </span>
                      <span class="collection-date">{{ blog.date }}</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { EditPen, Edit, Share, Calendar, Picture, Delete, Lock, Monitor } from '@element-plus/icons-vue'
import { FileText, Heart, Eye, Star as StarIcon, Bookmark } from 'lucide-vue-next'
import { getUserBlogList, getUserStats, deleteBlog, getUserFavoriteBlogList } from '@/api/blog'
import { getUserInfo } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const activeTab = ref('articles')
const loading = ref(false)
const blogs = ref([])
const favoriteBlogs = ref([])
const userInfo = ref({})

const targetUserId = computed(() => {
  return route.query.userId || userStore.userInfo.id
})

const isSelfProfile = computed(() => {
  const loggedInId = userStore.userInfo.id
  const queryId = route.query.userId
  if (!queryId) return true
  if (!loggedInId) return false
  return String(queryId) === String(loggedInId)
})

const joinText = computed(() => {
  const raw = userInfo.value.createTime || userStore.userInfo.createTime
  if (!raw) return '2025年加入'
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return '2025年加入'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}年${month}月加入`
})

// Fetch User Info
const fetchUserInfoData = async () => {
  if (!targetUserId.value) return
  try {
    const res = await getUserInfo(targetUserId.value)
    if (res.code === 200) {
      userInfo.value = { ...userInfo.value, ...res.data }
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
  }
}

// Fetch User Stats
const fetchUserStatsData = async () => {
  if (!targetUserId.value) return
  try {
    const res = await getUserStats(targetUserId.value)
    if (res.code === 200) {
      userInfo.value = { ...userInfo.value, ...res.data }
    }
  } catch (error) {
    console.error('Failed to fetch user stats:', error)
  }
}

// Fetch User Blogs
const fetchMyBlogs = async () => {
  if (!targetUserId.value) return
  loading.value = true
  try {
    const res = await getUserBlogList(targetUserId.value, 1, 100)
    if (res.code === 200) {
      blogs.value = res.data.records.map(blog => ({
        ...blog,
        date: blog.createTime,
        views: blog.viewCount ?? blog.views ?? 0,
        likes: blog.likeCount ?? blog.likes ?? 0,
        favorites: blog.collectCount ?? blog.favorites ?? blog.favoriteCount ?? 0,
        coverImage: blog.coverImage ?? blog.cover ?? ''
      }))
    }
  } catch (error) {
    console.error('Failed to fetch my blogs:', error)
  } finally {
    loading.value = false
  }
}

// Fetch Favorite Blogs
const fetchFavoriteBlogs = async () => {
  if (!isSelfProfile.value || !userStore.userInfo.id) return
  loading.value = true
  try {
    const res = await getUserFavoriteBlogList(userStore.userInfo.id, 1, 100)
    if (res.code === 200) {
      favoriteBlogs.value = res.data.records.map(blog => ({
        ...blog,
        date: blog.createTime,
        views: blog.viewCount ?? blog.views ?? 0,
        likes: blog.likeCount ?? blog.likes ?? 0,
        coverImage: blog.coverImage ?? blog.cover ?? ''
      }))
    }
  } catch (error) {
    console.error('Failed to fetch favorite blogs:', error)
  } finally {
    loading.value = false
  }
}

const readBlog = (id) => {
  router.push(`/article/${id}`)
}

const goToAdmin = () => {
  router.push('/admin')
}

const handleEdit = (id) => {
  router.push(`/edit/${id}`)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇博客吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const res = await deleteBlog(id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      // Refresh list and stats
      fetchMyBlogs()
      fetchUserStatsData()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete blog:', error)
    }
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

watch(
  () => [userStore.userInfo.id, route.query.userId],
  () => {
    fetchUserInfoData()
    fetchUserStatsData()
    fetchMyBlogs()
    if (activeTab.value === 'collections') {
      fetchFavoriteBlogs()
    }
  }
)

watch(activeTab, (newTab) => {
  if (newTab === 'articles') {
    fetchMyBlogs()
  } else if (newTab === 'collections') {
    fetchFavoriteBlogs()
  }
})

onMounted(() => {
  fetchUserInfoData()
  fetchUserStatsData()
  fetchMyBlogs()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

.my-home-container {
  min-height: 100vh;
  color: #303133;
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

/* Profile Card Styles */
.profile-header-card {
  background: var(--card-bg);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--card-shadow-soft);
  margin-bottom: 40px;
  border: 1px solid var(--card-border);
  backdrop-filter: blur(20px);
}

.profile-banner {
  height: 200px;
  background: linear-gradient(135deg, #e9d5ff 0%, #c4e3ff 45%, #fde2ff 100%);
  position: relative;
}

.profile-content {
  padding: 0 40px 30px;
  position: relative;
}

.profile-main {
  display: flex;
  align-items: flex-end;
  margin-bottom: 30px;
  position: relative;
  top: -40px; /* Pull avatar up */
  margin-bottom: -20px; /* Adjust spacing */
}

.avatar-wrapper {
  padding: 4px;
  background: var(--card-bg);
  border-radius: 50%;
  margin-right: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.profile-avatar {
  border: 4px solid #fff;
}

.profile-text {
  flex: 1;
  padding-bottom: 10px;
}

.profile-name {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.profile-bio {
  color: #606266;
  font-size: 1rem;
  margin: 0 0 8px 0;
}

.profile-join-date {
  color: #909399;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.profile-actions {
  padding-bottom: 15px;
  display: flex;
  gap: 12px;
}

.edit-btn {
  background: linear-gradient(90deg, #667eea, #764ba2);
  border: none;
  font-weight: 600;
}

.edit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
}

.share-btn {
  background: #f4f4f5;
  border: 1px solid #e4e7ed;
  color: #606266;
}

.share-btn:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.profile-stats {
  display: flex;
  gap: 0;
  background: transparent;
  border-radius: 16px;
  padding: 10px 0 4px;
  margin-top: 10px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: none;
  background: #f5f5f7;
  border-radius: 24px;
  margin: 0 8px;
  padding: 11px 0 9px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  border: 1px solid #e4e6f0;
}

.stat-value {
  font-size: 1.12rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat-label {
  color: #909399;
  font-size: 0.8rem;
}

.stat-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.stat-articles {
}

.stat-icon-articles {
  color: #a855f7;
}

.stat-icon-likes {
  color: #ef4444;
}

.stat-icon-views {
  color: #0ea5e9;
}

.stat-icon-fans {
  color: #f59e0b;
}

/* Tabs & Blog List */
.content-tabs-wrapper {
  margin-top: 24px;
}

.tab-button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}

.tab-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid #e0ddd8;
  background: #f3f1ed;
  color: #5f6473;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-pill:hover {
  background: #f8f6f2;
  border-color: #d7d2c7;
}

.tab-pill.active {
  background: linear-gradient(135deg, #f5e1ff, #e3d5ff);
  color: #111827;
  border-color: #c4b5fd;
  box-shadow: 0 3px 10px rgba(148, 163, 184, 0.25);
}

.tab-pill-icon {
  font-size: 14px;
}

.blog-list {
  margin-top: 20px;
}

.blog-col {
  margin-bottom: 16px;
}

.blog-card {
  background: var(--card-bg);
  border-radius: 18px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid var(--card-border);
  box-shadow: var(--card-shadow-soft);
  backdrop-filter: blur(18px);
  position: relative; /* 为水印定位提供参考 */
}

/* 文章状态水印样式 */
.article-status-badge {
  position: absolute;
  top: 12px;
  right: -30px;
  width: 120px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  transform: rotate(35deg); /* 左斜朝上 */
  z-index: 10;
  letter-spacing: 2px;
  text-transform: uppercase;
  pointer-events: none; /* 防止遮挡点击 */
  /* 移除边框和阴影，增强水印的融合感 */
  box-shadow: none;
  border: none;
  opacity: 0.9; /* 整体透明度，使其更有水印感 */
}

.article-status-badge.is-published {
  background: rgba(34, 197, 94, 0.05); /* 极淡绿色背景 */
  color: rgba(22, 163, 74, 0.5); /* 柔和的半透明绿色文字 */
}

.article-status-badge.is-draft {
  background: rgba(148, 163, 184, 0.05); /* 极淡灰色背景 */
  color: rgba(71, 85, 105, 0.5); /* 柔和的半透明灰色文字 */
}

.article-status-badge.is-hidden {
  background: rgba(244, 63, 94, 0.05); /* 极淡红色背景 */
  color: rgba(225, 29, 72, 0.5); /* 柔和的半透明红色文字 */
}

.collection-card :deep(.el-card__body) {
  padding: 0;
}

.collection-cover {
  width: 100%;
  height: 150px;
  overflow: hidden;
}

.collection-cover-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.collection-main {
  padding: 14px 18px 16px;
}

.collection-title {
  margin: 0 0 6px 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #111827;
}

.collection-title:hover {
  color: #667eea;
}

.collection-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #535861;
}

.collection-author {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-dot {
  font-size: 0.9rem;
}

.collection-date {
  flex-shrink: 0;
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 55px rgba(15, 23, 42, 0.12);
}

.blog-content-wrapper {
  display: flex;
  gap: 20px;
  padding: 0;
}

.blog-cover {
  width: 160px;
  height: 110px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.cover-image {
  width: 100%;
  height: 100%;
   transition: transform 0.3s ease;
}

.blog-card:hover .blog-cover .cover-image,
.collection-card:hover .collection-cover-image {
  transform: scale(1.18);
}

.blog-card:active .blog-cover .cover-image,
.collection-card:active .collection-cover-image {
  transform: scale(1.06);
}

.blog-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px 0;
}

.blog-title {
  color: #111827;
  font-size: 1.2rem;
  margin: 0 0 8px 0;
  line-height: 1.4;
  font-weight: 700;
}

.blog-title:hover {
  color: #667eea;
}

.blog-summary {
  color: #4b5563;
  font-size: 0.95rem;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.blog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.blog-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #6b7280;
  font-size: 0.85rem;
}

.blog-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #6b7280;
  font-size: 0.85rem;
}

.blog-stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.blog-stat-icon {
  width: 14px;
  height: 14px;
}

.blog-actions {
  display: flex;
  gap: 8px;
}

.is-disabled-link {
  cursor: not-allowed;
  display: inline-block;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.like-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  color: #909399;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
}
</style>
