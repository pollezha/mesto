import type { RouterConfig } from '@nuxt/schema'

// Роутер строгий к регистру и завершающему слэшу, как nginx: /Services и /services/ — не страницы, а 404
// (слэш на проде nginx сам 301-ит на адрес без слэша). Иначе plugins/not-found-url.client.ts наложил бы
// на 404 чужую страницу.
export default {
  strict: true,
  sensitive: true,
} satisfies RouterConfig
