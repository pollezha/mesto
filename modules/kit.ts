import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

// Песочница компонентов /__kit — только для разработки и визуальной сверки с Figma.
// Подключается в `nuxt dev` или при сборке с MESTO_KIT=1 (так собирает Playwright).
// Обычная сборка и Docker-образ её не содержат.
export default defineNuxtModule({
  meta: { name: 'mesto-kit' },
  setup(_options, nuxt) {
    if (!nuxt.options.dev && process.env.MESTO_KIT !== '1') return
    const { resolve } = createResolver(import.meta.url)
    extendPages((pages) => {
      pages.push({ name: 'kit', path: '/__kit', file: resolve('../app/kit/KitPage.vue') })
    })
  },
})
