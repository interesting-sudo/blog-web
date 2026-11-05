<template>
  <div class="common-layout">
    <div class="publish-page soft-page-bg">
      <div class="page-inner">
        <Navbar />

        <!-- 固定的编辑工具栏 -->
        <div class="toolbar-wrapper fixed-toolbar">
          <div
            class="toolbar-container"
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: { duration: 450, easing: 'easeOutCubic' }
            }"
          >
            <Toolbar
              class="editor-toolbar"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              :mode="mode"
            />
          </div>
        </div>
        <div class="toolbar-placeholder"></div>

        <div class="main-content">
          <div class="editor-layout">
            <!-- 目录侧边栏容器 (fixed) -->
            <div class="directory-sidebar-wrapper" :class="{ 'is-collapsed': isSidebarCollapsed }">
              <div 
                class="directory-sidebar" 
                :class="{ 'is-collapsed': isSidebarCollapsed }"
                v-motion
                :initial="{ opacity: 0, x: -24 }"
                :enter="{
                  opacity: 1,
                  x: 0,
                  transition: { delay: 150, duration: 480, easing: 'easeOutCubic' }
                }"
              >
                <div class="directory-header" :class="{ 'header-collapsed': isSidebarCollapsed }">
                  <span v-show="!isSidebarCollapsed">目录</span>
                  <el-icon class="collapse-icon" @click="toggleSidebar" :title="isSidebarCollapsed ? '展开目录' : '收起目录'">
                    <ArrowRight v-if="isSidebarCollapsed" />
                    <ArrowLeft v-else />
                  </el-icon>
                </div>
              <div v-show="!isSidebarCollapsed" class="sidebar-body">
                <div v-if="toc.length > 0" class="toc-content">
                  <div 
                    v-for="(item, index) in toc" 
                    :key="index"
                    class="toc-item"
                    :class="`toc-level-${item.level}`"
                    @click="scrollToHeader(index)"
                    :title="item.text"
                  >
                    {{ item.text }}
                  </div>
                </div>
                <div v-else class="directory-placeholder">
                  为文内增加标题，这里将生成目录
                  <div class="shortcut-tip">快捷键: Ctrl + 1~5 设置标题</div>
                </div>
              </div>
            </div>
          </div>

          <div 
            class="content-container"
              v-motion
              :initial="{ opacity: 0, y: 32 }"
              :enter="{
                opacity: 1,
                y: 0,
                transition: { delay: 200, duration: 500, easing: 'easeOutCubic' }
              }"
            >
              <!-- 标题输入 -->
              <div class="title-input-wrapper">
                <input 
                  v-model="form.title" 
                  class="title-input" 
                  placeholder="请输入文章标题（5 ~ 25个字）"
                  maxlength="25"
                />
                <div class="title-extras">
                  <el-tooltip content="AI自动生成标题" placement="top" :show-after="500">
                    <div class="ai-icon-btn" :class="{ 'is-loading': isGeneratingTitle }" @click="handleGenerateTitle" aria-label="AI自动生成标题">
                      <svg viewBox="0 0 24 24" aria-hidden="true" class="ai-sparkle">
                        <path fill="currentColor" d="M12 2 L14.09 8.26 L21 9.27 L16 13.97 L17.18 21 L12 17.27 L6.82 21 L8 13.97 L3 9.27 L9.91 8.26 Z"/>
                        <path fill="currentColor" d="M19 3 L19.8 5.2 L22 6 L19.8 6.8 L19 9 L18.2 6.8 L16 6 L18.2 5.2 Z" opacity="0.9"/>
                      </svg>
                    </div>
                  </el-tooltip>
                  <span class="word-count">{{ form.title.length }}/25</span>
                </div>
              </div>
              
              <!-- 编辑器正文 -->
              <div class="editor-wrapper" style="position: relative;">
                <Editor
                  style="min-height: 500px; overflow-y: hidden;"
                  v-model="form.content"
                  :defaultConfig="editorConfig"
                  :mode="mode"
                  @onCreated="handleCreated"
                  @onChange="handleChange"
                />

                <!-- 虚拟选区高亮层 (解决失焦高亮消失) -->
                <div v-if="aiMenuVisible && !isProcessingAI" class="fake-selection-overlay">
                  <div 
                    v-for="(rect, i) in selectionRects" 
                    :key="i"
                    class="fake-selection-rect"
                    :style="{
                      top: rect.top + 'px',
                      left: rect.left + 'px',
                      width: rect.width + 'px',
                      height: rect.height + 'px'
                    }"
                  ></div>
                </div>

                <!-- AI 选区处理悬浮菜单 (新版 UI) -->
                <transition name="fade">
                  <div 
                    v-if="aiMenuVisible && !aiResultVisible" 
                    class="ai-selection-bar"
                    :style="{ top: aiMenuPos.top + 'px', left: aiMenuPos.left + 'px' }"
                    @mousedown.stop
                    @click.stop
                  >
                    <div class="ai-bar-content">
                      <el-icon class="ai-sparkle-icon"><MagicStick /></el-icon>
                      <input 
                        v-model="customAIInstruction" 
                        class="ai-bar-input"
                        placeholder="向智能助手提问..." 
                        @keyup.enter="handleAIProcessSelection(customAIInstruction)"
                        @mousedown.stop
                        @focus="isAIInputFocused = true"
                        @blur="isAIInputFocused = false"
                      />
                      <div class="ai-bar-right">
                        <div class="enter-tip" @click="handleAIProcessSelection(customAIInstruction)">
                          <svg viewBox="0 0 1024 1024" width="14" height="14">
                            <path fill="currentColor" d="M848 474H240.4l184-184c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-238.6 238.6c-12.5 12.5-12.5 32.8 0 45.3l238.6 238.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L240.4 538H848c17.7 0 32-14.3 32-32s-14.3-32-32-32z"/>
                          </svg>
                        </div>
                        <span class="send-text" @click="handleAIProcessSelection(customAIInstruction)">发送</span>
                        <el-divider direction="vertical" />
                        <el-icon class="close-bar-icon" @click="closeAIBar"><Close /></el-icon>
                      </div>
                    </div>
                  </div>
                </transition>

                <!-- AI 处理中状态 -->
                <div v-if="isProcessingAI && !aiResultVisible" class="ai-processing-status">
                  <div class="processing-content">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>AI 正在处理中...</span>
                    <el-button link type="danger" size="small" @click="abortAIProcess">取消</el-button>
                  </div>
                </div>

                <!-- AI 生成结果预览面板 -->
                <transition name="fade">
                  <div 
                    v-if="aiResultVisible" 
                    class="ai-result-panel"
                    :style="{ top: aiMenuPos.top + 'px', left: aiMenuPos.left + 'px' }"
                    @mousedown.stop
                    @click.stop
                  >
                    <div class="ai-result-header draggable-header" @mousedown="startDragAI">
                      <div class="ai-header-left">
                        <el-icon class="ai-sparkle-icon"><MagicStick /></el-icon>
                        <span class="ai-title">AI辅助</span>
                      </div>
                      <div class="ai-header-right" v-if="isProcessingAI">
                        <el-icon class="is-loading"><Loading /></el-icon>
                        <span class="status-text">生成中...</span>
                      </div>
                    </div>
                    <div class="ai-result-body">
                      <div class="result-content-text">{{ aiResultContent }}</div>
                      <div v-if="isProcessingAI" class="typing-cursor"></div>
                    </div>
                    <div class="ai-result-footer">
                      <div class="footer-actions">
                        <el-button size="small" class="action-btn" @click="handleRetryAI" :disabled="isProcessingAI">
                          <el-icon><RefreshRight /></el-icon> 重试
                        </el-button>
                        <el-button size="small" class="action-btn" @click="handleDiscardAI">
                          <el-icon><Delete /></el-icon> 放弃
                        </el-button>
                      </div>
                      <el-button type="primary" size="small" class="apply-btn" @click="handleApplyAI" :disabled="isProcessingAI || !aiResultContent">
                        采纳并替换
                      </el-button>
                    </div>
                  </div>
                </transition>
              </div>

              <el-divider content-position="center">文章设置</el-divider>

              <!-- 文章设置表单 -->
              <div class="settings-area">
                <el-form :model="form" :rules="rules" ref="formRef" label-position="left" label-width="auto">
                  <div class="settings-main">
                    <div class="setting-column">
                      <el-form-item label="文章分类" prop="categoryId">
                        <el-select v-model="form.categoryId" placeholder="请选择文章分类" style="width: 100%">
                          <el-option
                            v-for="item in categories"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                          />
                        </el-select>
                      </el-form-item>
                    </div>

                    <div class="setting-column">
                      <el-form-item class="tag-form-item" prop="tags">
                        <template #label>
                          <div class="tag-label-container">
                            <span>文章标签</span>
                            <el-tooltip content="AI自动生成标签" placement="top" :show-after="500">
                              <div class="ai-icon-btn small-icon" :class="{ 'is-loading': isGeneratingTags }" @click="handleGenerateTags" aria-label="AI自动生成标签" style="display: inline-flex; vertical-align: middle; margin-left: 4px;">
                                <svg viewBox="0 0 24 24" aria-hidden="true" class="ai-sparkle">
                                  <path fill="currentColor" d="M12 2 L14.09 8.26 L21 9.27 L16 13.97 L17.18 21 L12 17.27 L6.82 21 L8 13.97 L3 9.27 L9.91 8.26 Z"/>
                                  <path fill="currentColor" d="M19 3 L19.8 5.2 L22 6 L19.8 6.8 L19 9 L18.2 6.8 L16 6 L18.2 5.2 Z" opacity="0.9"/>
                                </svg>
                              </div>
                            </el-tooltip>
                          </div>
                        </template>
                        <div class="tags-display-block">
                          <div class="tags-list">
                            <el-tag
                              v-for="tag in form.tags"
                              :key="tag"
                              class="selected-tag"
                              closable
                              @close="removeTag(tag)"
                            >
                              {{ tag }}
                            </el-tag>
                            
                            <el-popover
                              placement="top-start"
                              :width="400"
                              trigger="hover"
                              popper-class="tag-popover"
                              :show-arrow="false"
                              :offset="10"
                            >
                              <template #reference>
                                <el-button 
                                  v-if="form.tags.length < 5" 
                                  class="add-tag-btn" 
                                  size="small"
                                >
                                  <el-icon><Plus /></el-icon> 添加标签
                                </el-button>
                              </template>
                              
                              <div class="tag-selector-popover">
                                <div class="tag-search">
                                  <el-input
                                    v-model="tagSearchQuery"
                                    placeholder="搜索或创建标签 (Enter)"
                                    prefix-icon="Search"
                                    size="small"
                                    @keyup.enter="addCustomTag"
                                    clearable
                                  />
                                </div>

                                <div class="tag-list-simple">
                                  <div v-if="currentTags.length > 0" class="tags-container">
                                    <span 
                                      v-for="tag in currentTags" 
                                      :key="tag"
                                      class="tag-item"
                                      :class="{ selected: form.tags.includes(tag) }"
                                      @click="toggleTag(tag)"
                                    >
                                      {{ tag }}
                                    </span>
                                  </div>
                                  <div v-else class="no-tags">
                                    <span v-if="!form.categoryId && !tagSearchQuery">请先选择文章分类以查看推荐标签</span>
                                    <span v-else>暂无相关标签，按Enter可创建 "{{ tagSearchQuery }}"</span>
                                  </div>
                                </div>
                                
                                <div class="tag-footer">
                                  <span>还可添加 {{ 5 - form.tags.length }} 个标签</span>
                                </div>
                              </div>
                            </el-popover>
                          </div>
                        </div>
                      </el-form-item>
                    </div>

                    <div class="setting-column">
                      <el-form-item label="文章封面">
                        <el-upload
                          class="cover-uploader"
                          action="#"
                          :show-file-list="false"
                          :http-request="customCoverUpload"
                        >
                          <div v-if="form.coverUrl" class="cover-image-wrapper" @click.stop>
                            <img :src="form.coverUrl" class="cover-image" />
                            <div class="delete-mask" @click.stop="handleRemoveCover">
                              <el-icon><Delete /></el-icon>
                            </div>
                          </div>
                          <div v-else class="cover-uploader-icon">
                            <el-icon><Plus /></el-icon>
                            <span>添加封面</span>
                          </div>
                        </el-upload>
                      </el-form-item>
                    </div>

                    <div class="setting-column summary-column">
                      <el-form-item label="文章摘要">
                        <div class="summary-wrapper">
                          <el-input 
                            v-model="form.summary" 
                            type="textarea" 
                            :autosize="{ minRows: 3 }"
                            placeholder="自动提取前200字，或使用AI智能总结"
                            maxlength="200"
                            show-word-limit
                            resize="none"
                          />
                          <div class="summary-footer">
                            <div class="ai-summary-btn" :class="{ 'is-loading': isGeneratingSummary }" @click="handleGenerateSummary">
                                <el-icon class="ai-sparkle"><MagicStick /></el-icon>
                                <span>AI提取摘要</span>
                            </div>
                          </div>
                        </div>
                      </el-form-item>
                    </div>

                    <div class="setting-column publish-settings">
                      <el-form-item label="发布设置">
                        <el-radio-group v-model="form.status">
                          <el-radio label="1">直接发布</el-radio>
                          <el-radio label="0">存为草稿</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </div>

                    <div class="form-footer">
                      <el-button 
                        type="primary" 
                        class="submit-btn" 
                        @click="handleSubmit" 
                        :loading="loading"
                        round
                      >
                        {{ submitText }}
                      </el-button>
                    </div>
                  </div>
                </el-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, shallowRef, onBeforeUnmount, computed, watch, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Check, ArrowLeft, ArrowRight, Delete, MagicStick, EditPen, Document, Position, Loading, Opportunity, Close, RefreshRight } from '@element-plus/icons-vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { SlateTransforms, DomEditor } from '@wangeditor/editor'
