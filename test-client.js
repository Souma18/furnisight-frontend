import axios from 'axios';
const client = axios.create({
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
});
client.get('http://localhost:8081/test', { params: { statuses: ['ASSIGNED', 'IN_PROGRESS'] } })
  .catch(console.error);
