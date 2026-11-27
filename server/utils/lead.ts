import nodemailer from 'nodemailer'
import { serverEnv } from './env'

// Логика /api/lead: «Инфраструктура» → «Обработчик формы /api/lead»; Р18, Р35, Р37, Р42, Р54, Р64.
// Н70 меняет Р18, Р35 и Р54: каналов больше нет, заявки уходят только на почту.
// Заявка нигде не сохраняется; в лог не попадают ни поля формы, ни IP, ни тексты ошибок.

export const LEAD_MAX = { name: 100, contact: 100, message: 2000 } as const
export const RATE_LIMIT = { max: 10, windowMs: 10 * 60 * 1000 } as const
const SEND_TIMEOUT_MS = 8000
const MAIL_SUBJECT = 'Заявка с сайта mesto.studio'

export interface LeadInput {
  name: string
  contact: string
  message: string
  consent: boolean
  newsletter: boolean
  locale: 'ru' | 'en'
  page: string
}

export type LeadResult = { status: 200 } | { status: 415 | 422 | 429 | 502 }

// Общий потолок отправки на весь процесс — решение владельца от 26.11.2026 (Н73)
export const SEND_CAP = { max: 60, windowMs: 60 * 60 * 1000 } as const
const SWEEP_INTERVAL_MS = 60 * 1000

type ParsedIp = { v4: number[] } | { v6: number[] }

function parseV4(s: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s)
  if (!m) return null
  const o = m.slice(1).map(Number)
  return o.every((n) => n <= 255) ? o : null
}

// IPv6 → 8 хекстетов (разворачивает `::` и хвост с точечной записью IPv4); IPv4-mapped → IPv4.
function parseIp(raw: string): ParsedIp | null {
  const s = raw.trim().toLowerCase().split('%')[0]!
  const v4 = parseV4(s)
  if (v4) return { v4 }
  if (!s.includes(':') || s.split('::').length > 2) return null
  const toGroups = (part: string): number[] | null => {
    if (part === '') return []
    const out: number[] = []
    const items = part.split(':')
    for (const [i, item] of items.entries()) {
      if (i === items.length - 1 && item.includes('.')) {
        const t = parseV4(item)
        if (!t) return null
        out.push(t[0]! * 256 + t[1]!, t[2]! * 256 + t[3]!)
      } else if (/^[0-9a-f]{1,4}$/.test(item)) out.push(parseInt(item, 16))
      else return null
    }
    return out
  }
  const [headStr, tailStr] = s.split('::') as [string, string | undefined]
  const head = toGroups(headStr)
  const tail = tailStr === undefined ? [] : toGroups(tailStr)
  if (!head || !tail) return null
  let groups: number[]
  if (tailStr === undefined) groups = head
  else {
    const fill = 8 - head.length - tail.length
    if (fill < 1) return null
    groups = [...head, ...Array<number>(fill).fill(0), ...tail]
  }
  if (groups.length !== 8) return null
  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
    const [a, b] = [groups[6]!, groups[7]!]
    return { v4: [a >> 8, a & 255, b >> 8, b & 255] }
  }
  return { v6: groups }
}

// Ключ лимита — решение владельца от 26.11.2026 (Н73): IPv4 как есть, IPv6 — подсеть /64,
// ::ffff:a.b.c.d — как IPv4, нераспознанная строка — как есть.
export function rateLimitKey(ip: string): string {
  const p = parseIp(ip)
  if (!p) return ip
  if ('v4' in p) return p.v4.join('.')
  return `${p.v6
    .slice(0, 4)
    .map((g) => g.toString(16))
    .join(':')}::/64`
}

// Внутренний адрес клиента — решение владельца от 26.11.2026 (Н74)
export function isInternalIp(ip: string): boolean {
  if (ip.trim().toLowerCase() === 'unknown') return true
  const p = parseIp(ip)
  if (!p) return false
  if ('v4' in p) {
    const [a, b] = p.v4 as [number, number]
    return (
      a === 10 ||
      a === 127 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254)
    )
  }
  const g = p.v6
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return true
  return (g[0]! & 0xfe00) === 0xfc00 || (g[0]! & 0xffc0) === 0xfe80
}

// Лимит по IP — в памяти процесса: IP живёт только в течение окна, в лог и на диск не попадает.
// Устаревшие записи из Map удаляются не чаще раза в минуту — Н73.
const hits = new Map<string, number[]>()
let lastSweep = 0
const sends: number[] = []
let internalWarned = false

// Сброс состояния для тестов (в том числе «один раз» из Н74).
export function resetRateLimit() {
  hits.clear()
  lastSweep = 0
  sends.length = 0
  internalWarned = false
}

export function rateLimitSize() {
  return hits.size
}

// true — отправка в пределах потолка (скользящий час); false — потолок исчерпан (Н73).
export function takeSendSlot(now = Date.now()): boolean {
  while (sends.length && now - sends[0]! >= SEND_CAP.windowMs) sends.shift()
  if (sends.length >= SEND_CAP.max) return false
  sends.push(now)
  return true
}

