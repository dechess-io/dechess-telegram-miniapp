import { isTMA } from '@telegram-apps/sdk'
import axios from 'axios'

export const restApi = axios.create({
  baseURL: 'https://api.dechess.io',
})

export const isTma = await isTMA()

// export const restApi = axios.create({
//   baseURL: 'http://localhost:3001',
// })

export default restApi
