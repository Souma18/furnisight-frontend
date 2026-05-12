import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'
console.log(baseURL)

export const apiClient = axios.create({
  baseURL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})
