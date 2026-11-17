// @vitest-environment nuxt
import { describe, it } from 'vitest'

// app/composables/useLeadForm.ts — ТЗ → «Форма»; «Компоненты» → Input (логика состояний, Р51).
describe('useLeadForm', () => {
  it.todo('пустое после обрезки обязательное поле при отправке — Error «Заполните это поле» (Р49)')
  it.todo('RU: неотмеченное обязательное согласие — Checkbox в Error; EN: чекбоксов нет')
  it.todo('Error поля снимается с первым введённым символом, чекбокса — при отметке (Р51)')
  it.todo('повторная проверка только при следующей отправке')
  it.todo('отправляет name, contact, message, consent, newsletter, locale, page, website')
  it.todo('во время отправки поля Disabled, повторная отправка невозможна')
  it.todo('200 — успех, форма заменяется текстом; 422 / 429 / 502 / сеть — ошибка, данные сохраняются')
  it.todo('после успеха — generate_lead (GA4) и reachGoal("lead") только при согласии (Р22)')
})