import { uploadFile, deleteFile } from '@/api/document'
import { getCategoryList, getTagList } from '@/api/blog'
import { generateTitle, generateSummaryStream, generateTags, processContentStream } from '@/api/ai'
import Navbar from '@/components/Navbar.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      content: '',
      tags: [],
      summary: '',
      coverUrl: '',
      status: '1',
      categoryId: null,
      categoryName: ''
    })
  },
  submitText: {
    type: String,
    default: '发布博客'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const formRef = ref()
const isGeneratingTitle = ref(false)
const isGeneratingSummary = ref(false)
const isGeneratingTags = ref(false)
const isProcessingAI = ref(false)
const aiMenuVisible = ref(false)
const aiResultVisible = ref(false)
const aiResultContent = ref('')
const lastAIInstruction = ref('')
const isAIInputFocused = ref(false)
const isDraggingAI = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
const aiMenuPos = reactive({ top: 0, left: 0 })
const customAIInstruction = ref('')
const savedSelection = ref(null)
const savedSelectionText = ref('')
const selectionRects = ref([])
let aiAbortController = null
const isSidebarCollapsed = ref(false)
const rawCoverFile = ref(null)
const tagSearchQuery = ref('')
const categories = ref([])
const allTags = ref([])
const isLoadingTags = ref(false)
const editorRef = shallowRef()
const mode = 'default'
const toc = ref([])
const currentImages = ref([])

const form = reactive({
  title: '',
  content: '',
  tags: [],
  summary: '',
  coverUrl: '',
  status: '1',
  categoryId: null
})

// 监听 initialData 变化
watch(() => props.initialData, (newVal) => {
  if (newVal && Object.keys(newVal).length > 0) {
    console.log('BlogEditor received initialData:', newVal)
    form.title = newVal.title || ''
    form.content = newVal.content || ''
    form.tags = Array.isArray(newVal.tags) ? [...newVal.tags] : (newVal.tags ? newVal.tags.split(',') : [])
    form.summary = newVal.summary || ''
    form.coverUrl = newVal.coverUrl || newVal.coverImage || ''
    form.status = newVal.status ? String(newVal.status) : '1'
    
    // 优先使用 categoryId
    if (newVal.categoryId !== undefined && newVal.categoryId !== null) {
      form.categoryId = Number(newVal.categoryId)
    } else if (newVal.categoryName && categories.value.length > 0) {
      // 只有在没有 categoryId 但有 categoryName 时才尝试匹配
      const matched = categories.value.find(c => c.name === newVal.categoryName)
      if (matched) form.categoryId = matched.id
    } else {
      form.categoryId = null
    }

    if (form.content) {
      setTimeout(generateToc, 100)
    }
  }
}, { deep: true, immediate: true })

// 监听分类列表变化，再次尝试匹配初始数据中的分类名称
watch(() => categories.value, (newCats) => {
  if (newCats.length > 0 && props.initialData && props.initialData.categoryName && !form.categoryId) {
    const matched = newCats.find(c => c.name === props.initialData.categoryName)
    if (matched) {
      console.log('Matched category by name from list:', matched.name, matched.id)
      form.categoryId = matched.id
    }
  }
}, { immediate: true })

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// 分类和标签逻辑
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data
      // 分类列表加载后，再次尝试同步初始数据的分类
      if (props.initialData.categoryName && !form.categoryId) {
        const matched = categories.value.find(c => c.name === props.initialData.categoryName)
        if (matched) form.categoryId = matched.id
      }
    }
  } catch (error) {
    console.error('Fetch categories error:', error)
  }
}

