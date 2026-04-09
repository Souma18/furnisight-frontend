import { setupPinia } from './pinia'
import { setupRouter } from './router'

export function setupApp(app) {
  setupPinia(app)
  setupRouter(app)
}
