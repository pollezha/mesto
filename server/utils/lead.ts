import nodemailer from 'nodemailer'
import { serverEnv } from './env'

// Логика /api/lead: «Инфраструктура» → «Обработчик формы /api/lead»; Р18, Р35, Р37, Р42, Р54, Р64.
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

// Лимит по IP — в памяти процесса: IP живёт только в течение окна, в лог и на диск не попадает.
// На каждом запросе из Map удаляются записи, у которых не осталось меток в окне.
const hits = new Map<string, number[]>()

export function resetRateLimit() {
  hits.clear()
}

export function rateLimitSize() {
  return hits.size
}

// true — запрос принят в счёт лимита; false — лимит исчерпан (отклонённые запросы окно не продлевают).
export function takeRateLimit(ip: string, now = Date.now()): boolean {
  for (const [key, list] of hits) {
    if (list.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(key)
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
  if (b.locale === 'ru' && !consent) return null
  return {
    name: b.name,
    contact: b.contact,
    message,
    consent,
    newsletter: flag(b.newsletter),
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
  if (!takeRateLimit(ip)) return { status: 429 }
  if (!isJson) return { status: 415 }

  const trap =
    body && typeof body === 'object' ? (body as Record<string, unknown>).website : undefined
  if (trap !== undefined && trap !== null && trap !== '' && String(trap).trim() !== '') {
    return { status: 200 } // ловушка: бот получает «успех», ничего не уходит
  }

  const lead = validateLead(body)
  if (!lead) return { status: 422 }

  const text = formatLead(lead)
  // TODO(question): new Н70 — заявки только на почту: 200, если письмо ушло; 502, если не ушло или SMTP не настроен
  try {
    await sendMail(lead, text)
  } catch {
    console.error('[lead] smtp failed')
    return { status: 502 }
  }
  return { status: 200 }
}
