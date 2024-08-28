export const generateAuthorization = (token: string = '') => {
  if (token) {
    return `Bearer ${token}`
  }
  return ''
}
