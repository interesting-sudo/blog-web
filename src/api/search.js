import request from '@/utils/request'

/**
 * Search blogs
 * @param {Object} data Search parameters
 * @param {string} data.keyword Search keyword
 * @param {number} data.pageNum Page number
 * @param {number} data.pageSize Page size
 * @returns {Promise}
 */
export function searchBlogs(data) {
  return request({
    url: '/search/blog',
    method: 'post',
    data,
    skipShowError: true
  })
}
