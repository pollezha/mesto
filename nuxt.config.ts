// https://nuxt.com/docs/api/configuration/nuxt-config
// Стек и окружение — docs/…/package/07-*.md («Инфраструктура»).
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Структура app/ + server/ в корне, как в «Инфраструктуре» → «Структура проекта».
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  typescript: { strict: true },

  modules: ['@nuxtjs/i18n', '@nuxt/eslint', '@nuxt/test-utils/module'],

  css: ['~/assets/tokens.css'],

  i18n: {
    strategy: 'prefix_except_default',
    defaultLocale: 'ru',
    detectBrowserLanguage: false,
    // Словари лежат в корне (locales/), а не в i18n/locales/.
    langDir: '../locales',
    locales: [
      { code: 'ru', language: 'ru', file: 'ru.json' },
      { code: 'en', language: 'en', file: 'en.json' },
    ],
    // TODO: baseUrl из NUXT_PUBLIC_SITE_URL для canonical и hreflang (ТЗ → SEO)
  },

  runtimeConfig: {
    // TODO(question): new — серверные переменные из «Инфраструктуры» (TELEGRAM_*, SMTP_*, MAIL_*)
    // без префикса NUXT_ не переопределяют runtimeConfig в рантайме; см. docs/questions-log.md
    public: {
      siteUrl: '',
      analyticsEnabled: false,
      gaId: '',
      ymId: '',
    },
  },

  nitro: {
    preset: 'node-server',
    prerender: {
      crawlLinks: true,
      // TODO: все маршруты из ТЗ → «Маршруты»; 404 пререндерится дважды: /404.html и /en/404.html
      routes: ['/'],
    },
  },
})