const fetchTags = async () => {
  isLoadingTags.value = true
  try {
    const res = await getTagList({ pageNum: 1, pageSize: 100 })
    if (res.code === 200) {
      const tagData = Array.isArray(res.data) ? res.data : (res.data.records || [])
      allTags.value = tagData.map(t => {
        if (!t) return null
        // 如果 t 是字符串且看起来像 JSON
        if (typeof t === 'string') {
          if (t.startsWith('[') || t.startsWith('{')) {
            try {
              const parsed = JSON.parse(t)
              return Array.isArray(parsed) ? parsed[0] : (parsed.name || parsed)
            } catch (e) { return t }
          }
          return t
        }
        // 如果 t 是对象
        return t.name || t
      }).filter(t => t && typeof t === 'string')
    }
  } catch (error) {
    console.error('Fetch tags error:', error)
  } finally {
    isLoadingTags.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchTags()
})

const currentTags = computed(() => {
  if (tagSearchQuery.value) {
    return allTags.value.filter(t => t.toLowerCase().includes(tagSearchQuery.value.toLowerCase()))
  }
  return allTags.value
})

const toggleTag = (tag) => {
  if (form.tags.includes(tag)) {
    removeTag(tag)
  } else {
    if (form.tags.length >= 5) {
      ElMessage.warning('最多只能添加 5 个标签')
      return
    }
    form.tags.push(tag)
  }
}

