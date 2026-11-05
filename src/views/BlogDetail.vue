<template>
  <div class="article-detail-container soft-page-bg">
    <div class="page-inner">
      <Navbar />
      <main class="main-body">
        <div class="content-wrapper">
          <el-row :gutter="24" class="main-row">
            
            <!-- Action Sidebar / 左侧操作栏 -->
            <el-col :xs="0" :sm="0" :md="2" :lg="2" :xl="2">
              <div
                class="action-sidebar"
                :style="actionSidebarStyle"
                v-motion
                :initial="{ opacity: 0, x: -24, scale: 0.96 }"
                :enter="{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: { delay: 180, duration: 450, easing: 'easeOutCubic' }
                }"
              >
                <div class="action-item back-btn" @click="$router.back()">
                  <div class="action-icon-wrapper">
                    <ChevronLeft class="sidebar-icon" :stroke-width="2" />
                  </div>
                </div>

                <div class="action-item" @click="likeArticle">
                  <el-badge
                    :value="article.likes"
                    :max="99"
                    class="item-badge"
                    :hidden="article.likes === 0"
                    type="info"
                  >
                    <div class="action-icon-wrapper" :class="{ 'like-active': article.isLiked }">
                      <Heart class="sidebar-icon" :stroke-width="article.isLiked ? 2.2 : 1.8" />
                    </div>
                  </el-badge>
                </div>

                <div class="action-item" @click="scrollToComments">
                  <el-badge
                    :value="comments.length"
                    :max="99"
                    class="item-badge"
                    :hidden="comments.length === 0"
                    type="info"
                  >
                    <div class="action-icon-wrapper">
                      <MessageCircle class="sidebar-icon" :stroke-width="1.8" />
                    </div>
                  </el-badge>
                </div>

                <div class="action-item" @click="favoriteArticle">
                  <el-badge
                    :value="article.favoriteCount"
                    :max="99"
                    class="item-badge"
                    :hidden="article.favoriteCount === 0"
                    type="info"
                  >
                    <div class="action-icon-wrapper" :class="{ 'favorite-active': article.isFavorited }">
                      <Bookmark class="sidebar-icon" :stroke-width="article.isFavorited ? 2.2 : 1.8" />
                    </div>
                  </el-badge>
                </div>

                <div class="action-item">
                  <div class="action-icon-wrapper">
                    <AlertCircle class="sidebar-icon" :stroke-width="1.9" />
                  </div>
                </div>
              </div>
            </el-col>

            <!-- Left Content: Article / 左侧文章区域 -->
            <el-col
              :xs="24"
              :sm="24"
              :md="hasToc ? 15 : 20"
              :lg="hasToc ? 16 : 20"
              :xl="hasToc ? 16 : 20"
            >
              <div class="left-column">
                <el-card
                  class="article-card"
                  shadow="never"
                  v-motion
                  :initial="{ opacity: 0, y: 32, scale: 0.95 }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 500, easing: 'easeOutCubic' }
                  }"
                >
                  <!-- 文章标题区 -->
                  <h1 class="article-title">{{ article.title }}</h1>
                  
                  <div class="article-meta">
                    <div class="meta-left">
                      <div class="meta-author" @click="goToAuthorHome">
                        <el-avatar :size="24" :src="article.authorAvatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" style="margin-right: 8px;" />
                        <span class="meta-item author-name">{{ article.authorName || 'Admin' }}</span>
                      </div>
                      <span class="dot">·</span>
                      <span class="meta-item">{{ article.date }}</span>
                      <span class="dot">·</span>
                      <span class="meta-item">
                        <el-icon style="vertical-align: -2px; margin-right: 4px;"><View /></el-icon>
                        {{ article.views }} 阅读
                      </span>
                      <span class="dot" v-if="article.category">·</span>
                      <el-tag v-if="article.category" size="small" effect="light" round>{{ article.category }}</el-tag>
                    </div>
                  </div>

                  <!-- 正文内容 -->
                  <div class="article-content" v-html="article.content"></div>

                  <!-- 底部标签与操作 -->
                  <div class="article-footer">
                    <div class="tags-group">
                      <el-tag 
                        v-for="tag in article.tags" 
                        :key="tag" 
                        class="tag-pill"
                        effect="plain"
                      >
                        # {{ tag }}
                      </el-tag>
                    </div>
                  </div>
                </el-card>

                <!-- 评论区 -->
                <div
                  class="comments-card"
                  v-motion
                  :initial="{ opacity: 0, y: 24, scale: 0.97 }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { delay: 520, duration: 460, easing: 'easeOutCubic' }
                  }"
                >
                  <div class="comments-header">
                    <h3>评论 <span class="count">({{ comments.length }})</span></h3>
                  </div>
                  
                  <div class="comment-input-wrapper">
                    <el-avatar :size="28" :src="userStore.userInfo.avatarUrl || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="user-avatar-input"/>
                    <div class="input-box">
                      <el-input
                        v-model="newComment"
                        type="textarea"
                        :rows="3"
                        placeholder="友善的评论是交流的起点..."
                        resize="none"
                        maxlength="1000"
                        show-word-limit
                        class="custom-textarea"
                      />
                      <div class="input-actions">
                        <el-button type="primary" round @click="submitComment">发送评论</el-button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="comment-list">
                    <div v-if="comments.length === 0" class="empty-comment" style="text-align:center;color:#999;padding:20px;">
                      暂无评论，快来抢沙发吧~
                    </div>
                    <transition-group name="list">
                      <div v-for="comment in comments" :key="comment.id" class="comment-item">
                        <div class="root-comment-container" style="display:flex; gap:16px; width:100%;">
                            <div class="comment-avatar-wrapper" @click="goToUserHome(comment)">
                              <el-avatar :size="30" :src="resolveCommentAvatar(comment)" />
                            </div>
                            <div class="comment-content" style="flex:1;">
                              <div class="comment-info">
                                <span class="author-name" @click="goToUserHome(comment)">{{ comment.nickname }}</span>
                                <span v-if="isArticleAuthor(comment)" class="author-badge">作者</span>
                              </div>
                              <div class="comment-text">{{ comment.content }}</div>
                              <div class="comment-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                                <div class="actions-left" style="display: flex; gap: 16px; align-items: center;">
                                  <span class="comment-time" style="color: #999; font-size: 12px;">{{ formatTime(comment.createTime) }}</span>
                                  <span class="action-btn hover-blue" @click="replyComment(comment)" style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 13px;">
                                    <el-icon><ChatDotRound /></el-icon> 
                                     {{ comment.children && comment.children.length > 0 ? `${comment.children.length}` : '' }}
                                  </span>
                                </div>
                                <div class="actions-right">
                                  <span
                                    class="action-btn hover-blue comment-like"
                                    @click="handleCommentLike(comment)"
                                    :class="{ 'liked': comment.isLiked }"
                                    style="cursor: pointer; display: flex; align-items: center; gap: 4px; font-size: 13px;"
                                  >
                                    <Heart
                                      class="comment-like-icon"
                                      :class="{ 'comment-like-icon--active': comment.isLiked }"
                                      :stroke-width="comment.isLiked ? 2.2 : 1.8"
                                    />
                                    {{ comment.likeCount || 0 }}
                                  </span>
                                </div>
                              </div>
                              
                              <!-- Inline Reply Box (Root) -->
                              <transition name="slide-fade">
                                <div v-if="activeReplyId === comment.id" class="inline-reply-box">
                                  <el-input
                                    v-model="replyContent"
                                    type="textarea"
                                    :rows="2"
                                    :placeholder="`回复 ${replyTarget?.nickname || '用户'}...`"
                                    resize="none"
                                    maxlength="1000"
                                    show-word-limit
                                    class="reply-textarea"
                                  />
                                  <div class="reply-actions">
                                    <el-button size="small" @click="activeReplyId = null">取消</el-button>
                                    <el-button type="primary" size="small" @click="submitReply">发布</el-button>
                                  </div>
                                </div>
                              </transition>

                              <!-- Sub Comments（二级回复，更深楼层已拍平到此） -->
                              <div v-if="comment.children && comment.children.length > 0" class="sub-comments">
                                <div v-for="child in (comment.isExpanded ? comment.children : comment.children.slice(0, 1))" :key="child.id" class="child-comment-item">
                                    <div class="comment-avatar-wrapper" @click="goToUserHome(child)">
                                      <el-avatar :size="30" :src="resolveCommentAvatar(child)" />
                                    </div>
                                    <div class="comment-content" style="flex:1;">
                                      <div class="comment-info">
                                        <span class="author-name" style="font-size:13px;" @click="goToUserHome(child)">{{ child.nickname }}</span>
                                        <span v-if="isArticleAuthor(child)" class="author-badge">作者</span>
                                        
                                        <!-- === 新增逻辑：显示回复对象 === -->
                                        <template v-if="child.replyToName">
                                          <span style="margin: 0 4px; color: #999; font-size: 12px;">回复</span>
                                          <span class="author-name" style="font-size: 13px">{{ child.replyToName }}</span>
                                        </template>
                                        <!-- =========================== -->

                                      </div>
                                      <div class="comment-text" style="font-size:13px;">{{ child.content }}</div>
                                      <div class="comment-actions" style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                                        <div class="actions-left" style="display: flex; gap: 16px; align-items: center;">
                                          <span class="comment-time" style="color: #999; font-size: 12px;">{{ formatTime(child.createTime) }}</span>
                                          <span class="action-btn hover-blue" style="font-size:12px; cursor: pointer; display: flex; align-items: center; gap: 4px;" @click="replyComment(child)">
                                            <el-icon><ChatDotRound /></el-icon> 回复
                                          </span>
                                        </div>
                                        <div class="actions-right">
                                          <span
                                            class="action-btn hover-blue comment-like"
                                            @click="handleCommentLike(child)"
                                            :class="{ 'liked': child.isLiked }"
                                            style="font-size:12px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                                          >
                                            <Heart
                                              class="comment-like-icon"
                                              :class="{ 'comment-like-icon--active': child.isLiked }"
                                              :stroke-width="child.isLiked ? 2.2 : 1.8"
                                            />
                                            {{ child.likeCount || 0 }}
                                          </span>
                                        </div>
                                      </div>

                                      <!-- Inline Reply Box (Child) -->
                                      <transition name="slide-fade">
                                        <div v-if="activeReplyId === child.id" class="inline-reply-box">
                                          <el-input
                                            v-model="replyContent"
                                            type="textarea"
                                            :rows="2"
                                            :placeholder="`回复 ${replyTarget?.nickname || '用户'}...`"
                                            resize="none"
                                            maxlength="1000"
                                            show-word-limit
                                            class="reply-textarea"
                                          />
                                          <div class="reply-actions">
                                            <el-button size="small" @click="activeReplyId = null">取消</el-button>
                                            <el-button type="primary" size="small" @click="submitReply">发布</el-button>
                                          </div>
                                        </div>
                                      </transition>
                                    </div>
                                </div>
                                
                                <div
                                  v-if="!comment.isExpanded && comment.children.length > 1"
                                  class="view-more-btn"
                                  @click="comment.isExpanded = true"
                                >
                                  展开 {{ comment.children.length }} 条回复
                                  <el-icon class="view-more-btn__icon"><ArrowDown /></el-icon>
                                </div>
                              </div>

                            </div>
                        </div>
                      </div>
                    </transition-group>
                  </div>
                </div>
              </div>
            </el-col>

            <!-- Right Sidebar / 右侧侧边栏：仅保留目录导航 -->
            <el-col v-if="hasToc" :xs="24" :sm="24" :md="7" :lg="6" :xl="6">
              <div class="sidebar-wrapper" :style="tocSidebarStyle">
                <div
                  v-if="hasToc"
                  class="sidebar-card toc-card"
                  v-motion
                  :initial="{ opacity: 0, y: 24, scale: 0.97 }"
                  :enter="{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { delay: 260, duration: 420, easing: 'easeOutCubic' }
                  }"
                >
                  <div class="toc-header">
                    <div class="toc-title">
                      <el-icon class="toc-icon"><Menu /></el-icon>
                      <span>目录导航</span>
                    </div>
                    <div class="toc-progress">
                      <div class="toc-progress-bar">
                        <div
                          class="toc-progress-inner"
                          :style="{ width: `${Math.round(tocProgress * 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <ul class="toc-list">
                    <li
                      v-for="item in toc"
                      :key="item.id"
                      :class="['toc-item', `level-${item.level}`, { active: item.id === activeTocId }]"
                      @click="scrollToHeading(item.id)"
                    >
                      <span class="bullet"></span>
                      <span class="toc-text">{{ item.text }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditPen, CaretTop, Star, View, ChatDotRound, Share, Pointer, ArrowDown, Menu } from '@element-plus/icons-vue'
