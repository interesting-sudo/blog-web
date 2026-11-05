/**
 * 演示模式 adapter
 * 用 axios 自定义 adapter 顶掉真实网络请求，所有 API 模块、页面代码零改动。
 * 返回体仍然序列化成 JSON 字符串，走一遍真实的 transformResponse，保证与线上行为一致。
 */
import {
  articles,
  categories,
  tags,
  comments,
  users,
  currentUser,
  favoriteArticles,
  DEMO_USER_ID,
  DEMO_TOKEN
} from './mockData'

const ok = (data, msg = 'success') => ({ code: 200, msg, data })

function paged(list, pageNum = 1, pageSize = 10) {
  const n = Math.max(1, Number(pageNum) || 1)
  const s = Math.max(1, Number(pageSize) || 10)
  const start = (n - 1) * s
  return {
    records: list.slice(start, start + s),
    total: list.length,
    pageNum: n,
    pageSize: s,
    pages: Math.ceil(list.length / s) || 0
  }
}

function parseParams(config) {
  const out = {}
  const p = config.params
  if (p && typeof p === 'object') Object.assign(out, p)
  const q = (config.url || '').split('?')[1]
  if (q) {
    new URLSearchParams(q).forEach((v, k) => {
      out[k] = v
    })
  }
  return out
}

function parseBody(config) {
  const d = config.data
  if (!d) return {}
  if (typeof d === 'string') {
    try {
      return JSON.parse(d)
    } catch {
      return {}
    }
  }
  if (typeof FormData !== 'undefined' && d instanceof FormData) {
    const out = {}
    d.forEach((v, k) => {
      out[k] = v
    })
    return out
  }
  return d
}

// 管理后台用的扁平评论列表
const flatComments = []
comments.forEach(root => {
  const blog = articles.find(a => a.id === root.blogId)
  flatComments.push({
    ...root,
    blogTitle: blog ? blog.title : '',
    parentId: '0',
    children: undefined
  })
  ;(root.children || []).forEach(c => {
    flatComments.push({
      ...c,
      blogTitle: blog ? blog.title : '',
      children: undefined
    })
  })
})

/* ---------- 路由表 ---------- */

