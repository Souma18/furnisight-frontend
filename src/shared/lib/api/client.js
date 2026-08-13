import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'
console.log(baseURL)

export const apiClient = axios.create({
  baseURL,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Spring Boot expects repeated params: materials=a&materials=b (not materials[]=a)
  paramsSerializer: {
    serialize(params) {
      const parts = []
      for (const [key, val] of Object.entries(params)) {
        if (val === null || val === undefined || val === '') continue
        if (Array.isArray(val)) {
          if (val.length === 0) continue
          for (const item of val) {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`)
          }
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        }
      }
      return parts.join('&')
    },
  },
})
