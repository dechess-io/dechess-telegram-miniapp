import { io } from 'socket.io-client'

export const token = localStorage.getItem('token')

export const socket = io('https://api.dechess.io', {
  extraHeaders: {
    Authorization: token !== null ? token : '',
  },
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
})

// export const socket = io('http://localhost:3001', {
//   extraHeaders: {
//     Authorization: token !== null ? token : '',
//   },
//   autoConnect: true,
//   reconnection: true,
//   reconnectionDelay: 10000,
//   reconnectionDelayMax: 5000,
//   reconnectionAttempts: 5,
// })

socket.on('connect_error', (error) => {
  console.error('Connection Error:', error.message)
  // Optionally, disable automatic reconnection if the issue is persistent
  socket.io.opts.reconnection = false
})
