import axios from 'axios'

// export const restApi = axios.create({
//   baseURL: 'https://api.dechess.io',
// })

export const restApi = axios.create({
  baseURL: 'http://localhost:3001',
})

export default restApi
