export function parseToken(token) {
  if (!token) return null
  try {
    // JWT structure: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    // Fix base64 format
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Decode base64
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to parse token', e)
    return null
  }
}