const removeTag = (tag) => {
  form.tags = form.tags.filter(t => t !== tag)
}

const addCustomTag = () => {
  const val = tagSearchQuery.value.trim()
  if (!val) return
  if (form.tags.length >= 5) {
    ElMessage.warning('最多只能添加 5 个标签')
    return
  }
  if (!form.tags.includes(val)) form.tags.push(val)
  tagSearchQuery.value = ''
}

// 编辑器配置
const toolbarConfig = { excludeKeys: [] }
const editorConfig = { 
  placeholder: '#创作灵感#\n· 记录工作实践、项目复盘\n· 写技术笔记巩固知识要点\n· 发表职场感悟心得\n· 搬运自己的原创文章到这',
  // 彻底禁用所有类型的选区悬浮工具栏
  hoverbarKeys: {
    text: { menuKeys: [] },
    link: { menuKeys: [] },
    image: { menuKeys: [] },
    video: { menuKeys: [] },
    pre: { menuKeys: ['codeSelectLang'] }, // 允许在代码块上显示语言选择
    table: { menuKeys: [] }
  },
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        try {
          const formData = new FormData()
          formData.append('file', file)
          const res = await uploadFile(formData)
          if (res.code === 200) insertFn(res.data)
          else ElMessage.error(res.msg || '上传图片失败')
        } catch (error) {
          console.error('Upload error:', error)
        }
      }
    }
  }
}

const handleCreated = (editor) => {
  editorRef.value = editor
  setTimeout(() => {
    const textarea = editor.getEditableContainer()
    if (textarea) {
      textarea.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
          let type = ''
          switch(e.key) {
            case '1': type = 'header1'; break;
            case '2': type = 'header2'; break;
            case '3': type = 'header3'; break;
            case '4': type = 'header4'; break;
            case '5': type = 'header5'; break;
            case '0': type = 'paragraph'; break;
          }
          if (type) {
            e.preventDefault()
            SlateTransforms.setNodes(editor, { type })
          }
        }
      })
    }
  }, 100)
}

