import axios from 'axios'

const restApi = axios.create({
  baseURL: 'http://api.dechess.io',
})

export default restApi
