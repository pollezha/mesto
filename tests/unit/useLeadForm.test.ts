// @vitest-environment nuxt
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import { LEAD_LIMITS, useLeadForm } from '~/composables/useLeadForm'

const { goal, locale, route } = vi.hoisted(() => ({
  goal: vi.fn(),
  locale: { value: 'ru' },
  route: { path: '/' },
}))

vi.mock('~/utils/analytics', () => ({ reportLeadGoal: goal }))
mockNuxtImport('useI18n', () => () => ({ locale }))
mockNuxtImport('useRoute', () => () => route)

function fill(f: ReturnType<typeof useLeadForm>) {
  f.values.name = 'Анна'
  f.values.contact = '@anna'
  f.values.message = 'Привет'
  f.values.consent = true
}

describe('useLeadForm', () => {
  let fetchMock: ReturnType<typeof vi.fn>
  beforeEach(() => {
    locale.value = 'ru'
    route.path = '/'
    goal.mockClear()
    fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('$fetch', fetchMock)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('лимиты Р64', () => {
    expect(LEAD_LIMITS).toEqual({ name: 100, contact: 100, message: 2000 })
  })

  it('пустое после обрезки обязательное поле при отправке — Error (Р49)', async () => {
    const f = useLeadForm()
    f.values.name = '   '
    f.values.contact = ''
    f.values.consent = true
    await f.submit()
    expect(f.errors.name).toBe(true)
    expect(f.errors.contact).toBe(true)
    expect(f.errors.consent).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(f.status.value).toBe('idle')
  })

  it('формат контакта не проверяется (Р34)', async () => {
    const f = useLeadForm()
    fill(f)
    f.values.contact = 'что угодно'
    await f.submit()
    expect(f.errors.contact).toBe(false)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('неотмеченное согласие — ошибка и на RU, и на EN (Н80)', async () => {
    const f = useLeadForm()
    fill(f)
    f.values.consent = false
    await f.submit()
    expect(f.errors.consent).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()

    locale.value = 'en'
    const e = useLeadForm()
    fill(e)
    e.values.consent = false
    await e.submit()
    expect(e.errors.consent).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
    e.values.consent = true
    await e.submit()
    expect(e.errors.consent).toBe(false)
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0]?.[1].body).toMatchObject({ consent: true, newsletter: false })
  })

  it('clearError снимает ошибку поля и чекбокса (Р51)', async () => {
    const f = useLeadForm()
    await f.submit()
    expect(f.errors).toEqual({ name: true, contact: true, consent: true })
    f.clearError('name')
    f.clearError('consent')
    expect(f.errors).toEqual({ name: false, contact: true, consent: false })
  })

  it('повторная проверка только при следующей отправке', async () => {
    const f = useLeadForm()
    await f.submit()
    f.clearError('name')
    f.values.name = 'А'
    f.values.name = ''
    expect(f.errors.name).toBe(false)
    await f.submit()
    expect(f.errors.name).toBe(true)
  })

  it('отправляет все поля, locale, page, website', async () => {
    route.path = '/services'
    const f = useLeadForm()
    fill(f)
    f.values.newsletter = true
    await f.submit()
    expect(fetchMock).toHaveBeenCalledWith('/api/lead', {
      method: 'POST',
      body: {
        name: 'Анна',
        contact: '@anna',
        message: 'Привет',
        consent: true,
        newsletter: true,
        locale: 'ru',
        page: '/services',
        website: '',
      },
    })
  })

  it('значения с пробелами по краям уходят на сервер без обрезки (обрезка — только при проверке пустоты)', async () => {
    const f = useLeadForm()
    fill(f)
    f.values.name = '  Анна '
    f.values.contact = ' @anna  '
    f.values.message = '\n Привет \n'
    await f.submit()
    expect(fetchMock.mock.calls[0]?.[1].body).toMatchObject({
      name: '  Анна ',
      contact: ' @anna  ',
      message: '\n Привет \n',
    })
  })

  it('EN (Н80): consent уходит true после отметки, newsletter — false; locale и page из контекста', async () => {
    locale.value = 'en'
    route.path = '/en/services'
    const f = useLeadForm()
    fill(f)
    f.values.consent = true
    f.values.newsletter = true
    await f.submit()
    expect(fetchMock.mock.calls[0]?.[1].body).toMatchObject({
      consent: true,
      newsletter: false,
      locale: 'en',
      page: '/en/services',
    })
  })

  it('во время отправки повторный submit игнорируется', async () => {
    let resolve!: (v: unknown) => void
    fetchMock.mockReturnValue(new Promise((r) => (resolve = r)))
    const f = useLeadForm()
    fill(f)
    const p = f.submit()
    expect(f.status.value).toBe('sending')
    await f.submit()
    expect(fetchMock).toHaveBeenCalledOnce()
    resolve({})
    await p
  })

  it('200 — success и цель аналитики; повторно не отправляет', async () => {
    route.path = '/en/services'
    locale.value = 'en'
    const f = useLeadForm()
    fill(f)
    await f.submit()
    expect(f.status.value).toBe('success')
    expect(goal).toHaveBeenCalledWith({ locale: 'en', page: '/en/services' })
    await f.submit()
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it.each([422, 429, 502, 'network'])(
    'ответ %s — error, данные сохранены, повтор разрешён',
    async (code) => {
      fetchMock.mockRejectedValueOnce(
        code === 'network' ? new TypeError('fetch failed') : { statusCode: code },
      )
      const f = useLeadForm()
      fill(f)
      await f.submit()
      expect(f.status.value).toBe('error')
      expect(goal).not.toHaveBeenCalled()
      expect(f.values).toMatchObject({
        name: 'Анна',
        contact: '@anna',
        message: 'Привет',
        consent: true,
      })
      await f.submit()
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(f.status.value).toBe('success')
    },
  )

  // Цели GA4 и Метрики только при согласии (Р22) проверены в tests/unit/analytics.test.ts;
  // здесь reportLeadGoal замокан, вызов после 200 — в тесте выше.
})
