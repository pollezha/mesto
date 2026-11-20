import { disableCounters, loadCounters } from '~/utils/analytics'

// Модуль согласия на cookie: «Инфраструктура» → «Аналитика»; ТЗ → «Аналитика»; Р22, Р58, Р59.
export type ConsentChoice = 'accepted' | 'declined'

export const CONSENT_COOKIE = 'mesto_consent'
/** 12 месяцев (Р58), в секундах. */
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

function isChoice(v: unknown): v is ConsentChoice {
  return v === 'accepted' || v === 'declined'
}

export function useConsent() {
  const config = useRuntimeConfig()

  const cookie = useCookie<string | null>(CONSENT_COOKIE, {
    maxAge: CONSENT_MAX_AGE,
    sameSite: 'lax',
    path: '/',
    default: () => null,
  })
  // Пререндер не знает выбора посетителя: баннер не выводится, пока клиент не смонтирован (ready),
  // иначе у уже выбравших он мигал бы. ready ставит плагин consent.client.ts.
  const ready = useState('consent-ready', () => false)
  const reopened = useState('consent-reopened', () => false)

  const ids = () => ({
    gaId: String(config.public.gaId || '').trim(),
    ymId: String(config.public.ymId || '').trim(),
  })

  const enabled = computed(() => {
    const { gaId, ymId } = ids()
    return Boolean(config.public.analyticsEnabled) && Boolean(gaId || ymId)
  })

  const choice = computed<ConsentChoice | null>(() =>
    isChoice(cookie.value) ? cookie.value : null,
  )

  const bannerOpen = computed(
    () => enabled.value && ready.value && (choice.value === null || reopened.value),
  )

  function accept(): void {
    if (!enabled.value) return
    cookie.value = 'accepted'
    reopened.value = false
    if (import.meta.client) loadCounters(ids())
  }

  function decline(): void {
    if (!enabled.value) return
    cookie.value = 'declined'
    reopened.value = false
    if (import.meta.client) disableCounters(ids())
  }

  function reopen(): void {
    if (enabled.value) reopened.value = true
  }

  return {
    enabled,
    choice: readonly(choice),
    bannerOpen,
    accept,
    decline,
    reopen,
  }
}
