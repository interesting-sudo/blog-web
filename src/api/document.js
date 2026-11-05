import request from '@/utils/request'

export function uploadFile(data, config = {}) {
  return request({
    url: '/document/upload',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    ...config
  })
}

export function deleteFile(fileUrl, config = {}) {
  return request({
    url: '/document/delete',
    method: 'delete',
    params: { fileUrl },
    ...config
  })
}