const updateAIPosition = () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) return

  const editorWrapper = document.querySelector('.editor-wrapper')
  if (!editorWrapper) return
  const editorRect = editorWrapper.getBoundingClientRect()
  
  // 1. 更新虚拟选区高亮 (相对于 editor-wrapper)
  const rects = range.getClientRects()
  selectionRects.value = Array.from(rects).map(r => ({
    top: r.top - editorRect.top,
    left: r.left - editorRect.left,
    width: r.width,
    height: r.height
  }))

  // 2. 更新面板位置 (相对于 editor-wrapper)
   const panelWidth = 610
   const panelHeight = aiResultVisible.value ? 400 : 60
   
   // 默认位置：选区底部，水平偏移使其位于选区右下方
   let top = rect.bottom - editorRect.top + 10
   // 尝试放在选区右侧（向右偏移选区宽度的 75%）
   let left = rect.left - editorRect.left + (rect.width * 0.75)

   // 垂直边界检查：如果下方超出编辑器范围，则尝试放在选区上方
   if (top + panelHeight > editorRect.height) {
     const spaceAbove = rect.top - editorRect.top
     if (spaceAbove > panelHeight + 10) {
       top = rect.top - editorRect.top - panelHeight - 10
     } else {
       // 上下都放不下，则固定在编辑器底部向上一点
       top = Math.max(10, editorRect.height - panelHeight - 10)
     }
   }

   // 水平边界检查：不再限制在 editorRect.width 内，允许溢出
   // 但要确保不超出视口右边界
   const viewportWidth = window.innerWidth
   const wrapperLeft = editorRect.left
   if (wrapperLeft + left + panelWidth > viewportWidth - 20) {
     left = viewportWidth - 20 - wrapperLeft - panelWidth
   }
   
   // 确保不超出视口左边界
   if (wrapperLeft + left < 20) {
     left = 20 - wrapperLeft
   }

   aiMenuPos.top = top
   aiMenuPos.left = left
 }

const handleChange = (editor) => {
  const newImages = editor.getElemsByType('image').map(img => img.src)
  const deletedImages = currentImages.value.filter(img => !newImages.includes(img))
  deletedImages.forEach(url => deleteFile(url).catch(console.error))
  currentImages.value = newImages

  // 处理 AI 选区菜单显示逻辑
  const selectionText = editor.getSelectionText()
  
  // 如果选区不为空，保存选区并更新菜单位置
  if (selectionText && selectionText.trim().length > 0) {
    savedSelection.value = editor.selection
    savedSelectionText.value = selectionText
    
    // 立即更新位置
    nextTick(() => {
      updateAIPosition()
      aiMenuVisible.value = true
    })
  } else {
    // 只有当用户没有点击 AI 输入框且没有在处理时，才尝试关闭菜单
    // 这里使用更长一些的延迟，确保 focus 事件能先触发
    setTimeout(() => {
      if (!isAIInputFocused.value && !isProcessingAI.value && !aiResultVisible.value) {
        // 如果此刻编辑器重新获得了焦点且有新选区，则不关闭
        const currentText = editor.getSelectionText()
        if (!currentText || currentText.trim().length === 0) {
          aiMenuVisible.value = false
        }
      }
    }, 400)
  }
}

// AI 处理选区内容
const handleAIProcessSelection = async (instruction) => {
  if (!instruction) return
  const editor = editorRef.value
  if (!editor) return

  // 保存最后一次指令，方便重试
  lastAIInstruction.value = instruction

  // 优先从编辑器获取当前选区，如果为空（失去焦点），则使用保存的选区
  let selectedText = editor.getSelectionText()
  if (!selectedText && savedSelectionText.value) {
    selectedText = savedSelectionText.value
    // 恢复编辑器选区
    if (savedSelection.value) {
      editor.select(savedSelection.value)
    }
  }

  if (!selectedText) {
    ElMessage.warning('请先选择要处理的文本')
    return
  }

  // 获取上下文（选区前后各 500 字）
  const allText = editor.getText()
  const selectionIndex = allText.indexOf(selectedText)
  const contextBefore = allText.substring(Math.max(0, selectionIndex - 500), selectionIndex)
  const contextAfter = allText.substring(selectionIndex + selectedText.length, Math.min(allText.length, selectionIndex + selectedText.length + 500))

  aiMenuVisible.value = false
  aiResultVisible.value = true
  aiResultContent.value = ''
  isProcessingAI.value = true
  
  // 更新面板位置（因为面板高度变了）
  nextTick(() => {
    updateAIPosition()
  })
  
  try {
    await processContentStream(
      {
        selectedContent: selectedText,
        userInstruction: instruction,
        contextBefore,
        contextAfter
      },
      (chunk) => {
        // 将 AI 生成的内容累加到预览中，而不是直接写入编辑器
        aiResultContent.value += chunk
      },
      (err) => {
        console.error('AI Process Error:', err)
        ElMessage.error('AI 处理失败，请稍后重试')
        isProcessingAI.value = false
      },
      () => {
        isProcessingAI.value = false
        customAIInstruction.value = ''
        // 不要在这里清除选区和 Rect，因为预览框还需要定位
      }
    )
  } catch (error) {
    isProcessingAI.value = false
  }
}

// 采纳 AI 生成的内容
const handleApplyAI = () => {
  const editor = editorRef.value
  if (!editor || !aiResultContent.value) return

  // 恢复选区（如果因为失焦丢了）
  if (savedSelection.value) {
    editor.select(savedSelection.value)
  }

  // 删除原选区并插入新内容
  editor.deleteFragment()
  editor.insertText(aiResultContent.value)
  
  closeAIResult()
  ElMessage.success('已应用 AI 生成内容')
}

// 放弃 AI 生成内容
const handleDiscardAI = () => {
  closeAIResult()
  ElMessage.info('已放弃生成内容')
}

// 重试 AI 处理
const handleRetryAI = () => {
  if (lastAIInstruction.value) {
    handleAIProcessSelection(lastAIInstruction.value)
  }
}

const closeAIResult = () => {
  aiResultVisible.value = false
  aiResultContent.value = ''
  savedSelection.value = null
  savedSelectionText.value = ''
  selectionRects.value = []
}

