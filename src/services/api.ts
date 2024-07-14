import axios from 'axios'

export const restApi = axios.create({
  baseURL: 'https://api.dechess.io',
})

export default restApi
