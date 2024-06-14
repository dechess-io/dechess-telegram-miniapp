import axios from 'axios'

const restApi = axios.create({
  baseURL: 'https://api.dechess.io',
})

export default restApi