// 拖拽 AI 面板逻辑
const startDragAI = (e) => {
  isDraggingAI.value = true
  dragOffset.x = e.clientX - aiMenuPos.left
  dragOffset.y = e.clientY - aiMenuPos.top
  
  window.addEventListener('mousemove', onDragAI)
  window.addEventListener('mouseup', stopDragAI)
}

const onDragAI = (e) => {
  if (!isDraggingAI.value) return
  
  // 计算新位置
  let newLeft = e.clientX - dragOffset.x
  let newTop = e.clientY - dragOffset.y
  
  // 简单的边界检查（相对于视口）
  aiMenuPos.left = newLeft
  aiMenuPos.top = newTop
}

const stopDragAI = () => {
  isDraggingAI.value = false
  window.removeEventListener('mousemove', onDragAI)
  window.removeEventListener('mouseup', stopDragAI)
}

const abortAIProcess = () => {
  isProcessingAI.value = false
  ElMessage.info('已取消 AI 处理')
}

const closeAIBar = () => {
  aiMenuVisible.value = false
  savedSelection.value = null
  savedSelectionText.value = ''
  selectionRects.value = []
  customAIInstruction.value = ''
}

onBeforeUnmount(() => {
  if (editorRef.value) editorRef.value.destroy()
})

// 目录生成逻辑
const generateToc = () => {
  const content = form.content
  if (!content) {
    toc.value = []
    return
  }
  const headers = []
  const regex = /<h([1-5])[^>]*>(.*?)<\/h\1>/gi
  let match
  while ((match = regex.exec(content)) !== null) {
    headers.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<[^>]+>/g, ''),
    })
  }
  toc.value = headers
}

let timeoutId = null
watch(() => form.content, () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(generateToc, 500)
})

const scrollToHeader = (index) => {
  const editor = editorRef.value
  if (!editor) return
  const headers = []
  const traverse = (nodes) => {
    for (const node of nodes) {
      if (node.type && node.type.startsWith('header')) headers.push(node)
      if (node.children && Array.isArray(node.children)) traverse(node.children)
    }
  }
  traverse(editor.children || [])
  const headerNode = headers[index]
  if (headerNode) {
    try {
      const domNode = editor.toDOMNode(headerNode)
      // 计算偏移量：Navbar(80) + Toolbar(80) + 间距(20) = 180px
      const topOffset = 180
      const elementPosition = domNode.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - topOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    } catch (error) {
      console.error('Failed to scroll to header:', error)
    }
  }
}

// 封面上传逻辑
const customCoverUpload = async (options) => {
  const { file } = options
  rawCoverFile.value = file
  const formData = new FormData()
  formData.append('file', file)
  try {
    const res = await uploadFile(formData)
    if (res.code === 200) {
      form.coverUrl = res.data
      ElMessage.success('封面上传成功')
    }
  } catch (error) {
    console.error('Upload cover error:', error)
  }
}

const handleRemoveCover = async () => {
  if (!form.coverUrl) return
  try {
    await deleteFile(form.coverUrl)
    form.coverUrl = ''
    rawCoverFile.value = null
  } catch (error) {
    console.error('Delete cover error:', error)
    form.coverUrl = ''
  }
}

// AI 功能
const handleGenerateTitle = async () => {
  if (!form.content) return ElMessage.warning('请先输入文章内容')
  isGeneratingTitle.value = true
  try {
    const res = await generateTitle(editorRef.value.getText())
    if (res.code === 200) form.title = res.data
  } finally {
    isGeneratingTitle.value = false
  }
}

const handleGenerateSummary = () => {
  if (!form.content) return ElMessage.warning('请先输入文章内容')
  isGeneratingSummary.value = true
  form.summary = ''
  generateSummaryStream(
    editorRef.value.getText().slice(0, 5000),
    (chunk) => {
      if (form.summary.length + chunk.length <= 200) form.summary += chunk
    },
    (error) => {
      isGeneratingSummary.value = false
      ElMessage.error('生成摘要出错')
    },
    () => isGeneratingSummary.value = false
  )
}

const handleGenerateTags = async () => {
  if (!form.content) return ElMessage.warning('请先输入文章内容')
  if (form.tags.length >= 5) return ElMessage.warning('标签数量已达上限')
  isGeneratingTags.value = true
  try {
    const res = await generateTags(editorRef.value.getText())
    if (res.code === 200 && res.data) {
      const tags = res.data.split(/[,，]/).map(t => t.trim()).filter(t => t)
      for (const tag of tags) {
        if (form.tags.length >= 5) break
        if (!form.tags.includes(tag)) form.tags.push(tag)
      }
    }
  } finally {
    isGeneratingTags.value = false
  }
}

const rules = reactive({
  categoryId: [{ required: true, message: '请选择文章分类', trigger: 'change' }],
  tags: [{ type: 'array', required: true, message: '请至少选择一个标签', trigger: 'change' }]
})

const handleSubmit = async () => {
  if (!form.title.trim()) return ElMessage.warning('请输入文章标题')
  if (!editorRef.value || editorRef.value.isEmpty()) return ElMessage.warning('请输入文章内容')
  
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('submit', { ...form, rawCoverFile: rawCoverFile.value })
    } else {
      ElMessage.warning('请完善文章设置信息')
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  })
}
</script>

<style scoped>
.publish-page {
  min-height: 100vh;
  padding-bottom: 40px;
  overflow-y: visible !important;
}

