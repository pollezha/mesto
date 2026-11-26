// Адрес посетителя на 404 — ТЗ → «Маршруты», Р60.
// nginx отдаёт пререндеренный 404.html на любой неизвестный адрес, а роутер Nuxt стартует с пути пререндера
// (nuxtApp.payload.path = /404 или /en/404) и подменяет им адрес в строке браузера; переключатель языка
// тогда ведёт на /en/404, а не на тот же адрес с /en/ или без. Плагин возвращает в payload.path реальный путь:
// [...slug] ловит любой неизвестный адрес и рендерит ту же 404 (роутер строгий — app/router.options.ts,
// поэтому реальная страница не подменится).
// Порядок строго между соседями: nuxt:revive-payload:client (-30) заполняет payload.path, плагин роутера
// (enforce: 'pre', -20) читает его для стартового адреса.
export default defineNuxtPlugin({
  name: 'not-found-url',
  order: -25,
  setup(nuxtApp) {
    const prerendered = nuxtApp.payload.path
    if (prerendered !== '/404' && prerendered !== '/en/404') return
    const { pathname } = window.location
    if (pathname === prerendered || pathname === `${prerendered}/`) return
    // Повторные слэши схлопываем: /en//evil.example дал бы переключателю href="//evil.example" —
    // протокол-относительную ссылку на чужой домен (открытый редирект), решение владельца от 26.11.2026 (Н72).
    nuxtApp.payload.path = pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
    // Флаг для [...slug].vue: ссылки SSR посчитаны для /404, страницу нужно перерисовать.
    useState('not-found-url-replaced').value = true
  },
})
