/**
 * 格式化相对时间 (用于用户端)
 * @param {string|number|Date} time 
 * @returns {string} XX 分钟前 / XX 小时前 / YYYY-MM-DD
 */
export function formatTime(time) {
  if (!time) return ''
  
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  
  // 0~60 分钟（1 小时内）：精确到「XX 分钟前」
  const minute = 60 * 1000
  if (diff < 60 * minute) {
    const minutes = Math.floor(diff / minute)
    return `${Math.max(1, minutes)} 分钟前`
  }
  
  // 60 分钟～24 小时（1 天内）：向上取整归并为「N 小时前」
  const hour = 60 * minute
  if (diff < 24 * hour) {
    const hours = Math.floor(diff / hour)
    return `${hours} 小时前`
  }
  
  // 24 小时～7 天（1 周内）：归并为「N 天前」
  const day = 24 * hour
  if (diff < 7 * day) {
    const days = Math.floor(diff / day)
    return `${days} 天前`
  }
  
  // 超过 7 天（1 周）：直接展示精准绝对时间「YYYY-MM-DD」
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${d}`
}
