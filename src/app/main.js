import { createApp } from 'vue'
import App from './App.vue'
import '@shared/styles/global.css'
import '@shared/lib/api'
import { getApiErrorMessage } from '@shared/lib/api'
import { setupApp } from './plugins'

const app = createApp(App)

app.config.errorHandler = (error, instance, info) => {
  console.warn('[App] handled error:', getApiErrorMessage(error))
  console.error('[App] Original error:', error, info)
}

window.addEventListener('unhandledrejection', (event) => {
  const message = getApiErrorMessage(event.reason)
  console.warn('[App] handled rejected promise:', message)
  event.preventDefault()
})

setupApp(app)
app.mount('#app')
