import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendMail = vi.fn()
const createTransport = vi.fn(() => ({ sendMail }))
vi.mock('nodemailer', () => ({ default: { createTransport } }))

const {
  processLead,
  resetRateLimit,
  takeRateLimit,
  takeSendSlot,
  rateLimitSize,
  rateLimitKey,
  isInternalIp,
  formatLead,
  validateLead,
  RATE_LIMIT,
  SEND_CAP,
} = await import('../../server/utils/lead')

// server/api/lead.post.ts — «Инфраструктура» → «Обработчик формы /api/lead»; ТЗ → «Форма».
const ENV = {
  SMTP_HOST: 'smtp.test',
  SMTP_PORT: '465',
  SMTP_USER: 'u',
  SMTP_PASS: 'p',
  SMTP_SECURE: 'true',
  MAIL_FROM: 'site@mesto.test',
  MAIL_TO: 'hello@mesto.test',
}

const valid = {
  name: 'Анна <b>Иванова</b>',
  contact: 'anna@example.com',
  message: 'Нужен ребрендинг & сайт',
  consent: true,
  newsletter: true,
  locale: 'ru',
  page: '/services',
  website: '',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fetchMock: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let errSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let logSpy: any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let warnSpy: any

function setEnv(env: Record<string, string>) {
  for (const k of Object.keys(ENV)) Reflect.deleteProperty(process.env, k)
  Object.assign(process.env, env)
}

beforeEach(() => {
  resetRateLimit()
  setEnv(ENV)
  // страховка Н70: наружу через fetch ничего не уходит (заявки только по почте)
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  sendMail.mockReset().mockResolvedValue({})
  createTransport.mockClear()
  errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  setEnv({})
})

const mailArg = (i: number) => sendMail.mock.calls[i]![0] as Record<string, unknown>
const send = (body: unknown, ip = '1.1.1.1') => processLead(body, ip)
const mailText = (call = 0) => mailArg(call).text as string

describe('POST /api/lead', () => {
  describe('проверка полей (422)', () => {
    it('200 для валидной заявки', async () => {
      expect(await send(valid)).toEqual({ status: 200 })
    })

    it.each([
      ['name пустой', { name: '' }],
      ['name из пробелов', { name: '   ' }],
      ['contact пустой', { contact: '' }],
      ['contact из пробелов', { contact: ' \n ' }],
      ['name не строка', { name: 5 }],
      ['contact отсутствует', { contact: undefined }],
      ['message не строка', { message: 1 }],
      ['locale неизвестная', { locale: 'de' }],
    ])('422: %s', async (_t, patch) => {
      expect(await send({ ...valid, ...patch })).toEqual({ status: 422 })
      expect(sendMail).not.toHaveBeenCalled()
    })

    it('422, если тело не объект', async () => {
      expect(await send(undefined)).toEqual({ status: 422 })
      expect(await send('x')).toEqual({ status: 422 })
    })

    it('длины (Р64): 100 / 100 / 2000 проходят, на единицу больше — 422', async () => {
      const ok = {
        ...valid,
        name: 'a'.repeat(100),
        contact: 'b'.repeat(100),
        message: 'c'.repeat(2000),
      }
      expect(await send(ok)).toEqual({ status: 200 })
      expect(await send({ ...valid, name: 'a'.repeat(101) })).toEqual({ status: 422 })
      expect(await send({ ...valid, contact: 'b'.repeat(101) })).toEqual({ status: 422 })
      expect(await send({ ...valid, message: 'c'.repeat(2001) })).toEqual({ status: 422 })
    })

    it('message необязателен', async () => {
      expect(await send({ ...valid, message: undefined })).toEqual({ status: 200 })
    })

    it('422 для locale=ru без consent=true', async () => {
      expect(await send({ ...valid, consent: false })).toEqual({ status: 422 })
      expect(await send({ ...valid, consent: undefined })).toEqual({ status: 422 })
    })

    // Н80 — владелец 27.11.2026: согласие обязательно и на EN
    it('EN: без consent=true — 422, с consent=true — 200', async () => {
      expect(await send({ ...valid, locale: 'en', consent: false })).toEqual({ status: 422 })
      expect(await send({ ...valid, locale: 'en', consent: undefined })).toEqual({ status: 422 })
      expect(await send({ ...valid, locale: 'en' })).toEqual({ status: 200 })
    })

    it('EN: newsletter=true игнорируется (false)', () => {
      expect(validateLead({ ...valid, locale: 'en', newsletter: true })?.newsletter).toBe(false)
    })

    it("строки 'true' / 'on' в consent — 422 (только boolean)", async () => {
      expect(await send({ ...valid, consent: 'true' })).toEqual({ status: 422 })
      expect(await send({ ...valid, consent: 'on' })).toEqual({ status: 422 })
    })

    it('не JSON (urlencoded, text/plain) — 415 без отправки, запрос считается в лимит', async () => {
      expect(await processLead(valid, '7.7.7.7', false)).toEqual({ status: 415 })
      expect(sendMail).not.toHaveBeenCalled()
      expect(fetchMock).not.toHaveBeenCalled()
      for (let i = 0; i < 9; i++) await processLead(valid, '7.7.7.7', false)
      expect(await processLead(valid, '7.7.7.7', false)).toEqual({ status: 429 })
    })

    it('формат контакта не проверяется (Р34)', async () => {
      expect(await send({ ...valid, contact: '@anna' })).toEqual({ status: 200 })
    })
  })

  describe('ловушка website', () => {
    it('заполненная ловушка — 200 без отправки', async () => {
      expect(await send({ ...valid, website: 'http://spam' })).toEqual({ status: 200 })
      expect(fetchMock).not.toHaveBeenCalled()
      expect(sendMail).not.toHaveBeenCalled()
    })

    it('ловушка срабатывает и при невалидных полях', async () => {
      expect(await send({ name: '', website: 'x' })).toEqual({ status: 200 })
      expect(fetchMock).not.toHaveBeenCalled()
      expect(sendMail).not.toHaveBeenCalled()
    })
  })

  describe('лимит 10 запросов / 10 минут по IP (Р37)', () => {
    it('11-й запрос — 429, другой IP не затронут', async () => {
      for (let i = 0; i < 10; i++) expect(await send(valid, '2.2.2.2')).toEqual({ status: 200 })
      expect(await send(valid, '2.2.2.2')).toEqual({ status: 429 })
      expect(await send(valid, '3.3.3.3')).toEqual({ status: 200 })
    })

    it('считаются и 422, и ловушка', async () => {
      for (let i = 0; i < 5; i++) await send({ ...valid, name: '' }, '4.4.4.4')
      for (let i = 0; i < 5; i++) await send({ ...valid, website: 'x' }, '4.4.4.4')
      expect(await send(valid, '4.4.4.4')).toEqual({ status: 429 })
    })

    it('429 отдаётся и ловушке, и невалидному запросу', async () => {
      for (let i = 0; i < 10; i++) await send(valid, '5.5.5.5')
      expect(await send({ website: 'x' }, '5.5.5.5')).toEqual({ status: 429 })
      expect(await send({}, '5.5.5.5')).toEqual({ status: 429 })
    })

    it('устаревшие IP удаляются из памяти, но не чаще раза в минуту (Н73)', () => {
      const t0 = 5_000_000
      takeRateLimit('8.8.8.8', t0)
      expect(rateLimitSize()).toBe(1)
      takeRateLimit('8.8.4.4', t0 + RATE_LIMIT.windowMs + 1)
      expect(rateLimitSize()).toBe(1) // остался только новый IP
    })

    it('очистка идёт раз в минуту: между проходами устаревшая запись ещё лежит (Н73)', () => {
      const s0 = 9_000_000
      takeRateLimit('8.8.8.8', s0)
      takeRateLimit('8.8.4.4', s0 + RATE_LIMIT.windowMs - 30_000) // проход: 8.8.8.8 ещё жив
      expect(rateLimitSize()).toBe(2)
      takeRateLimit('1.0.0.1', s0 + RATE_LIMIT.windowMs + 10_000) // < минуты с прохода
      expect(rateLimitSize()).toBe(3) // 8.8.8.8 устарел, но очистки ещё не было
      takeRateLimit('1.0.0.2', s0 + RATE_LIMIT.windowMs + 40_000) // > минуты — проход
      expect(rateLimitSize()).toBe(3) // 8.8.8.8 удалён, 1.0.0.2 добавлен
    })

    it('Map не растёт бесконечно: при потоке разных IP остаётся только окно', () => {
      const t0 = 20_000_000
      for (let i = 0; i < 500; i++) takeRateLimit(`11.0.${i >> 8}.${i & 255}`, t0 + i * 1000)
      // 500 с потока < окна 600 с: всё живо
      expect(rateLimitSize()).toBe(500)
      for (let i = 0; i < 500; i++) {
        takeRateLimit(`12.0.${i >> 8}.${i & 255}`, t0 + 2_000_000 + i * 1000)
      }
      expect(rateLimitSize()).toBeLessThanOrEqual(500 + 1)
    })

    it('IPv6: адреса одной /64 делят лимит, разные /64 — нет (Н73)', () => {
      const t0 = 30_000_000
      for (let i = 0; i < RATE_LIMIT.max; i++) {
        expect(takeRateLimit(`2001:db8:1:2::${i + 1}`, t0 + i)).toBe(true)
      }
      expect(takeRateLimit('2001:db8:1:2:aaaa:bbbb:cccc:dddd', t0 + 100)).toBe(false)
      expect(takeRateLimit('2001:db8:1:3::1', t0 + 100)).toBe(true)
      expect(rateLimitSize()).toBe(2)
    })

    it('сокращённые и полные записи IPv6 дают один ключ', () => {
      expect(rateLimitKey('2001:db8::1')).toBe(rateLimitKey('2001:0db8:0:0:0:0:0:2'))
      expect(rateLimitKey('2001:DB8::1')).toBe('2001:db8:0:0::/64')
      expect(rateLimitKey('::1')).toBe('0:0:0:0::/64')
      expect(rateLimitKey('2001:db8:0:1::')).not.toBe(rateLimitKey('2001:db8::'))
    })

    it('::ffff:a.b.c.d — как IPv4; IPv4 и нераспознанное — как есть', () => {
      expect(rateLimitKey('::ffff:1.2.3.4')).toBe('1.2.3.4')
      expect(rateLimitKey('::FFFF:0102:0304')).toBe('1.2.3.4')
      expect(rateLimitKey('1.2.3.4')).toBe('1.2.3.4')
      expect(rateLimitKey('not-an-ip')).toBe('not-an-ip')
      expect(rateLimitKey('unknown')).toBe('unknown')
      const t0 = 40_000_000
      for (let i = 0; i < RATE_LIMIT.max; i++) takeRateLimit('1.2.3.4', t0 + i)
      expect(takeRateLimit('::ffff:1.2.3.4', t0 + 100)).toBe(false)
    })

    it('окно истекает через 10 минут', () => {
      const t0 = 1_000_000
      for (let i = 0; i < RATE_LIMIT.max; i++) expect(takeRateLimit('6.6.6.6', t0 + i)).toBe(true)
      expect(takeRateLimit('6.6.6.6', t0 + 1000)).toBe(false)
      expect(takeRateLimit('6.6.6.6', t0 + RATE_LIMIT.windowMs - 1)).toBe(false)
      expect(takeRateLimit('6.6.6.6', t0 + RATE_LIMIT.windowMs + RATE_LIMIT.max)).toBe(true)
    })
  })

  describe('общий потолок отправки 60 в час (Н73)', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('61-я отправка — 429 без письма; через час снова 200', async () => {
      vi.useFakeTimers({ toFake: ['Date'] })
      vi.setSystemTime(new Date('2026-11-26T10:00:00Z'))
      for (let i = 0; i < SEND_CAP.max; i++) {
        expect(await send(valid, `20.0.${i >> 8}.${i & 255}`)).toEqual({ status: 200 })
      }
      expect(sendMail).toHaveBeenCalledTimes(SEND_CAP.max)
      expect(await send(valid, '21.0.0.1')).toEqual({ status: 429 })
      expect(sendMail).toHaveBeenCalledTimes(SEND_CAP.max)
      vi.setSystemTime(new Date('2026-11-26T11:00:01Z'))
      expect(await send(valid, '21.0.0.2')).toEqual({ status: 200 })
      expect(sendMail).toHaveBeenCalledTimes(SEND_CAP.max + 1)
    })

    it('ловушка и 422 потолок не расходуют', async () => {
      for (let i = 0; i < SEND_CAP.max; i++) {
        await send({ ...valid, website: 'x' }, `22.0.0.${i}`)
        await send({ ...valid, name: '' }, `23.0.0.${i}`)
      }
      expect(await send(valid, '24.0.0.1')).toEqual({ status: 200 })
    })

    it('takeSendSlot: скользящее окно с подставным временем', () => {
      const t0 = 50_000_000
      for (let i = 0; i < SEND_CAP.max; i++) expect(takeSendSlot(t0 + i)).toBe(true)
      expect(takeSendSlot(t0 + 1000)).toBe(false)
      expect(takeSendSlot(t0 + SEND_CAP.windowMs)).toBe(true) // первая метка вышла из окна
    })
  })

  describe('внутренний IP клиента (Н74)', () => {
    const MSG = '[lead] client ip is internal — check proxy / X-Real-IP (Н74)'

    it.each([
      '10.1.2.3',
      '172.16.0.1',
      '172.31.255.1',
      '192.168.1.1',
      '127.0.0.1',
      '169.254.1.1',
      '::1',
      'fc00::1',
      'fd12:3456::1',
      'fe80::1',
      'febf::1',
      'unknown',
      '::ffff:10.0.0.1',
    ])('%s — внутренний', (ip) => {
      expect(isInternalIp(ip)).toBe(true)
    })

    it.each(['8.8.8.8', '172.15.0.1', '172.32.0.1', '192.169.0.1', '2001:db8::1', 'fec0::1'])(
      '%s — не внутренний',
      (ip) => {
        expect(isInternalIp(ip)).toBe(false)
      },
    )

    it('предупреждение один раз, без IP и данных формы; ответ не меняется', async () => {
      expect(await send(valid, '172.18.0.2')).toEqual({ status: 200 })
      expect(await send(valid, '10.0.0.5')).toEqual({ status: 200 })
      expect(await send(valid, 'unknown')).toEqual({ status: 200 })
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy).toHaveBeenCalledWith(MSG)
      const logged = JSON.stringify(warnSpy.mock.calls)
      for (const secret of ['172.18.0.2', '10.0.0.5', 'Анна', 'anna@example.com', 'ребрендинг']) {
        expect(logged).not.toContain(secret)
      }
    })

    it('публичный IP — без предупреждения', async () => {
      await send(valid, '8.8.8.8')
      expect(warnSpy).not.toHaveBeenCalled()
    })
  })

  describe('отправка только по почте (Н70)', () => {
    it('SMTP ок — 200, письмо одно, наружу по fetch ничего не уходит', async () => {
      expect(await send(valid)).toEqual({ status: 200 })
      expect(sendMail).toHaveBeenCalledTimes(1)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('SMTP падает — 502', async () => {
      sendMail.mockRejectedValue(new Error('smtp down'))
      expect(await send(valid)).toEqual({ status: 502 })
    })

    it('SMTP не настроен — 502, без падения и без обращений наружу', async () => {
      setEnv({})
      expect(await send(valid)).toEqual({ status: 502 })
      expect(fetchMock).not.toHaveBeenCalled()
      expect(sendMail).not.toHaveBeenCalled()
    })

    it('SMTP-таймауты и secure заданы', async () => {
      await send(valid)
      expect(createTransport).toHaveBeenCalledWith(
        expect.objectContaining({
          secure: true,
          connectionTimeout: expect.any(Number),
          socketTimeout: expect.any(Number),
        }),
      )
    })
  })

  describe('формат сообщения (Р54)', () => {
    it('RU: строки по «Инфраструктуре», простой текст, без экранирования', async () => {
      await send(valid)
      expect(mailArg(0).text).toBe(
        [
          'Новая заявка с mesto.studio',
          'Имя: Анна <b>Иванова</b>',
          'Контакт: anna@example.com',
          'Сообщение: Нужен ребрендинг & сайт',
          'Рассылка: да',
          'Язык: RU',
          'Страница: /services',
        ].join('\n'),
      )
    })

    it('письмо: простой текст, тема, получатель', async () => {
      await send(valid)
      const mail = mailArg(0)
      expect(typeof mail.text).toBe('string')
      expect(mail.html).toBeUndefined()
      expect(mail.subject).toBe('Заявка с сайта mesto.studio')
      expect(mail.to).toBe('hello@mesto.test')
      expect(mail.from).toBe('site@mesto.test')
    })

    it('пустое сообщение — «—»; «Рассылка: нет» для RU без подписки', async () => {
      await send({ ...valid, message: '  ', newsletter: false })
      expect(mailText()).toContain('Сообщение: —')
      expect(mailText()).toContain('Рассылка: нет')
    })

    it('EN: без строки «Рассылка», «Язык: EN»', async () => {
      await send({ ...valid, locale: 'en', page: '/en/services' })
      expect(mailText()).not.toContain('Рассылка')
      expect(mailText()).toContain('Язык: EN')
      expect(mailText().endsWith('Страница: /en/services')).toBe(true)
    })

    it('описание в 2000 символов целиком попадает в письмо', async () => {
      const message = 'я'.repeat(2000)
      await send({ ...valid, message })
      expect(mailText()).toContain(`Сообщение: ${message}`)
    })

    it('page не путь — «—»', async () => {
      await send({ ...valid, page: 'http://evil' })
      expect(mailText().endsWith('Страница: —')).toBe(true)
    })

    it('formatLead не меняет пользовательский текст', () => {
      const text = formatLead({
        name: '<script>&amp;',
        contact: 'x',
        message: '',
        consent: false,
        newsletter: false,
        locale: 'en',
        page: '/',
      })
      expect(text).toContain('Имя: <script>&amp;')
    })

    it('Reply-To, если contact похож на почту; иначе нет', async () => {
      await send(valid)
      expect(mailArg(0).replyTo).toBe('anna@example.com')
      await send({ ...valid, contact: '@anna_tg' })
      expect(mailArg(1).replyTo).toBeUndefined()
      await send({ ...valid, contact: 'a@b.c\r\nBcc: x@y.z' })
      expect(mailArg(2).replyTo).toBeUndefined()
    })
  })

  describe('персональные данные', () => {
    it('ошибки логируются без ПДн и IP', async () => {
      sendMail.mockRejectedValue(new Error('rejected anna@example.com'))
      await send(valid, '9.9.9.9')
      const logged = JSON.stringify([
        ...errSpy.mock.calls,
        ...logSpy.mock.calls,
        ...warnSpy.mock.calls,
      ])
      expect(errSpy).toHaveBeenCalled()
      for (const secret of ['Анна', 'anna@example.com', 'ребрендинг', '9.9.9.9']) {
        expect(logged).not.toContain(secret)
      }
    })

    it('успешная заявка и 422 ничего не пишут в лог', async () => {
      await send(valid)
      await send({ ...valid, name: '' })
      expect(errSpy).not.toHaveBeenCalled()
      expect(logSpy).not.toHaveBeenCalled()
    })
  })
})