import { ChevronLeft, Heart, MessageCircle, Bookmark, AlertCircle } from 'lucide-vue-next'
import { getBlogDetail, toggleLike, getIsLiked, toggleFavorite, getIsFavorited } from '@/api/blog'
import { addComment, replyComment as apiReplyComment, getCommentList, toggleCommentLike, getLikedComments } from '@/api/comment'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import Navbar from '@/components/Navbar.vue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import hljs from 'highlight.js'

import { formatTime } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const articleId = route.params.id

const article = reactive({
  id: '',
  title: '',
  date: '',
  views: 0,
  likes: 0,
  isLiked: false,
  favoriteCount: 0,
  isFavorited: false,
  category: '',
  coverImage: '',
  tags: [],
  content: '',
  authorName: '',
  authorAvatar: '',
  createBy: ''
})

const comments = ref([])
const newComment = ref('')
const activeReplyId = ref(null)
const replyTarget = ref(null)
const replyContent = ref('')

// 目录导航
const toc = ref([])
const activeTocId = ref(null)
const tocProgress = ref(0)
const hasToc = computed(() => toc.value.length > 0)

const sidebarPosition = reactive({
  enabled: false,
  leftX: 0,
  rightX: 0
})

const updateSidebarPosition = () => {
  const vw = window.innerWidth || document.documentElement.clientWidth || 0
  if (vw < 992) {
    sidebarPosition.enabled = false
    return
  }
  const card = document.querySelector('.article-card')
  if (!card) return
  const rect = card.getBoundingClientRect()
  sidebarPosition.enabled = true
  // 左侧操作栏：稍微离内容远一点，避免遮挡
  sidebarPosition.leftX = rect.left - 96
  // 右侧目录卡片：紧贴内容右侧，而不是贴到页面边缘
  sidebarPosition.rightX = rect.right + 32
}

