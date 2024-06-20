import axios from 'axios'

// const restApi = axios.create({
//   baseURL: 'https://api.dechess.io',
// })

const restApi = axios.create({
  baseURL: 'http://localhost:3001',
})

export default restApi
