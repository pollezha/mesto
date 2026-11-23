import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { processLead } from '../utils/lead'

// Приём заявки: «Инфраструктура» → «Обработчик формы /api/lead»; ТЗ → «Форма» (Р18, Р35, Р37, Р54, Р64).
// Логика — в server/utils/lead.ts. Заявки нигде не сохраняются; в логах нет персональных данных.
// IP клиента — X-Real-IP от Nginx (порт приложения наружу не открыт).
// Принимается только JSON («Принимает JSON»): иначе 415, тело не разбирается. Это же закрывает
// cross-site отправку: JSON с другого сайта требует CORS preflight, а CORS-заголовков мы не отдаём.
// Нативный POST без JS не поддерживается — решение владельца от 23.11.2026 (Н45)
const statusText = {
  415: 'Unsupported Media Type',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  502: 'Bad Gateway',
} as const

export default defineEventHandler(async (event) => {
  const ip = getHeader(event, 'x-real-ip') ?? event.node.req.socket.remoteAddress ?? 'unknown'
  const type = (getHeader(event, 'content-type') ?? '').split(';')[0]!.trim().toLowerCase()
  const isJson = type === 'application/json'
  const body = isJson ? await readBody(event).catch(() => undefined) : undefined
  const result = await processLead(body, ip, isJson)
  if (result.status !== 200) {
    throw createError({ statusCode: result.status, statusMessage: statusText[result.status] })
  }
  return { ok: true }
})
