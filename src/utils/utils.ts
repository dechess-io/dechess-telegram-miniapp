import axios from 'axios'

export const setAuthToken = (token: string) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else delete axios.defaults.headers.common['Authorization']
}

export const apiHeader = {
  Authorization: `Bearer ${localStorage.getItem('token')}`,
}

export function hasJWT() {
  let flag = false
  localStorage.getItem('token') ? (flag = true) : (flag = false)
  return flag
}

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
}