const actionSidebarStyle = computed(() => {
  if (!sidebarPosition.enabled) return {}
  const left = Math.max(sidebarPosition.leftX, 16)
  return {
    position: 'fixed',
    top: '120px',
    left: `${left}px`,
    zIndex: 20
  }
})

const tocSidebarStyle = computed(() => {
  if (!sidebarPosition.enabled) return {}
  const left = Math.max(sidebarPosition.rightX, 16)
  return {
    position: 'fixed',
    top: '120px',
    left: `${left}px`,
    zIndex: 20
  }
})

// 递归拍平子评论的辅助函数
const flattenChildren = (children, map) => {
  let result = []
  if (!children || children.length === 0) return result
  
  children.forEach(child => {
    // 1. 将当前子评论加入结果集
    result.push(child)
    
    // 2. 将当前子评论的 ID 和 昵称存入 Map，方便后续查找“回复对象”
    map.set(child.id, child.nickname)
    
    // 3. 如果当前子评论还有 children，递归提取，拼接到结果集中
    if (child.children && child.children.length > 0) {
      result = result.concat(flattenChildren(child.children, map))
    }
    
    // 4. 重要：为了避免前端组件如果不小心再次渲染 children 造成死循环或重复
    // 在拍平后，可以清空当前节点的 children（因为它们已经提到上一级了）
    child.children = []
  })
  
  return result
}

const isRootParentId = (pid) => pid == null || pid === 0 || pid === '0'

/** 接口是否已返回嵌套的 children 树 */
const recordsHaveNestedReplies = (records) =>
  Array.isArray(records) && records.some((r) => r.children && r.children.length > 0)

/**
 * 将扁平评论列表整理为「一级根评论 + 二级回复（更深楼层拍平到同一层）」
 */
