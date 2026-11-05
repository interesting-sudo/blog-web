import request from '@/utils/request'

// 获取文章分类列表
export function getCategoryList() {
  return request({
    url: '/blog/category/list',
    method: 'get',
    skipShowError: true
  })
}

// 获取文章标签列表
export function getTagList(data) {
  return request({
    url: '/blog/tag/list',
    method: 'post',
    data
  })
}
 

// 获取博客列表
export function getBlogList(data) {
  return request({
    url: '/blog/list',
    method: 'post',
    data,
    skipShowError: true
  })
}

// 发布博客
export function publishBlog(data) {
  return request({
    url: '/blog/publish',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    skipShowError: true
  })
}

// 编辑博客
export function editBlog(data) {
  return request({
    url: '/blog/edit',
    method: 'put',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    skipShowError: true
  })
}

// 获取博客详情
export function getBlogDetail(id, userId) {
  return request({
    url: `/blog/detail/${id}`,
    method: 'get',
    params: { userId },
    skipShowError: true
  })
}

// 点赞/取消点赞
export function toggleLike(blogId, userId) {
  return request({
    url: `/blog/${blogId}/toggleLike`,
    method: 'post',
    params: { userId }
  })
}

// 查询是否点赞
export function getIsLiked(blogId, userId) {
  return request({
    url: `/blog/${blogId}/isLiked`,
    method: 'get',
    params: { userId },
    skipShowError: true
  })
}

// 收藏/取消收藏
export function toggleFavorite(blogId, userId) {
  return request({
    url: `/blog/${blogId}/toggleFavorite`,
    method: 'post',
    params: { userId }
  })
}

// 查询是否收藏
export function getIsFavorited(blogId, userId) {
  return request({
    url: `/blog/${blogId}/isFavorited`,
    method: 'get',
    params: { userId },
    skipShowError: true
  })
}

// 获取用户文章列表
export function getUserBlogList(userId, pageNum = 1, pageSize = 10) {
  return request({
    url: `/blog/list/user/${userId}`,
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  })
}

// 获取用户文章统计数据
export function getUserStats(userId) {
  return request({
    url: `/blog/stats/user/${userId}`,
    method: 'get'
  })
}

// 获取用户收藏文章列表
export function getUserFavoriteBlogList(userId, pageNum = 1, pageSize = 10) {
  return request({
    url: `/blog/list/user/${userId}/favorites`,
    method: 'get',
    params: {
      pageNum,
      pageSize
    }
  })
}

// 删除博客
export function deleteBlog(id) {
  return request({
    url: `/blog/delete/${id}`,
    method: 'delete'
  })
}

/**
 * 管理员获取分类列表
 * @param {Object} data { pageNum, pageSize }
 */
export function adminGetCategoryList(data) {
  return request({
    url: '/admin/category/list',
    method: 'post',
    data
  })
}

/**
 * 管理员新增分类
 * @param {Object} data { name, description }
 */
export function adminAddCategory(data) {
  return request({
    url: '/admin/category/add',
    method: 'post',
    data
  })
}

/**
 * 管理员修改分类
 * @param {Object} data { id, name, description }
 */
export function adminUpdateCategory(data) {
  return request({
    url: '/admin/category/update',
    method: 'put',
    data
  })
}

/**
 * 管理员获取标签列表
 * @param {Object} data { pageNum, pageSize, name }
 */
export function adminGetTagList(data) {
  return request({
    url: '/admin/tag/list',
    method: 'post',
    data
  })
}

/**
 * 管理员删除分类
 * @param {Number|String} categoryId 
 */
export function adminDeleteCategory(categoryId) {
  return request({
    url: `/admin/category/${categoryId}`,
    method: 'delete'
  })
}

/**
 * 管理员新增标签
 * @param {Object} data { name }
 */
export function adminAddTag(data) {
  return request({
    url: '/admin/tag/add',
    method: 'post',
    data
  })
}

/**
 * 管理员修改标签
 * @param {Object} data { id, name }
 */
export function adminUpdateTag(data) {
  return request({
    url: '/admin/tag/update',
    method: 'put',
    data
  })
}

/**
 * 管理员获取文章列表
 * @param {Object} data { pageNum, pageSize, title, authorName, categoryName, tags, status }
 */
export function adminGetBlogList(data) {
  return request({
    url: '/admin/blog/list',
    method: 'post',
    data
  })
}

/**
 * 管理员批量更新文章状态
 * @param {Array} blogIds 
 * @param {Number} status 1-上架, 2-下架
 */
export function adminBatchUpdateStatus(blogIds, status) {
  return request({
    url: '/admin/blog/batch/hide',
    method: 'put',
    data: blogIds,
    params: { status }
  })
}

/**
 * 管理员删除标签
 * @param {Number|String} tagId 
 */
export function adminDeleteTag(tagId) {
  return request({
    url: `/admin/tag/${tagId}`,
    method: 'delete'
  })
}
