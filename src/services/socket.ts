import { io } from 'socket.io-client'

const token = localStorage.getItem('token')

export const socket = io('https://api.dechess.io', {
  extraHeaders: {
    Authorization: token !== null ? token : '',
  },
  autoConnect: true,
})