// true — запрос принят в счёт лимита; false — лимит исчерпан (отклонённые запросы окно не продлевают).
export function takeRateLimit(rawIp: string, now = Date.now()): boolean {
  const ip = rateLimitKey(rawIp)
  if (now - lastSweep >= SWEEP_INTERVAL_MS) {
    lastSweep = now
    for (const [key, list] of hits) {
      if (list.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key)
    }
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
  if (recent.length >= RATE_LIMIT.max) {
    hits.set(ip, recent)
    return false
  }
  recent.push(now)
  hits.set(ip, recent)
  return true
}

const isStr = (v: unknown): v is string => typeof v === 'string'

// null — данные не прошли проверку (422). Формат контакта не проверяется (Р34).
export function validateLead(body: unknown): LeadInput | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  if (!isStr(b.name) || !isStr(b.contact)) return null
  const message = b.message === undefined || b.message === null ? '' : b.message
  if (!isStr(message)) return null
  if (b.locale !== 'ru' && b.locale !== 'en') return null
  if (b.name.trim() === '' || b.name.length > LEAD_MAX.name) return null
  if (b.contact.trim() === '' || b.contact.length > LEAD_MAX.contact) return null
  if (message.length > LEAD_MAX.message) return null
  // Только JSON: булевы значения — только boolean true, строки не принимаются.
  const flag = (v: unknown) => v === true
  const consent = flag(b.consent)
  // Н80 — владелец 27.11.2026: согласие обязательно и на EN (без consent: true — 422).
  if (!consent) return null
  return {
    name: b.name,
    contact: b.contact,
    message,
    consent,
    // Рассылки на EN нет (ТЗ «Форма»): пришедший newsletter игнорируется
    newsletter: b.locale === 'ru' && flag(b.newsletter),
    locale: b.locale,
    page: isStr(b.page) && b.page.startsWith('/') ? b.page.slice(0, 200) : '—',
  }
}

// Р54: строки по «Инфраструктуре», простой текст, пользовательский текст как есть.
export function formatLead(lead: LeadInput): string {
  const lines = [
    'Новая заявка с mesto.studio',
    `Имя: ${lead.name}`,
    `Контакт: ${lead.contact}`,
    `Сообщение: ${lead.message.trim() === '' ? '—' : lead.message}`,
  ]
  if (lead.locale === 'ru') lines.push(`Рассылка: ${lead.newsletter ? 'да' : 'нет'}`)
  lines.push(`Язык: ${lead.locale.toUpperCase()}`, `Страница: ${lead.page}`)
  return lines.join('\n')
}

const EMAIL_RE = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/

async function sendMail(lead: LeadInput, text: string): Promise<void> {
  const env = serverEnv()
  if (!env.smtpHost || !env.mailFrom || !env.mailTo) throw new Error('not configured')
  const secure = env.smtpSecure === 'true' || env.smtpSecure === '1'
  // SMTP-клиент nodemailer — решение владельца от 23.11.2026 (Н44)
  const transport = nodemailer.createTransport({
    host: env.smtpHost,
    port: Number(env.smtpPort) || (secure ? 465 : 587),
    secure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
    connectionTimeout: SEND_TIMEOUT_MS,
    greetingTimeout: SEND_TIMEOUT_MS,
    socketTimeout: SEND_TIMEOUT_MS,
  })
  const contact = lead.contact.trim()
  await transport.sendMail({
    from: env.mailFrom,
    to: env.mailTo,
    subject: MAIL_SUBJECT,
    text,
    ...(EMAIL_RE.test(contact) ? { replyTo: contact } : {}),
  })
}

// Основной сценарий: лимит → ловушка → проверка → отправка. Порядок: считаются все запросы (Р37).
// Запрос не в JSON — 415; считается в лимит (до проверки типа), чтобы нельзя было перебирать бесплатно.
export async function processLead(body: unknown, ip: string, isJson = true): Promise<LeadResult> {
  // Н74: один раз за жизнь процесса, без IP и данных формы (Р18, Р42)
  if (!internalWarned && isInternalIp(ip)) {
    internalWarned = true
    console.warn('[lead] client ip is internal — check proxy / X-Real-IP (Н74)')
  }
  if (!takeRateLimit(ip)) return { status: 429 }
  if (!isJson) return { status: 415 }

  const trap =
    body && typeof body === 'object' ? (body as Record<string, unknown>).website : undefined
  if (trap !== undefined && trap !== null && trap !== '' && String(trap).trim() !== '') {
    return { status: 200 } // ловушка: бот получает «успех», ничего не уходит
  }

  const lead = validateLead(body)
  if (!lead) return { status: 422 }

  // Общий потолок отправки (Н73): сверх него письмо не уходит
  if (!takeSendSlot()) return { status: 429 }

  const text = formatLead(lead)
  // Заявки только на почту: 200, если письмо ушло; 502, если не ушло или SMTP не настроен — решение владельца от 26.11.2026 (Н70)
  try {
    await sendMail(lead, text)
  } catch {
    console.error('[lead] smtp failed')
    return { status: 502 }
  }
  return { status: 200 }
}