const buildTwoLevelThreadsFromFlatRecords = (records, likedCommentIds) => {
  const list = Array.isArray(records) ? records : []
  const byId = new Map(list.map((c) => [c.id, c]))

  const inferRootId = (c) => {
    if (isRootParentId(c.parentId)) return c.id
    const rid = c.rootId
    if (rid != null && rid !== '' && rid !== 0 && rid !== '0') return rid
    let cur = c
    const seen = new Set()
    while (cur && !isRootParentId(cur.parentId)) {
      if (seen.has(cur.id)) break
      seen.add(cur.id)
      cur = byId.get(cur.parentId)
    }
    return cur && isRootParentId(cur.parentId) ? cur.id : c.id
  }

  const rootsInOrder = []
  const seenRoot = new Set()
  for (const c of list) {
    if (!isRootParentId(c.parentId)) continue
    if (seenRoot.has(c.id)) continue
    seenRoot.add(c.id)
    rootsInOrder.push(c)
  }

  const repliesByRoot = new Map()
  for (const c of list) {
    if (isRootParentId(c.parentId)) continue
    const rootId = inferRootId(c)
    if (!repliesByRoot.has(rootId)) repliesByRoot.set(rootId, [])
    repliesByRoot.get(rootId).push({ ...c, children: [] })
  }

  return rootsInOrder.map((root) => {
    const idToNameMap = new Map()
    idToNameMap.set(root.id, root.nickname)

    let flatList = repliesByRoot.get(root.id) || []
    flatList.forEach((item) => idToNameMap.set(item.id, item.nickname))

    flatList.forEach((item) => {
      if (
        item.parentId != null &&
        item.parentId !== root.id &&
        item.parentId !== 0 &&
        item.parentId !== '0'
      ) {
        item.replyToName = idToNameMap.get(item.parentId) || '用户'
      } else {
        item.replyToName = null
      }
      item.rootId = root.id
      item.isLiked = likedCommentIds.includes(item.id)
      item.children = []
    })

    flatList.sort(
      (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    )

    return {
      ...root,
      children: flatList,
      isExpanded: false,
      isLiked: likedCommentIds.includes(root.id)
    }
  })
}

const applyCodeHighlight = async () => {
  await nextTick()
  const blocks = document.querySelectorAll('.article-content pre code')
  if (!blocks || !blocks.length) return
  blocks.forEach((block) => {
    if (block.dataset.highlighted === 'true') return
    hljs.highlightElement(block)

    const pre = block.closest('pre')
    if (!pre) {
      block.dataset.highlighted = 'true'
      return
    }

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'

    const header = document.createElement('div')
    header.className = 'code-block-header'

    const langSpan = document.createElement('span')
    langSpan.className = 'code-lang-label'
    const className = block.className || ''
    const langMatch = className.match(/language-([a-zA-Z0-9+#]+)/) || className.match(/lang-([a-zA-Z0-9+#]+)/)
    const dataLang = block.getAttribute('data-language') || block.getAttribute('data-lang')
    const lang = (langMatch && langMatch[1]) || dataLang || 'code'
    langSpan.textContent = lang

    const copyBtn = document.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'code-copy-btn'
    copyBtn.textContent = '复制'

    const actions = document.createElement('div')
    actions.className = 'code-header-actions'
    actions.appendChild(copyBtn)
    header.appendChild(langSpan)
    header.appendChild(actions)

    const body = document.createElement('div')
    body.className = 'code-block-body'

    const expandBtn = document.createElement('button')
    expandBtn.type = 'button'
    expandBtn.className = 'code-expand-btn'
    expandBtn.textContent = '展开 ▼'

    const footer = document.createElement('div')
    footer.className = 'code-block-footer'
    footer.appendChild(expandBtn)

    const parent = pre.parentNode
    if (!parent) {
      block.dataset.highlighted = 'true'
      return
    }

    parent.insertBefore(wrapper, pre)
    body.appendChild(pre)
    wrapper.appendChild(header)
    wrapper.appendChild(body)
    wrapper.appendChild(footer)

    let expanded = false
    expandBtn.addEventListener('click', () => {
      const beforeTop = expandBtn.getBoundingClientRect().top
      const startScroll = window.scrollY || document.documentElement.scrollTop || 0

      expanded = !expanded
      if (expanded) {
        wrapper.classList.add('is-expanded')
        expandBtn.textContent = '收起 ▲'
      } else {
        wrapper.classList.remove('is-expanded')
        expandBtn.textContent = '展开 ▼'

        const afterTop = expandBtn.getBoundingClientRect().top
        const diff = afterTop - beforeTop
        if (Math.abs(diff) > 1) {
          window.scrollTo({
            top: startScroll + diff,
            behavior: 'auto'
          })
        }
      }
    })

    copyBtn.addEventListener('click', async () => {
      const text = block.textContent || ''
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text)
        } else {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.focus()
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }
        ElMessage.success('代码已复制')
      } catch (e) {
        ElMessage.error('复制失败')
      }
    })

    block.dataset.highlighted = 'true'
  })
}

// 构建 TOC：从渲染后的文章内容中提取 h1/h2/h3
const buildTocFromContent = async () => {
  await nextTick()
  const container = document.querySelector('.article-content')
  if (!container) {
    toc.value = []
    activeTocId.value = null
    tocProgress.value = 0
    return
  }

  const headingEls = Array.from(
    container.querySelectorAll('h1, h2, h3,h4,h5,h6')
  )

  const items = headingEls.map((el, index) => {
    const tag = el.tagName.toLowerCase()
    const level = Number(tag[1]) || 1
    let id = el.id
    if (!id) {
      id = `section-${index + 1}`
      el.id = id
    }
    const text = (el.textContent || '').trim()
    return { id, text, level }
  }).filter(item => item.text)

  toc.value = items

  if (!items.length) {
    activeTocId.value = null
    tocProgress.value = 0
    return
  }

  activeTocId.value = items[0].id
  updateTocProgress()
}

const updateTocProgress = () => {
  if (!toc.value.length) return

  const scrollTop = window.scrollY || document.documentElement.scrollTop || 0
  const offset = 120
  const currentPos = scrollTop + offset

  const positions = toc.value.map(item => {
    const el = document.getElementById(item.id)
    if (!el) return Infinity
    const rect = el.getBoundingClientRect()
    return rect.top + scrollTop
  })

  if (!positions.length || !isFinite(positions[0])) {
    tocProgress.value = 0
    return
  }

  let activeIndex = 0
  for (let i = 0; i < positions.length; i++) {
    // 提前一点切换，进入新标题区域时就跳到该标题
    if (currentPos >= positions[i] - 40) {
      activeIndex = i
    } else {
      break
    }
  }

  activeTocId.value = toc.value[activeIndex].id

  const total = toc.value.length
  if (total === 1) {
    // 只有一个标题：在进入该标题后进度条直接拉满
    tocProgress.value = currentPos >= positions[0] ? 1 : 0
    return
  }

  // 离散型进度：每进入一个新标题段落就跳一大截
  const step = (activeIndex + 1) / total
  tocProgress.value = Math.min(1, Math.max(0, step))
}

const handleScroll = () => {
  updateTocProgress()
}

const scrollToHeading = (id) => {
  const el = document.getElementById(id)
  if (!el) return
  const rect = el.getBoundingClientRect()
  const top = rect.top + (window.scrollY || document.documentElement.scrollTop || 0) - 96
  window.scrollTo({ top, behavior: 'smooth' })
}

const goToAuthorHome = () => {
  const authorId = article.createBy
  if (!authorId) return
  router.push({
    name: 'MyHome',
    query: { userId: authorId }
  })
}

const goToUserHome = (userLike) => {
  if (!userLike) return
  const userId = userLike.userId || userLike.createBy
  if (!userId) return
  router.push({
    name: 'MyHome',
    query: { userId }
  })
}

const isArticleAuthor = (comment) => {
  const articleAuthorId = article.createBy || article.userId
  const commentAuthorId = comment.createBy || comment.userId
  
  // 1. Try ID matching if both exist
  if (articleAuthorId && commentAuthorId) {
    return articleAuthorId === commentAuthorId
  }
  
  // 2. Fallback to name matching
  return article.authorName && comment.nickname && article.authorName === comment.nickname
}

const DEFAULT_COMMENT_AVATAR =
  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'

/**
 * 评论列表头像：后端字段可能是 userAvatar / avatarUrl 等；相对路径需相对 API base 解析
 */
const resolveCommentAvatar = (row) => {
  if (!row) return DEFAULT_COMMENT_AVATAR
  const raw =
    row.userAvatar ??
    row.avatarUrl ??
    row.avatar ??
    row.headImg ??
    row.user?.avatarUrl ??
    row.user?.userAvatar ??
    ''
  const s = typeof raw === 'string' ? raw.trim() : raw == null ? '' : String(raw).trim()
  if (!s) return DEFAULT_COMMENT_AVATAR
  if (s.startsWith('data:') || s.startsWith('blob:')) return s
  if (/^https?:\/\//i.test(s)) return s
  if (s.startsWith('//')) return `https:${s}`
  const base = import.meta.env.VITE_API_BASE_URL
  if (base) {
    try {
      const normalizedBase = base.endsWith('/') ? base : `${base}/`
      return new URL(s, normalizedBase).href
    } catch {
      return s || DEFAULT_COMMENT_AVATAR
    }
  }
  return s
}

const loadComments = async () => {
  try {
    const res = await getCommentList({
      blogId: articleId,
      pageNum: 1,
      pageSize: 10
    })
    
    if (res.code === 200) {
      let likedCommentIds = []
      // 如果用户已登录，获取已点赞的评论 ID 列表
      if (userStore.userInfo && userStore.userInfo.id) {
        try {
          const likedRes = await getLikedComments(articleId, userStore.userInfo.id)
          if (likedRes.code === 200) {
            likedCommentIds = likedRes.data || []
          }
        } catch (err) {
          console.error('Fetch liked comments failed:', err)
        }
      }

      const originalRecords = res.data.records || []

      if (recordsHaveNestedReplies(originalRecords)) {
        // 接口返回树形 children：拍平为二级展示
        comments.value = originalRecords.map((root) => {
          const idToNameMap = new Map()
          idToNameMap.set(root.id, root.nickname)

          let flatList = flattenChildren(root.children, idToNameMap)

          flatList.forEach((item) => {
            if (item.parentId && item.parentId !== root.id && item.parentId !== '0' && item.parentId !== 0) {
              item.replyToName = idToNameMap.get(item.parentId) || '用户'
            } else {
              item.replyToName = null
            }
            item.rootId = root.id
            item.isLiked = likedCommentIds.includes(item.id)
          })

          flatList.sort(
            (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
          )

          return {
            ...root,
            children: flatList,
            isExpanded: false,
            isLiked: likedCommentIds.includes(root.id)
          }
        })
      } else {
        // 扁平列表：按 parentId / rootId 归并到对应根评论下
        comments.value = buildTwoLevelThreadsFromFlatRecords(originalRecords, likedCommentIds)
      }

      comments.value.sort(
        (a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      )
    }
  } catch (error) {
    console.error('Load comments failed:', error)
  }
}

const loadArticle = async () => {
  try {
    // Pass userId if logged in, otherwise undefined
    const userId = userStore.userInfo && userStore.userInfo.id ? userStore.userInfo.id : undefined
    const res = await getBlogDetail(articleId, userId)
    if (res.code === 200 && res.data) {
      const data = res.data
      article.id = data.id
      article.title = data.title
      document.title = data.title
      article.content = data.content
      article.category = data.categoryName
      article.date = data.createTime
      article.views = data.viewCount
      article.likes = data.likeCount
      article.favoriteCount = data.favoriteCount || data.favorites || 0
      
      const currentUserId = userStore.userInfo.id
      if (currentUserId) {
        try {
          const likeRes = await getIsLiked(data.id, currentUserId)
          if (likeRes.code === 200) {
            article.isLiked = likeRes.data
          }
        } catch (error) {
          console.error('Check like status failed:', error)
        }

        try {
          const favoriteRes = await getIsFavorited(data.id, currentUserId)
          if (favoriteRes.code === 200) {
            article.isFavorited = favoriteRes.data
          }
        } catch (error) {
          console.error('Check favorite status failed:', error)
        }
      }

      article.coverImage = data.coverImage
      article.tags = data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',')) : []
      article.authorName = data.authorName
      article.authorAvatar = data.authorAvatar
      article.createBy = data.createBy || data.authorId || data.userId
      
      await applyCodeHighlight()
      await buildTocFromContent()
      updateSidebarPosition()
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return
    }
    console.error('Failed to load article:', error)
  }
}

const likeArticle = async () => {
  const userId = userStore.userInfo.id
  if (!userId) {
    Swal.fire({
      icon: 'warning',
      title: '请先登录',
      text: '登录后即可点赞文章',
      confirmButtonText: '去登录',
      confirmButtonColor: '#409eff',
      showCancelButton: true,
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/login')
      }
    })
    return
  }
  
  try {
    const res = await toggleLike(article.id, userId)
    if (res.code === 200) {
      article.isLiked = !article.isLiked
      if (article.isLiked) {
        article.likes++
        // 使用 Toast 模式，更自然，不打断用户
        const Toast = Swal.mixin({
          toast: true,
          position: 'top', // 改为顶部居中
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          color: '#ffffff', // 白色文字
          iconColor: '#ffffff', // 白色图标
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })

        Toast.fire({
          icon: 'success',
          title: '栓Q！感谢大佬的认可！😎',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 品牌渐变色
        })
      } else {
        article.likes--
        const Toast = Swal.mixin({
          toast: true,
          position: 'top', 
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          color: '#ffffff', 
          iconColor: '#ffffff', 
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })

        Toast.fire({
          icon: 'warning',
          title: '大型翻车现场，建议重新点赞！👉🏻👈🏻',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)', // 暖色警示渐变
        })
      }
    }
  } catch (error) {
    console.error('Like failed:', error)
    Swal.fire({
      icon: 'error',
      title: '操作失败',
      text: '请稍后重试'
    })
  }
}

