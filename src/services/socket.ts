import { io } from 'socket.io-client'

export const token = localStorage.getItem('token')

export const socket = io('https://api.dechess.io', {
  extraHeaders: {
    Authorization: token !== null ? token : '',
  },
  autoConnect: true,
  reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 5
})
