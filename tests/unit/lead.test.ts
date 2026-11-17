import { describe, it } from 'vitest'

// server/api/lead.post.ts — «Инфраструктура» → «Обработчик формы /api/lead»; ТЗ → «Форма».
describe('POST /api/lead', () => {
  it.todo('422, если name или contact пусты после обрезки пробелов')
  it.todo('422, если name или contact длиннее 100 символов, message длиннее 2000 (Р64)')
  it.todo('422 для locale=ru без consent=true')
  it.todo('заполненная ловушка website — 200 без отправки')
  it.todo('11-й запрос с одного X-Real-IP за 10 минут — 429; считаются и 422, и ловушка (Р37)')
  it.todo('Telegram и SMTP отправляются параллельно; 200, если ушло хотя бы в один канал (Р35)')
  it.todo('502, если не ушло ни в один канал')
  it.todo('формат сообщения: строки из «Инфраструктуры», «Рассылка» только для RU, без parse_mode (Р54)')
  it.todo('Reply-To, если contact похож на почту')
  it.todo('в логах нет персональных данных; заявка нигде не сохраняется')
})