const favoriteArticle = async () => {
  const userId = userStore.userInfo.id
  if (!userId) {
    Swal.fire({
      icon: 'warning',
      title: '请先登录',
      text: '登录后即可收藏文章',
      confirmButtonText: '去登录',
      confirmButtonColor: '#409eff',
      showCancelButton: true,
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/login')
      }
    })
    return
  }

  try {
    const res = await toggleFavorite(article.id, userId)
    if (res.code === 200) {
      const data = res.data || {}
      if (typeof data.isFavorited === 'boolean' && typeof data.favoriteCount === 'number') {
        article.isFavorited = data.isFavorited
        article.favoriteCount = data.favoriteCount
      } else {
        article.isFavorited = !article.isFavorited
        article.favoriteCount += article.isFavorited ? 1 : -1
      }

      const Toast = Swal.mixin({
        toast: true,
        position: 'top',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        color: '#ffffff',
        iconColor: '#ffffff',
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })

      if (article.isFavorited) {
        Toast.fire({
          icon: 'success',
          title: '已收藏，精彩内容加入收藏夹！',
          background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
        })
      } else {
        Toast.fire({
          icon: 'info',
          title: '已取消收藏',
          background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'
        })
      }
    }
  } catch (error) {
    console.error('Favorite failed:', error)
    Swal.fire({
      icon: 'error',
      title: '操作失败',
      text: '请稍后重试'
    })
  }
}

