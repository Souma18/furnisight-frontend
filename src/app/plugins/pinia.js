import { createPinia } from 'pinia'

const pinia = createPinia()

export function setupPinia(app) {
  app.use(pinia)
}

export { pinia }
