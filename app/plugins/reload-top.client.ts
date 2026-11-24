// Н58 — владелец 24.11.2026: при перезагрузке страницы всегда открывается верх (на главной — hero), даже если
// в адресе остался #projects / #form или браузер помнит позицию прокрутки. Переход по ссылке с другой страницы,
// клик по меню и назад/вперёд по истории не затрагиваются (тип навигации — только reload).
// Плагин идёт до роутера (enforce: 'pre'): хеш и сохранённая позиция убираются из текущей записи истории
// (replaceState — новой записи нет) до того, как vue-router их прочитает. TODO(question): new Н58
export default defineNuxtPlugin({
  name: 'reload-top',
  enforce: 'pre',
  order: -1000,
  setup(nuxtApp) {
    const nav = performance.getEntriesByType('navigation')[0] as
      PerformanceNavigationTiming | undefined
    if (nav?.type !== 'reload') return

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    const state =
      history.state && typeof history.state === 'object'
        ? { ...history.state, scroll: null }
        : history.state
    history.replaceState(state, '', location.pathname + location.search)
    window.scrollTo(0, 0)
    nuxtApp.hooks.hookOnce('app:suspense:resolve', () => window.scrollTo(0, 0))
  },
})