const scrollToComments = () => {
  const commentSection = document.querySelector('.comments-card')
  if (commentSection) {
    commentSection.scrollIntoView({ behavior: 'smooth' })
  }
}

const submitComment = async () => {
  if (!newComment.value.trim()) return

  // 检查是否登录
  const userId = userStore.userInfo.id
  if (!userId) {
    Swal.fire({
      icon: 'warning',
      title: '请先登录',
      text: '登录后即可发表评论',
      confirmButtonText: '去登录',
      confirmButtonColor: '#409eff',
      showCancelButton: true,
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/login')
      }
    })
    return
  }

  try {
    const commentData = {
      blogId: article.id,
      userId: userId,
      nickname: userStore.userInfo.nickname,
      userAvatar: userStore.userInfo.avatarUrl,
      content: newComment.value
    }

    // const res = await addComment(commentData, { skipShowError: true })
    const res = await addComment(commentData, { skipShowError: true })
    if (res.code === 200) {
      ElMessage.success('评论发送成功')
      newComment.value = ''
      // 重新加载评论列表以获取最新数据（包括真实 ID）
      loadComments()
    } else {
      ElMessage.error(res.msg || '评论发送失败')
    }
  } catch (error) {
    console.error('Submit comment failed:', error)
    // 只有在非 axios 拦截器处理的错误时才弹窗，避免重复
    if (error.response && error.response.data && error.response.data.msg) {
       ElMessage.error(error.response.data.msg)
    } else if (!error.response) {
      ElMessage.error('评论发送失败')
    }
  }
}

const replyComment = (comment) => {
  if (activeReplyId.value === comment.id) {
    activeReplyId.value = null
    replyTarget.value = null
  } else {
    activeReplyId.value = comment.id
    replyTarget.value = comment
    replyContent.value = ''
  }
}

const handleCommentLike = async (comment) => {
  const userId = userStore.userInfo.id
  if (!userId) {
     Swal.fire({
      title: '请先登录',
      text: "登录后才能点赞哦",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/login')
      }
    })
    return
  }

  try {
    const res = await toggleCommentLike(comment.id, userId)
    if (res.code === 200) {
      comment.isLiked = res.data.isLiked
      comment.likeCount = res.data.likeCount
    }
  } catch (error) {
    console.error('Toggle comment like failed:', error)
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return
  const userId = userStore.userInfo.id
  if (!userId) {
     Swal.fire({
      title: '请先登录',
      text: "登录后才能回复哦",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '去登录',
      cancelButtonText: '取消'
    }).then((result) => {
      if (result.isConfirmed) {
        router.push('/login')
      }
    })
    return
  }
  
  try {
    let rootId = 0
    let parentId = 0
    let finalContent = replyContent.value
    
    // Logic: 
    // If replying to Root (Level 1): rootId = target.id, parentId = target.id
    // If replying to Child (Level 2): rootId = target.rootId, parentId = target.rootId (as per requirement "Level 2 reply, parent_id=A's ID")
    
    if (replyTarget.value) {
        if (!replyTarget.value.parentId || replyTarget.value.parentId === 0 || replyTarget.value.parentId === '0') {
             // Target is Root (Level 1)
             // parentId = Root ID
             rootId = replyTarget.value.id
             parentId = replyTarget.value.id
        } else {
             // Target is Child (Level 2)
             // Requirement: "Flat two-level structure"
             // All replies under a thread must have parentId = Root ID to be fetched as siblings
             // To indicate who is replied to, prepend "@Nickname" to content
             
             rootId = replyTarget.value.rootId
             parentId = replyTarget.value.id // CORRECT: Hang under root
        }
    }

    const commentData = {
      blogId: article.id,
      rootId: rootId,
      parentId: parentId,
      userId: userId,
      nickname: userStore.userInfo.nickname,
      userAvatar: userStore.userInfo.avatarUrl,
      content: finalContent
    }

    // const res = await apiReplyComment(commentData, { skipShowError: true })
    const res = await apiReplyComment(commentData, { skipShowError: true })
    if (res.code === 200) {
      loadComments()
      replyContent.value = ''
      activeReplyId.value = null
      replyTarget.value = null
      ElMessage.success('回复成功')
    } else {
      ElMessage.error(res.msg || '回复失败')
    }
  } catch (error) {
    console.error('Submit reply failed:', error)
    if (error.response && error.response.data && error.response.data.msg) {
       ElMessage.error(error.response.data.msg)
    } else if (!error.response) {
      ElMessage.error('回复失败')
    }
  }
}

