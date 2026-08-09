import { setupPinia } from './pinia'
import { setupRouter } from './router'
import { setupI18n } from '@shared/i18n'

export function setupApp(app) {
  setupPinia(app)
  setupI18n(app)
  setupRouter(app)
}
