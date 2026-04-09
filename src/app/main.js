import { createApp } from 'vue'
import App from './App.vue'
import '@shared/styles/global.css'
import '@shared/lib/api'
import { setupApp } from './plugins'

const app = createApp(App)
setupApp(app)
app.mount('#app')
