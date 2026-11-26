// @vitest-environment nuxt
import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { clearNuxtState } from '#app'

import { CONSENT_MAX_AGE, useConsent } from '~/composables/useConsent'
import { __resetAnalytics } from '~/utils/analytics'

// app/composables/useConsent.ts — «Инфраструктура» → «Аналитика»; ТЗ → «Аналитика».
const scripts = () =>
  [...document.querySelectorAll('script[src]')].map((s) => s.getAttribute('src') as string)

function configure(p: { enabled: boolean; gaId?: string; ymId?: string }) {
  const pub = useRuntimeConfig().public as Record<string, unknown>
  pub.analyticsEnabled = p.enabled
  pub.gaId = p.gaId ?? ''
  pub.ymId = p.ymId ?? ''
}

// Удаление по стандарту: max-age=0 и expires в прошлом, тот же path. happy-dom понимает только expires
// (max-age=0 оставляет пустую запись «name=»), браузеры — оба.
function clearCookies() {
  for (const c of document.cookie.split(';')) {
    const name = c.split('=')[0]!.trim()
    if (name) document.cookie = `${name}=; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

describe('useConsent', () => {
  it('cookie ставится с max-age 12 месяцев и SameSite=Lax', async () => {
    let proto: object | null = document
    let desc: PropertyDescriptor | undefined
    while (proto && !desc) {
      desc = Object.getOwnPropertyDescriptor(proto, 'cookie')
      proto = Object.getPrototypeOf(proto)
    }
    if (!desc) throw new Error('document.cookie descriptor not found')
    const d = desc
    const writes: string[] = []
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => d.get!.call(document),
      set: (v: string) => {
        writes.push(v)
        d.set!.call(document, v)
      },
    })
    try {
      useConsent().accept()
      await nextTick()
    } finally {
      delete (document as unknown as Record<string, unknown>).cookie
    }
    const w = writes.find((v) => v.startsWith('mesto_consent=accepted'))
    expect(w).toBeDefined()
    expect(w).toMatch(/max-age=31536000/i)
    expect(w).toMatch(/samesite=lax/i)
  })

  beforeEach(() => {
    clearCookies()
    clearNuxtState()
    __resetAnalytics()
    document.head.querySelectorAll('script[src]').forEach((s) => s.remove())
    configure({ enabled: true, gaId: 'G-TEST', ymId: '12345' })
    useState('consent-ready').value = true
  })

  it('без выбора баннер показан; выбор хранится в cookie mesto_consent на 12 месяцев (Р58)', async () => {
    const c = useConsent()
    expect(c.enabled.value).toBe(true)
    expect(c.choice.value).toBeNull()
    expect(c.bannerOpen.value).toBe(true)

    c.decline()
    await nextTick()
    expect(document.cookie).toContain('mesto_consent=declined')
    expect(c.choice.value).toBe('declined')
    expect(c.bannerOpen.value).toBe(false)

    c.accept()
    await nextTick()
    expect(document.cookie).toContain('mesto_consent=accepted')
    expect(CONSENT_MAX_AGE).toBe(60 * 60 * 24 * 365)
    expect(useCookie('mesto_consent').value).toBe('accepted')
  })

  it('баннер не показывается до монтирования клиента (пререндер без выбора, без мигания)', () => {
    useState('consent-ready').value = false
    expect(useConsent().bannerOpen.value).toBe(false)
  })

  it('reopen снова открывает баннер, выбор закрывает', () => {
    const c = useConsent()
    c.accept()
    expect(c.bannerOpen.value).toBe(false)
    c.reopen()
    expect(c.bannerOpen.value).toBe(true)
    c.decline()
    expect(c.bannerOpen.value).toBe(false)
  })

  it('до согласия скрипты GA4 и Метрики не загружаются', () => {
    const c = useConsent()
    expect(scripts()).toEqual([])
    c.decline()
    expect(scripts()).toEqual([])
  })

  it('после согласия грузится только счётчик с заданным ID, один раз', () => {
    configure({ enabled: true, gaId: 'G-TEST' })
    const c = useConsent()
    c.accept()
    c.accept()
    expect(scripts()).toEqual(['https://www.googletagmanager.com/gtag/js?id=G-TEST'])
  })

  it('оба ID — оба скрипта; только Метрика — только tag.js', () => {
    useConsent().accept()
    expect(scripts().sort()).toEqual([
      'https://mc.yandex.ru/metrika/tag.js',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST',
    ])
    document.head.querySelectorAll('script[src]').forEach((s) => s.remove())
    __resetAnalytics()
    configure({ enabled: true, ymId: '12345' })
    useConsent().accept()
    expect(scripts()).toEqual(['https://mc.yandex.ru/metrika/tag.js'])
  })

  it('смена согласия на отказ отключает счётчики и удаляет их cookie (Р59)', async () => {
    const c = useConsent()
    c.accept()
    document.cookie = '_ga=1; path=/'
    document.cookie = '_ga_ABC=1; path=/'
    document.cookie = '_ym_uid=1; path=/'
    document.cookie = 'other=1; path=/'
    c.decline()
    await nextTick()
    const w = window as unknown as Record<string, unknown>
    expect(w['ga-disable-G-TEST']).toBe(true)
    expect(w.disableYaCounter12345).toBe(true)
    // happy-dom оставляет удалённые cookie пустыми записями — проверяем, что значений нет
    expect(document.cookie).not.toMatch(/(_ga|_ym)\w*=[^;]/)
    expect(document.cookie).toContain('other=1')
    expect(document.cookie).toContain('mesto_consent=declined')
  })

  it('при analyticsEnabled=false — нет баннера, счётчиков и cookie', () => {
    configure({ enabled: false, gaId: 'G-TEST', ymId: '12345' })
    const c = useConsent()
    expect(c.enabled.value).toBe(false)
    expect(c.bannerOpen.value).toBe(false)
    c.accept()
    c.reopen()
    expect(c.bannerOpen.value).toBe(false)
    expect(scripts()).toEqual([])
    expect(document.cookie).not.toContain('mesto_consent')
  })

  it('без ID — enabled=false, баннера нет, ничего не грузится', () => {
    configure({ enabled: true })
    const c = useConsent()
    expect(c.enabled.value).toBe(false)
    expect(c.bannerOpen.value).toBe(false)
    c.accept()
    expect(scripts()).toEqual([])
  })
})
