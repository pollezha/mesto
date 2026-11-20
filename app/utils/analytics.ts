// Счётчики GA4 и Яндекс Метрики: Р22, Р58, Р59; «Инфраструктура» → «Аналитика».
// Модуль без доступа к контексту Nuxt: идентификаторы передаёт useConsent, состояние — в памяти страницы.
// Ничего не сохраняется, кроме того, что ставят сами счётчики; персональных данных нет.

export interface CounterIds {
  gaId: string
  ymId: string
}

type Win = Window &
  typeof globalThis & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    ym?: ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number }
    [key: string]: unknown
  }

// ids — активные счётчики (есть согласие); gaLoaded / ymLoaded — скрипт подключён и инициализирован
// (один раз за жизнь страницы, повторное согласие только снимает флаги отключения).
const state: { ids: CounterIds | null; gaLoaded: string; ymLoaded: string } = {
  ids: null,
  gaLoaded: '',
  ymLoaded: '',
}

function win(): Win | null {
  return typeof window === 'undefined' ? null : (window as Win)
}

function addScript(src: string): void {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

/**
 * Включает счётчики, у которых задан ID. Скрипт и инициализация каждого — не больше одного раза за жизнь
 * страницы; при повторном согласии после отказа только снимаются флаги отключения.
 */
export function loadCounters(ids: CounterIds): void {
  const w = win()
  if (!w || state.ids) return
  const gaId = ids.gaId.trim()
  const ymId = ids.ymId.trim()
  state.ids = { gaId, ymId }

  if (gaId) {
    w[`ga-disable-${gaId}`] = false
  }
  if (ymId) {
    w[`disableYaCounter${ymId}`] = false
  }

  if (gaId && state.gaLoaded !== gaId) {
    state.gaLoaded = gaId
    w.dataLayer = w.dataLayer || []
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments)
    }
    w.gtag('js', new Date())
    w.gtag('config', gaId)
    addScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`)
  }

  if (ymId && state.ymLoaded !== ymId) {
    state.ymLoaded = ymId
    if (!w.ym) {
      const queue: unknown[][] = []
      const ym = ((...args: unknown[]) => {
        queue.push(args)
      }) as NonNullable<Win['ym']>
      ym.a = queue
      ym.l = Date.now()
      w.ym = ym
    }
    addScript('https://mc.yandex.ru/metrika/tag.js')
    w.ym(Number(ymId), 'init', {})
  }
}

const COUNTER_COOKIE = /^(_ga|_ga_.+|_gid|_gat.*|_gcl_.+|_ym.+)$/

/** Домен текущей страницы и родительские (kind `a.b.c` → `a.b.c`, `b.c`), без публичных суффиксов-одиночек. */
function domainCandidates(host: string): (string | undefined)[] {
  const parts = host.split('.')
  const out: (string | undefined)[] = [undefined, host]
  for (let i = 0; i < parts.length - 1; i++) out.push('.' + parts.slice(i).join('.'))
  return out
}

/** Удаляет cookie счётчиков на текущем домене и родительских. */
export function removeCounterCookies(): void {
  if (typeof document === 'undefined') return
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0]!.trim())
    .filter((n) => COUNTER_COOKIE.test(n))
  for (const name of names) {
    for (const domain of domainCandidates(location.hostname)) {
      document.cookie =
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/` +
        (domain ? `; domain=${domain}` : '')
    }
  }
}

/**
 * Отказ: прекращает отправку и удаляет cookie счётчиков (Р59).
 * Уже загруженные скрипты из памяти без перезагрузки страницы не выгрузить.
 */
export function disableCounters(ids: CounterIds): void {
  const w = win()
  if (!w) return
  if (ids.gaId) w[`ga-disable-${ids.gaId}`] = true
  if (ids.ymId) w[`disableYaCounter${ids.ymId}`] = true
  state.ids = null
  removeCounterCookies()
}

/** Цель «успешная отправка формы»: только если счётчики загружены (то есть есть согласие). */
export function reportLeadGoal(params: { locale: string; page: string }): void {
  const w = win()
  const ids = state.ids
  if (!w || !ids) return
  if (ids.gaId && w.gtag)
    w.gtag('event', 'generate_lead', { locale: params.locale, page: params.page })
  if (ids.ymId && w.ym) w.ym(Number(ids.ymId), 'reachGoal', 'lead')
}

/** Только для тестов. */
export function __resetAnalytics(): void {
  state.ids = null
  state.gaLoaded = ''
  state.ymLoaded = ''
}