.page-inner {
  max-width: 1280px;
  margin: 0 auto;
}

/* 工具栏区域 */
.toolbar-wrapper.fixed-toolbar {
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  z-index: 1050;
  background: transparent;
  margin-top: 0;
  padding: 10px 20px;
  pointer-events: none;
}

.toolbar-placeholder {
  height: 100px; /* 进一步增加占位符高度，完全解决内容遮挡问题 */
}

.toolbar-container {
  pointer-events: auto;
  max-width: 1200px;
  margin: 0 auto;
  padding: 6px 20px;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: var(--card-shadow-soft);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
}

.editor-toolbar {
  border: none !important;
  background-color: transparent !important;
}

.main-content {
  padding: 18px 0 ;
  display: flex;
  justify-content: center;
}

.editor-layout {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

/* 侧边栏包装容器：负责水平占位 */
.directory-sidebar-wrapper {
  width: 280px;
  flex-shrink: 0;
  position: relative;
  z-index: 1000;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.directory-sidebar-wrapper.is-collapsed {
  width: 50px;
}

/* 侧边栏主体：负责真正的固定定位 */
.directory-sidebar {
  width: 280px;
  background: var(--card-bg);
  border-radius: 16px;
  height: fit-content;
  max-height: calc(100vh - 200px); /* 限制高度防止溢出屏幕 */
  padding: 20px;
  box-shadow: var(--card-shadow-soft);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  position: fixed; /* 模仿 Navbar，使用 fixed 实现真正的固定 */
  top: 200px; /* 进一步向下移动，避开工具栏并留出呼吸感 */
  /* 精确对齐逻辑：
     1. left: 50% 将侧边栏中心对齐到屏幕中心
     2. margin-left: -600px 将其推到 1200px 宽容器的左边界
     3. 再根据侧边栏自身宽度微调
  */
  left: 50%;
  margin-left: -630px; /* 进一步向左移动，防止与内容重叠 */
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto; /* 目录过长时允许内部滚动 */
  overflow-x: hidden;
}

.directory-sidebar.is-collapsed {
  width: 50px;
  padding: 16px 0;
  margin-left: -630px; /* 同步更新折叠时的偏移量 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 响应式调整：当屏幕宽度小于内容区时，取消 fixed 效果 */
@media (max-width: 1240px) {
  .directory-sidebar {
    position: sticky;
    left: auto;
    margin-left: 0;
  }
  .directory-sidebar-wrapper {
    width: auto;
  }
}

.directory-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  white-space: nowrap;
  width: 100%;
}

.directory-header.header-collapsed {
  justify-content: center;
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.collapse-icon {
  cursor: pointer;
  color: #909399;
  font-size: 18px;
  transition: all 0.3s;
  padding: 4px;
  border-radius: 4px;
}

.collapse-icon:hover {
  color: #667eea;
  background-color: #f0f2f5;
}

.content-container {
  flex: 1;
  min-width: 0; /* 关键：确保 flex 子元素在必要时能缩小，防止溢出 */
  max-width: 900px;
  background: var(--card-bg);
  border-radius: 20px;
  box-shadow: var(--card-shadow-soft);
  border: 1px solid var(--card-border);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
}

.title-input-wrapper {
  padding: 32px 40px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  position: relative;
}

.title-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 32px;
  font-weight: 600;
  color: #333;
  padding-right: 180px;
  line-height: 1.4;
  background: transparent;
}

.title-extras {
  position: absolute;
  right: 40px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  color: #667eea;
  transition: all 0.3s;
}

.ai-icon-btn:hover {
  background-color: #f0f2f5;
  color: #764ba2;
}

/* AI 选区处理悬浮栏 (新版 UI) */
.ai-selection-bar {
  position: absolute;
  z-index: 10000;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  padding: 0 16px;
  width: 600px;
  height: 52px;
  display: flex;
  align-items: center;
  animation: slideUp 0.2s ease-out;
}

.ai-bar-content {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.ai-sparkle-icon {
  font-size: 18px;
  color: #10b981; /* 绿色星星 */
}

.ai-bar-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;
}

.ai-bar-input::placeholder {
  color: #999;
}

.ai-bar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #666;
}

.enter-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f3f4f6;
  border-radius: 4px;
  color: #999;
  cursor: pointer;
}

.send-text {
  font-size: 14px;
  cursor: pointer;
  color: #666;
  font-weight: 500;
}

.send-text:hover {
  color: #10b981;
}

.inspiration-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #666;
}

.inspiration-count .el-icon {
  color: #fbbf24; /* 黄色灯泡 */
  font-size: 16px;
}

.close-bar-icon {
  cursor: pointer;
  font-size: 16px;
  color: #999;
  transition: all 0.2s;
}

.close-bar-icon:hover {
  color: #ef4444;
  transform: scale(1.1);
}

/* AI 结果预览面板 */
.ai-result-panel {
  position: absolute;
  z-index: 10002;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  width: 610px;
  max-height: 500px;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  overflow: hidden;
}

.ai-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
}

.draggable-header {
  cursor: move;
  user-select: none;
}

.ai-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.ai-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
}

.ai-result-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
  position: relative;
  background: #fff;
}

.result-content-text {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: inherit;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 18px;
  background-color: #10b981;
  margin-left: 2px;
  vertical-align: middle;
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.ai-result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  border-color: #d1d5db !important;
  color: #4b5563 !important;
}

