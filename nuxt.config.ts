import { SITE_URL, sitePaths } from './config/site'

// https://nuxt.com/docs/api/configuration/nuxt-config
// Стек и окружение — docs/package/07-*.md («Инфраструктура»).
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  // Структура app/ + server/ в корне, как в «Инфраструктуре» → «Структура проекта».
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },

  typescript: { strict: true },

  modules: ['@nuxtjs/i18n', '@nuxt/eslint', '@nuxt/test-utils/module'],

  // Токены первыми, затем глобальная база (шрифт, фокус, reduced motion).
  css: ['~/assets/tokens.css', '~/assets/base.css'],

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
  },

  runtimeConfig: {
    // Серверные переменные (TELEGRAM_*, SMTP_*, MAIL_*) здесь не заводятся: без префикса NUXT_
    // они не переопределяют runtimeConfig в рантайме. Их читает server/utils/env.ts (Н1).
    public: {
      // Домен для canonical, hreflang и sitemap. Значение по умолчанию — из docs («Переменные окружения»);
      // NUXT_PUBLIC_SITE_URL переопределяет его при сборке (пререндер берёт значение во время сборки) и в рантайме.
      siteUrl: SITE_URL,
      analyticsEnabled: false,
      gaId: '',
      ymId: '',
    },
  },

  nitro: {
    preset: 'node-server',
    hooks: {
      // 404 отвечает статусом 404, а пререндер считает не-200 ошибкой и файл не пишет. Для /404, /en/404 и их
      // payload (нужен гидратации 404.html) ошибка снимается только при статусе 404 — другие ошибки остаются.
      'prerender:generate'(route) {
        const is404Page = /^\/(en\/)?404(\/_payload\.json(\?.*)?)?$/.test(route.route)
        if (is404Page && route.error?.statusCode === 404) {
          delete route.error
        }
      },
    },
    prerender: {
      crawlLinks: true,
      // Все маршруты из ТЗ → «Маршруты» (config/site.ts); 404 пререндерится дважды: /404.html и /en/404.html (роуты /404 и /en/404 → файлы 404.html;
      // роут /404.html Nuxt отдаёт как пустую SPA-оболочку, поэтому не он);
      // sitemap.xml и robots.txt — серверные маршруты, при сборке становятся статическими файлами.
      routes: [...sitePaths, '/404', '/en/404', '/sitemap.xml', '/robots.txt'],
      // Файлы <путь>.html (privacy.html), а не privacy/index.html: адреса без слэша, try_files nginx.
      autoSubfolderIndex: false,
    },
  },
})
