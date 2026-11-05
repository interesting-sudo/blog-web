import request from '@/utils/request'

// 添加评论
export function addComment(data, config = {}) {
  return request({
    url: '/comment/add',
    method: 'post',
    data,
    ...config
  })
}

// 回复评论
export function replyComment(data, config = {}) {
  return request({
    url: '/comment/reply',
    method: 'post',
    data,
    ...config
  })
}

// 获取评论列表
export function getCommentList(data) {
  return request({
    url: '/comment/list',
    method: 'post',
    data,
    skipShowError: true
  })
}

// 评论点赞
export function toggleCommentLike(commentId, userId) {
  return request({
    url: `/comment/${commentId}/toggleLike`,
    method: 'post',
    params: { userId }
  })
}

// 获取已点赞评论列表
export function getLikedComments(blogId, userId) {
  return request({
    url: `/comment/listLiked/${blogId}`,
    method: 'get',
    params: { userId },
    skipShowError: true
  })
}

/**
 * 管理员获取评论列表
 * @param {Object} data { pageNum, pageSize, content, nickname, blogTitle, status }
 */
export function adminGetCommentList(data) {
  return request({
    url: '/admin/comment/list',
    method: 'post',
    data
  })
}

/**
 * 管理员批量更新评论状态
 * @param {Array} commentIds 
 * @param {Number} status 1-正常, 0-隐藏/禁用
 */
export function adminBatchUpdateStatus(commentIds, status) {
  return request({
    url: '/admin/comment/batch/status',
    method: 'put',
    data: commentIds,
    params: { status }
  })
}