.action-btn:hover {
  background: #f3f4f6 !important;
  border-color: #9ca3af !important;
}

.apply-btn {
  background: #10b981 !important;
  border-color: #10b981 !important;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
  color: white !important;
  font-weight: 500;
}

.apply-btn:hover {
  background: #059669 !important;
  border-color: #059669 !important;
  transform: translateY(-1px);
}

.apply-btn:active {
  transform: translateY(0);
}

/* AI 处理中状态 */
.ai-processing-status {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10001;
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid #8064ff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(128, 100, 255, 0.2);
  color: #8064ff;
  font-size: 13px;
  font-weight: 500;
}

.is-loading {
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.editor-wrapper {
  padding: 0 40px 20px;
  min-height: 500px;
  position: relative;
  width: 100%;
  box-sizing: border-box; /* 确保 padding 不会撑大容器 */
}

/* 解决编辑器失去焦点时选区高亮消失的问题 */
:deep(.w-e-text-container [contenteditable="true"]) {
  /* 强制浏览器在失去焦点时也显示选区高亮 (部分浏览器支持) */
  -webkit-user-select: text;
  user-select: text;
}

/* 模拟选中状态的样式：当 AI 工具条显示且焦点在输入框时，通过 CSS 增强可见性 */
:deep(.w-e-text-container) {
  selection-background-color: rgba(64, 158, 255, 0.3); /* 默认选区颜色 */
}

/* 针对 wangEditor 的特殊处理：确保在非 active 状态下选区颜色依然可见 */
:deep(.w-e-text-container [contenteditable="true"]::selection) {
  background-color: rgba(64, 158, 255, 0.4) !important;
  color: inherit !important;
}

/* 强制显示选区背景，即使失去焦点 */
:deep(.w-e-text-container [contenteditable="true"]) {
  caret-color: #409eff;
}

/* 虚拟选区高亮样式 */
.fake-selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.fake-selection-rect {
  position: absolute;
  background-color: rgba(64, 158, 255, 0.3); /* 标准选中蓝色 */
  mix-blend-mode: multiply; /* 混合模式确保文字可见 */
}

.settings-area {
  padding: 24px 40px 40px;
  background: #fff;
}

.settings-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  min-height: 32px;
  width: 100%;
}

.selected-tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  margin-right: 4px;
  margin-bottom: 4px;
}

.selected-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.form-footer {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  width: 100%;
}

.submit-btn {
  width: 180px;
  height: 44px;
  font-size: 16px;
  border-radius: 22px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 布局调整：防止封面遮挡标签 */
.setting-column {
  position: relative;
  z-index: 1;
}

.tag-form-item {
  z-index: 2; /* 确保标签部分的层级高于封面 */
}

/* 封面上传区域 */
.cover-uploader {
  margin-top: 12px;
  position: relative;
  z-index: 1;
  display: block;
  width: fit-content;
}

.cover-uploader :deep(.el-upload) {
  border: 1px dashed #dcdfe6;
  border-radius: 12px;
  cursor: pointer;
  width: 320px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  overflow: hidden;
  transition: all 0.3s;
  position: relative;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.cover-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.delete-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s;
}

.cover-image-wrapper:hover .delete-mask {
  opacity: 1;
}

/* 标签选择器弹窗样式 */
.tag-popover {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
  border: 1px solid #ebeef5 !important;
  z-index: 3000 !important;
}

.tag-selector-popover {
  padding: 20px;
  background: #fff;
  width: 400px;
  box-sizing: border-box;
}

.tag-search {
  margin-bottom: 16px;
}

.tag-list-simple {
  margin: 0 -8px;
}

.tags-container {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 0 !important; /* 使用 margin 控制间距 */
  max-height: 260px;
  overflow-y: auto;
  padding: 4px !important;
  width: 100%;
  box-sizing: border-box;
}

.tag-item {
  display: inline-block !important;
  padding: 6px 14px !important;
  margin: 6px !important;
  background: #f5f7fa;
  color: #606266;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e4e7ed;
  white-space: nowrap;
  user-select: none;
}

.tag-item:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.tag-item.selected {
  background: #409eff;
  color: #fff;
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.no-tags {
  padding: 30px 0;
  text-align: center;
  color: #909399;
  font-size: 13px;
}

.tag-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: space-between;
}

.summary-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.summary-wrapper:focus-within {
  border-color: #409eff;
}

.summary-wrapper :deep(.el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  padding: 12px;
}

.summary-footer {
  display: flex;
  justify-content: flex-start;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-top: 1px solid #f0f0f0;
}

.ai-summary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #606266;
  transition: all 0.2s;
  user-select: none;
}

.ai-summary-btn:hover {
  background-color: #ecf5ff;
  color: #409eff;
  border-color: #c6e2ff;
}

.ai-summary-btn.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.ai-sparkle {
  font-size: 16px;
  color: #409eff;
}

.toc-item {
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.toc-item:hover {
  background-color: #f0f2f5;
  color: #667eea;
}

.toc-level-1 {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
  margin-top: 8px;
}
.toc-level-1:first-child {
  margin-top: 0;
}

.toc-level-2 {
  padding-left: 28px;
}

.toc-level-3 {
  padding-left: 44px;
  font-size: 13px;
  color: #909399;
}

.toc-level-4 {
  padding-left: 60px;
  font-size: 13px;
  color: #aab2bf;
}

.toc-level-5 {
  padding-left: 76px;
  font-size: 13px;
  color: #c0c4cc;
}
</style>
