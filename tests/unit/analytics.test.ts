// @vitest-environment nuxt
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { __resetAnalytics, disableCounters, loadCounters, reportLeadGoal } from '~/utils/analytics'

// «Инфраструктура» → «Аналитика»: цель при 200 от /api/lead, только после согласия (Р22).
describe('reportLeadGoal', () => {
  const w = window as unknown as Record<string, unknown>
  beforeEach(() => {
    __resetAnalytics()
    delete w.gtag
    delete w.ym
    delete w.dataLayer
  })

  it('без согласия (счётчики не загружены) ничего не отправляет', () => {
    const gtag = vi.fn()
    const ym = vi.fn()
    w.gtag = gtag
    w.ym = ym
    reportLeadGoal({ locale: 'ru', page: '/' })
    expect(gtag).not.toHaveBeenCalled()
    expect(ym).not.toHaveBeenCalled()
  })

  it('после согласия: generate_lead с locale и page и reachGoal("lead")', () => {
    loadCounters({ gaId: 'G-TEST', ymId: '12345' })
    const gtag = vi.fn()
    const ym = vi.fn()
    w.gtag = gtag
    w.ym = ym
    reportLeadGoal({ locale: 'en', page: '/en/services' })
    expect(gtag).toHaveBeenCalledWith('event', 'generate_lead', {
      locale: 'en',
      page: '/en/services',
    })
    expect(ym).toHaveBeenCalledWith(12345, 'reachGoal', 'lead')
  })

  it('только счётчик с заданным ID', () => {
    loadCounters({ gaId: '', ymId: '12345' })
    const gtag = vi.fn()
    const ym = vi.fn()
    w.gtag = gtag
    w.ym = ym
    reportLeadGoal({ locale: 'ru', page: '/' })
    expect(gtag).not.toHaveBeenCalled()
    expect(ym).toHaveBeenCalledOnce()
  })

  it('после отказа цели не уходят', () => {
    loadCounters({ gaId: 'G-TEST', ymId: '12345' })
    disableCounters({ gaId: 'G-TEST', ymId: '12345' })
    const gtag = vi.fn()
    w.gtag = gtag
    reportLeadGoal({ locale: 'ru', page: '/' })
    expect(gtag).not.toHaveBeenCalled()
  })
})

// Повторное согласие после отказа: скрипты и init — один раз, только снимаются флаги отключения.
describe('loadCounters: accept → decline → accept', () => {
  const w = window as unknown as Record<string, unknown>
  const ids = { gaId: 'G-TEST', ymId: '12345' }
  const scripts = () => document.querySelectorAll('script[src]').length

  beforeEach(() => {
    __resetAnalytics()
    delete w.gtag
    delete w.ym
    delete w.dataLayer
    document.head.querySelectorAll('script[src]').forEach((s) => s.remove())
  })

  it('скрипты подключаются по одному разу, config/init не повторяются, флаги сняты', () => {
    loadCounters(ids)
    expect(scripts()).toBe(2)
    const dataLayerLength = (w.dataLayer as unknown[]).length
    const ymQueueLength = (w.ym as { a: unknown[] }).a.length

    disableCounters(ids)
    expect(w['ga-disable-G-TEST']).toBe(true)
    expect(w.disableYaCounter12345).toBe(true)

    loadCounters(ids)
    expect(scripts()).toBe(2)
    expect((w.dataLayer as unknown[]).length).toBe(dataLayerLength)
    expect((w.ym as { a: unknown[] }).a.length).toBe(ymQueueLength)
    expect(w['ga-disable-G-TEST']).toBe(false)
    expect(w.disableYaCounter12345).toBe(false)
  })
})
