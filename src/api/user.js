import request from '@/utils/request'

export function login(data, config = {}) {
  return request({
    url: '/user/login',
    method: 'post',
    data,
    ...config
  })
}

export function refreshToken(config = {}) {
  return request({
    url: '/user/auth/refresh',
    method: 'post',
    skipToken: true, // 刷新 Token 时不需要携带旧的 AccessToken
    ...config
  })
}

// 获取用户信息
export function getUserInfo(userId, config = {}) {
  return request({
    url: `/user/info/${userId}`,
    method: 'get',
    ...config
  })
}

// 发送注册验证码
export function sendRegisterCode(email) {
  return request({
    url: '/user/register/email-code',
    method: 'post',
    params: { email }
  })
}

// 校验注册邮箱验证码
export function checkEmailCode(data) {
  return request({
    url: '/user/email-code/check',
    method: 'post',
    data
  })
}

// 校验重置密码邮箱验证码
export function checkResetPasswordCode(data) {
  return request({
    url: '/user/password/check',
    method: 'post',
    data
  })
}

// 用户注册
export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

// 更新用户信息
export function updateUserInfo(data, config = {}) {
  return request({
    url: '/user/update',
    method: 'put',
    data,
    ...config
  })
}

// 发送重置密码验证码
export function sendResetCode(email) {
  return request({
    url: '/user/password/email-code',
    method: 'post',
    params: { email }
  })
}

// 修改密码（通过旧密码）
export function updatePassword(data) {
  return request({
    url: '/user/update/password',
    method: 'put',
    data
  })
}

// 重置密码
export function resetPassword(data) {
  return request({
    url: '/user/password/reset',
    method: 'put',
    data
  })
}

/**
 * 管理员获取用户列表
 * @param {Object} data { pageNum, pageSize, username, nickname }
 * @param {Object} config Axios config
 */
export function adminGetUserList(data, config = {}) {
  return request({
    url: '/admin/user/list',
    method: 'post',
    data,
    ...config
  })
}

/**
 * 管理员更新用户状态 (启用/禁用)
 * @param {Number|String} userId 
 * @param {Number} status 0-正常, 1-禁用 (根据后端逻辑确认)
 * @param {Object} config Axios config
 */
export function adminUpdateUserStatus(userId, status, config = {}) {
  return request({
    url: `/admin/user/status/${userId}`,
    method: 'put',
    params: { status },
    ...config
  })
}

/**
 * 管理员重置用户密码
 * @param {Number|String} userId 
 * @param {Object} config Axios config
 */
export function adminResetPassword(userId, config = {}) {
  return request({
    url: `/admin/user/password/reset/${userId}`,
    method: 'put',
    ...config
  })
}