function resolve(config) {
  const url = (config.url || '').split('?')[0]
  const method = (config.method || 'get').toLowerCase()
  const params = parseParams(config)
  const body = parseBody(config)

  const match = re => url.match(re)

  /* ----- 用户与鉴权 ----- */
  if (/\/user\/login$/.test(url) && method === 'post') {
    return ok({ accessToken: DEMO_TOKEN, expiresIn: 604800, tokenType: 'Bearer' })
  }
  if (/\/user\/auth\/refresh$/.test(url)) {
    return ok({ accessToken: DEMO_TOKEN, expiresIn: 604800 })
  }
  if (/\/user\/info\/[^/]+$/.test(url) && method === 'get') {
    const id = url.split('/').pop()
    const u = users.find(x => String(x.id) === String(id))
    return ok(u ? { ...u, roleId: u.roleId ?? 2 } : { ...currentUser })
  }
  if (/\/user\/update$/.test(url)) {
    return ok({ ...currentUser, ...body })
  }
  if (/\/user\/(register|email-code|password|update\/password)/.test(url)) {
    return ok(true)
  }

  /* ----- 分类 / 标签 ----- */
  if (/\/blog\/category\/list$/.test(url)) {
    return ok(categories)
  }
  if (/\/blog\/tag\/list$/.test(url)) {
    return ok(tags)
  }

  /* ----- 文章列表 ----- */
  if (/\/blog\/list$/.test(url) && method === 'post') {
    let list = articles.filter(a => a.status === 1)
    const cid = body.categoryId
    if (cid && Number(cid) !== 0) {
      list = list.filter(a => String(a.categoryId) === String(cid))
    }
    return ok(paged(list, body.pageNum, body.pageSize))
  }
  if (/\/blog\/list\/user\/[^/]+\/favorites$/.test(url)) {
    return ok(paged(favoriteArticles, params.pageNum, params.pageSize))
  }
  if (/\/blog\/list\/user\/[^/]+$/.test(url)) {
    const uid = url.split('/').pop()
    const list = articles.filter(a => String(a.createBy) === String(uid))
    return ok(paged(list.length ? list : articles, params.pageNum, params.pageSize))
  }
  if (/\/blog\/stats\/user\/[^/]+$/.test(url)) {
    const totalLikes = articles.reduce((s, a) => s + a.likeCount, 0)
    const totalViews = articles.reduce((s, a) => s + a.viewCount, 0)
    const totalFavorites = articles.reduce((s, a) => s + a.collectCount, 0)
    return ok({
      blogCount: articles.length,
      totalLikes,
      totalViews,
      totalFavorites
    })
  }

  /* ----- 文章详情与互动 ----- */
  let m = match(/\/blog\/detail\/([^/]+)$/)
  if (m && method === 'get') {
    const a = articles.find(x => String(x.id) === String(m[1])) || articles[0]
    return ok(a)
  }
  m = match(/\/blog\/([^/]+)\/isLiked$/)
  if (m) return ok(false)
  m = match(/\/blog\/([^/]+)\/toggleLike$/)
  if (m) {
    const a = articles.find(x => String(x.id) === String(m[1]))
    return ok({ isLiked: true, likeCount: (a ? a.likeCount : 0) + 1 })
  }
  m = match(/\/blog\/([^/]+)\/isFavorited$/)
  if (m) return ok(false)
  m = match(/\/blog\/([^/]+)\/toggleFavorite$/)
  if (m) {
    const a = articles.find(x => String(x.id) === String(m[1]))
    return ok({ isFavorited: true, favoriteCount: (a ? a.collectCount : 0) + 1 })
  }
  if (/\/blog\/(publish|edit|delete)/.test(url)) {
    return ok(null)
  }

  /* ----- 评论 ----- */
  if (/\/comment\/list$/.test(url) && method === 'post') {
    const blogId = body.blogId
    const list = blogId ? comments.filter(c => String(c.blogId) === String(blogId)) : comments
    return ok(paged(list, body.pageNum, body.pageSize))
  }
  if (/\/comment\/listLiked\//.test(url)) {
    return ok([])
  }
  if (/\/comment\/(add|reply)/.test(url)) {
    return ok({ id: String(Date.now()) })
  }
  if (/\/comment\/[^/]+\/toggleLike$/.test(url)) {
    return ok({ isLiked: true, likeCount: 1 })
  }

  /* ----- 检索 ----- */
  if (/\/search\/blog$/.test(url)) {
    const kw = String(body.keyword || '').trim()
    if (!kw) return ok(paged([], body.pageNum, body.pageSize))
    const lower = kw.toLowerCase()
    const list = articles.filter(
      a =>
        a.title.toLowerCase().includes(lower) ||
        a.summary.toLowerCase().includes(lower) ||
        a.content.toLowerCase().includes(lower) ||
        a.tags.some(t => t.toLowerCase().includes(lower))
    )
    return ok(paged(list, body.pageNum, body.pageSize))
  }

  /* ----- AI ----- */
  if (/\/ai\/title$/.test(url)) {
    return ok('从单体到微服务：一次真实的边界划分复盘')
  }
  if (/\/ai\/tags$/.test(url)) {
    return ok('Spring Cloud, 架构设计, 微服务')
  }

  /* ----- 文件上传 ----- */
  if (/\/document\/(upload|delete)/.test(url)) {
    return ok({ url: '', fileName: '' })
  }

  /* ----- 管理后台 ----- */
  if (/\/admin\/user\/list$/.test(url)) {
    const kw = String(body.nickname || body.username || '').trim().toLowerCase()
    const list = kw
      ? users.filter(
          u =>
            u.nickname.toLowerCase().includes(kw) ||
            u.username.toLowerCase().includes(kw)
        )
      : users
    return ok(paged(list, body.pageNum, body.pageSize))
  }
  if (/\/admin\/user\/(status|password)/.test(url)) {
    return ok(true)
  }
  if (/\/admin\/blog\/list$/.test(url)) {
    return ok(paged(articles, body.pageNum, body.pageSize))
  }
  if (/\/admin\/blog\/batch/.test(url)) {
    return ok(true)
  }
  if (/\/admin\/category\/list$/.test(url)) {
    return ok(paged(categories, body.pageNum, body.pageSize || 100))
  }
  if (/\/admin\/category/.test(url)) {
    return ok(true)
  }
  if (/\/admin\/tag\/list$/.test(url)) {
    return ok(paged(tags, body.pageNum, body.pageSize || 100))
  }
  if (/\/admin\/tag/.test(url)) {
    return ok(true)
  }
  if (/\/admin\/comment\/list$/.test(url)) {
    return ok(paged(flatComments, body.pageNum, body.pageSize))
  }
  if (/\/admin\/comment/.test(url)) {
    return ok(true)
  }

  return null
}

export default function demoAdapter(config) {
  return new Promise(resolvePromise => {
    const payload = resolve(config)
    const data = JSON.stringify(payload === null ? ok(null) : payload)
    // 轻微延迟，让 loading 骨架/动效有机会展示，观感更接近真实接口
    setTimeout(() => {
      resolvePromise({
        data,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
        request: { responseURL: config.url }
      })
    }, 140)
  })
}