const logout = () => {
  userStore.logout()
  router.push('/login')
}

onMounted(() => {
  window.scrollTo({ top: 0, behavior: 'auto' })
  loadArticle()
  loadComments()
  window.addEventListener('scroll', handleScroll, { passive: true })
  nextTick(() => {
    updateSidebarPosition()
    window.addEventListener('resize', updateSidebarPosition)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', updateSidebarPosition)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Pacifico&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');

/* 1. 全局容器与背景 */
.article-detail-container {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.page-inner {
  max-width: 1280px;
  margin: 0 auto;
}

/* 2. 顶部导航 (Restored from Home.vue) */
.header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 64px;
  padding: 0;
}

.header-content {
  max-width: 1280px; /* Aligned with content wrapper */
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.3s;
}

.brand:hover {
  opacity: 0.8;
}

.brand-title {
  font-family: 'Dancing Script', cursive;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 8px;
}

.logo-icon {
  font-size: 1.6rem;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.create-btn {
  background: #333;
  border: none;
  font-weight: 500;
}

.create-btn:hover {
  background: #555;
  transform: translateY(-1px);
}

.username {
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
  margin-left: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background 0.2s;
}

.user-profile:hover {
  background: rgba(0,0,0,0.03);
}

/* 3. 主体布局调整 - 关键修改 */
.main-body {
  padding: 24px 20px;
  overflow: visible !important; /* 关键：修复 sticky 失效的问题 */
}

.content-wrapper {
  width: 100%;
}

/* 4. 左侧文章卡片 */
.article-card {
  border-radius: 20px;
  background: var(--card-bg);
  padding: 0 20px 10px;
  box-shadow: var(--card-shadow-soft);
  margin-bottom: 24px;
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
}

.breadcrumb-area {
  margin-bottom: 24px;
  font-size: 14px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-link {
  cursor: pointer;
  transition: color 0.2s;
}
.back-link:hover { color: #409eff; }

.article-title {
  font-size: 2.0rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.0;
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 14px;
  color: #8590a6;
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.meta-author {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.author-name {
  font-weight: 300;
  color: #444;
  font-size: 14px;
}
.dot { font-weight: bold; }

/* 正文排版优化 */
.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #2c3e50;
  overflow-x: hidden;
}
:deep(.code-block-wrapper) {
  border-radius: 14px;
  overflow: hidden;
  margin: 20px 0;
  border: 1px solid rgba(129, 140, 248, 0.35);
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.98), #f9fafb);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06);
}
:deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 14px;
  background: linear-gradient(90deg, rgba(129, 140, 248, 0.16), rgba(236, 72, 153, 0.03));
  border-bottom: 1px solid rgba(129, 140, 248, 0.16);
  font-size: 12px;
  color: #6b7280;
}
:deep(.code-lang-label) {
  font-weight: 500;
  text-transform: lowercase;
}
:deep(.code-header-actions) {
  display: flex;
  align-items: center;
  gap: 8px;
}
:deep(.code-copy-btn),
:deep(.code-expand-btn) {
  border: none;
  background: transparent;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}
:deep(.code-copy-btn:hover),
:deep(.code-expand-btn:hover) {
  background: rgba(148, 163, 184, 0.2);
  color: #374151;
}
:deep(.code-block-body) {
  max-height: 260px;
  overflow: auto;
  background: #fdfdff;
}
:deep(.code-block-wrapper.is-expanded .code-block-body) {
  max-height: none;
}
:deep(.code-block-footer) {
  padding: 8px 0 12px;
  text-align: center;
  background: linear-gradient(to bottom, rgba(249, 250, 251, 0), #f9fafb);
}
:deep(.code-expand-btn) {
  font-size: 12px;
  color: #4b5563;
}
:deep(.article-content pre) {
  background: #f6f8fa;
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  font-size: 14px;
  margin: 16px 0;
}
:deep(.article-content code) {
  font-family: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
:deep(.article-content p > code) {
  padding: 2px 4px;
  background: #f3f4f6;
  border-radius: 4px;
}
:deep(h2) {
  font-size: 1.5rem;
  margin-top: 40px;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}
:deep(p) { margin-bottom: 1.2em; }
:deep(img) { max-width: 100%; height: auto; }
:deep(blockquote) {
  background: #f8f9fa;
  border-left: 4px solid #cbd5e0;
  padding: 16px;
  margin: 20px 0;
  color: #555;
  font-style: italic;
}

.article-footer {
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  /* align-items: center; Removed to allow custom alignment */
  gap: 30px;
}

.tags-group {
  align-self: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.interaction-area {
  align-self: center;
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-count {
  font-size: 16px;
  color: #555;
  margin-right: 12px;
}
.action-divider { height: 20px; }

/* 5. 评论区美化 */
.comments-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 32px;
  box-shadow: var(--card-shadow-soft);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
}
.comments-header {
  margin-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
}
.comments-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}
.comments-header .count {
  font-size: 14px;
  color: #999;
  margin-left: 6px;
  font-weight: normal;
}

/* 输入框区域 */
.comment-input-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
}
.user-avatar-input {
  flex-shrink: 0;
}
.input-box {
  flex: 1;
}
/* Custom Textarea */
.custom-textarea :deep(.el-textarea__inner) {
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.3s;
  padding-bottom: 24px; /* Make space for word count */
}
.custom-textarea :deep(.el-textarea__inner):focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.custom-textarea :deep(.el-input__count) {
  bottom: 8px;
  right: 12px;
  line-height: initial;
}
.input-actions {
  margin-top: 12px;
  text-align: right;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.comment-item {
  display: flex;
  gap: 16px;
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.comment-avatar-wrapper {
  flex-shrink: 0;
}
.comment-content {
  flex: 1;
  padding-bottom: 2px;
  border-bottom: 1px solid #f6f8fa;
}
.comment-item:last-child .comment-content {
  border-bottom: none;
}

/* 一级评论下的二级回复区 */
.sub-comments {
  margin-top: 12px;
  margin-left: 0;
  padding: 12px 12px 4px 16px;
  border-radius: 10px;
  background: #f6f8fb;
  border-left: 3px solid #c8d9f0;
}
.child-comment-item {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.child-comment-item:last-of-type {
  margin-bottom: 4px;
}
.view-more-btn {
  font-size: 13px;
  color: #409eff;
  cursor: pointer;
  padding: 4px 0 8px 42px;
  margin-top: -4px;
}
.view-more-btn__icon {
  vertical-align: middle;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.author-name {
  font-size: 12px;
  font-weight: 400;
  color: #333;
}
.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 15px;
  color: #444;
  line-height: 1.6;
  margin-bottom: 12px;
  white-space: pre-wrap; /* 保留换行 */
}

/* 操作按钮 */
.comment-actions {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #8590a6;
  cursor: pointer;
  transition: color 0.2s;
}
.action-btn:hover {
  color: #409eff;
}

.comment-like-icon {
  width: 16px;
  height: 16px;
  color: #9ca3af;
}

.comment-like-icon--active {
  color: #f97373;
  fill: currentColor;
}

/* 内嵌回复框 */
.inline-reply-box {
  margin-top: 16px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
}

/* Slide Fade Animation for Reply Box */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  max-height: 500px; /* Adjust based on content */
  opacity: 1;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.reply-textarea :deep(.el-textarea__inner) {
  background: var(--card-bg);
  border: 1px solid #e4e7ed;
  box-shadow: none;
  margin-bottom: 10px;
  padding-bottom: 24px; /* Make space for word count */
}
.reply-textarea :deep(.el-textarea__inner):focus {
  border-color: #409eff;
}
.reply-textarea :deep(.el-input__count) {
  bottom: 18px; /* Adjust based on margin-bottom of textarea */
  right: 12px;
  line-height: initial;
  background: transparent;
}
.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 6. 右侧侧边栏（跟随内容滚动，保持在原来的列中） */
.sidebar-wrapper {
  position: static;
}

.sidebar-card {
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--card-shadow-soft);
  min-width: 230px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
}

/* 作者卡片 */
.author-bg {
  height: 60px;
  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
}
.author-content {
  padding: 0 20px 24px;
  text-align: center;
  position: relative;
  margin-top: -32px; /* 头像上浮 */
}
.author-avatar-lg {
  border: 4px solid #fff;
  background: var(--card-bg);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
.author-name-lg { margin: 10px 0 4px; font-size: 18px; }
.author-desc { font-size: 13px; color: #777; margin-bottom: 16px; }

.author-badge {
  display: inline-block;
  font-size: 10px;
  color: #ff4d4f;
  background: transparent;
  border: 1px solid #ff4d4f;
  padding: 0 4px;
  border-radius: 4px;
  margin-left: 6px;
  line-height: 14px;
  vertical-align: middle;
  transform: translateY(-1px);
}

.author-data {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}
.data-item .num { font-weight: 700; font-size: 16px; color: #333; }
.data-item .txt { font-size: 12px; color: #999; }

/* 目录导航卡片 */
.toc-card {
  padding: 18px 18px 16px;
}

.toc-header {
  margin-bottom: 14px;
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.toc-icon {
  font-size: 16px;
  color: #8b5cf6;
}

.toc-progress {
  margin-top: 8px;
}

.toc-progress-bar {
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
  position: relative;
}

.toc-progress-inner {
  position: absolute;
  inset: 0;
  width: 0;
  background: linear-gradient(90deg, #818cf8, #ec4899);
  transition: width 0.25s ease-out;
}

.toc-list {
  list-style: none;
  padding: 4px 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toc-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  color: #4b5563;
  transition: all 0.2s ease;
}

.toc-item .bullet {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #d1d5db;
  margin-right: 8px;
  flex-shrink: 0;
}

.toc-item .toc-text {
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.toc-item:hover {
  background: rgba(129, 140, 248, 0.08);
  color: #111827;
}

.toc-item.active {
  background: rgba(129, 140, 248, 0.16);
  color: #4c1d95;
}

.toc-item.active .bullet {
  background: #a855f7;
}

.toc-item.level-2 {
  padding-left: 16px;
}

.toc-item.level-3 {
  padding-left: 24px;
}

/* Action Sidebar / 左侧操作栏（跟随内容滚动，保持在原来的列中） */
.action-sidebar {
  position: static;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.action-item {
  cursor: pointer;
  position: relative;
}

.action-icon-wrapper {
  width: 48px;
  height: 48px;
  background: var(--card-bg);
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8590a6;
  transition: all 0.3s;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}

.action-icon-wrapper:hover {
  transform: translateY(-2px);
  color: #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-icon-wrapper.active {
  color: #409eff;
}

.action-icon-wrapper.like-active .sidebar-icon {
  color: #f97373;
  fill: currentColor;
}

.action-icon-wrapper.favorite-active .sidebar-icon {
  color: #fbbf24;
  fill: currentColor;
}

.item-badge :deep(.el-badge__content) {
  background-color: #b0b4be;
  color: #fff;
  border: none;
  right: 5px;
  top: 5px;
}

/* 7. 响应式适配 */
@media (max-width: 768px) {
  .article-card { padding: 20px; }
  .article-title { font-size: 1.6rem; }
  .sidebar-wrapper { position: static; } /* 手机端取消固定 */
}
</style>
