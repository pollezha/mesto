// @vitest-environment nuxt
import { describe, it } from 'vitest'

// app/composables/useConsent.ts — «Инфраструктура» → «Аналитика»; ТЗ → «Аналитика».
describe('useConsent', () => {
  it.todo('без выбора баннер показан; выбор хранится в cookie mesto_consent на 12 месяцев (Р58)')
  it.todo('до согласия скрипты GA4 и Метрики не загружаются')
  it.todo('после согласия грузится только счётчик с заданным ID')
  it.todo('смена согласия на отказ отключает счётчики и удаляет их cookie (Р59)')
  it.todo('при NUXT_PUBLIC_ANALYTICS_ENABLED=false или без ID — нет баннера, счётчиков и «Настроек cookie»')
})
