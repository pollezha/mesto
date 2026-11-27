import { describe, expect, it } from 'vitest'
import { baseCompile } from '@intlify/message-compiler'
import { createI18n } from 'vue-i18n'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Читаем файлы напрямую: через import плагин i18n в Vitest precompile'ит JSON в AST.
const read = (l: string) =>
  JSON.parse(readFileSync(resolve(__dirname, '../../locales', l + '.json'), 'utf8'))
const ru = read('ru')
const en = read('en')

// createI18n мутирует сообщения (precompile), поэтому каждый раз — свежая копия.
const makeMessages = () =>
  structuredClone({ ru, en }) as unknown as Record<'ru' | 'en', Record<string, string>>

// Словари: «Контент», ТЗ → «Общие правила» п. 6 (неразрывные пробелы), Р52, Р39.
const NBSP = String.fromCharCode(0xa0)
// Ключи, которых в EN нет намеренно («Контент»: «—»).
const RU_ONLY = ['form.newsletter', 'form.newsletterLinks.newsletter', 'footer.newsletter']

type Tree = string | Tree[] | { [k: string]: Tree }

function flatten(node: Tree, path: string[] = [], out: Record<string, string> = {}) {
  if (typeof node === 'string') out[path.join('.')] = node
  else if (Array.isArray(node)) node.forEach((x, i) => flatten(x, [...path, String(i)], out))
  else for (const [k, v] of Object.entries(node)) flatten(v, [...path, k], out)
  return out
}

const flatRu = flatten(ru as Tree)
const flatEn = flatten(en as Tree)

// Список ТЗ («Общие правила» п. 6) + трёхбуквенные предлоги («для» и др.) — решение владельца от 22.11.2026 (висячих предлогов нет).
const WORD_BEFORE =
  /(?<![\p{L}\p{N}_@'’-])(в|во|к|ко|с|со|о|об|у|и|а|но|на|по|за|из|от|до|не|ни|для|без|под|над|при|про)$/iu
const SHORT_WORDS =
  /(?<![\p{L}\p{N}_@'’-])(в|во|к|ко|с|со|о|об|у|и|а|но|на|по|за|из|от|до|не|ни|для|без|под|над|при|про) (?=\S)/iu

describe('locales', () => {
  it('наборы ключей RU и EN совпадают, кроме RU-только', () => {
    const ruKeys = Object.keys(flatRu).filter((k) => !RU_ONLY.includes(k))
    expect(ruKeys.sort()).toEqual(Object.keys(flatEn).sort())
    for (const k of RU_ONLY) {
      expect(Object.keys(flatRu)).toContain(k)
      expect(Object.keys(flatEn)).not.toContain(k)
    }
  })

  it('каждое сообщение компилируется без ошибок', () => {
    for (const [lang, flat] of [
      ['ru', flatRu],
      ['en', flatEn],
    ] as const) {
      for (const [key, msg] of Object.entries(flat)) {
        const errors: unknown[] = []
        baseCompile(msg, { onError: (e: unknown) => errors.push(e) })
        expect(errors, `${lang}:${key}`).toEqual([])
      }
    }
  })

  it('почта выводится буквально в email и form.error', () => {
    for (const locale of ['ru', 'en'] as const) {
      const i18n = createI18n({ legacy: false, locale, messages: makeMessages() })
      const t = i18n.global.t as (k: string) => string
      expect(t('email')).toBe('hello@mesto.studio')
      expect(t('form.error')).toContain('hello@mesto.studio')
    }
  })

  it('в EN нет U+00A0; в RU он стоит только после слов из списка ТЗ, обычного пробела после них нет', () => {
    for (const [key, msg] of Object.entries(flatEn)) expect(msg.includes(NBSP), key).toBe(false)
    for (const [key, msg] of Object.entries(flatRu)) {
      expect(SHORT_WORDS.test(msg), key).toBe(false)
      // каждый U+00A0 — только сразу после слова из списка ТЗ
      for (const m of msg.matchAll(new RegExp(NBSP, 'g'))) {
        expect(WORD_BEFORE.test(msg.slice(0, m.index)), `${key} @${m.index}`).toBe(true)
      }
    }
    expect(Object.values(flatRu).some((m) => m.includes(NBSP))).toBe(true)
  })

  it('cta.lead = main + пробел + muted совпадает с «Контентом»', () => {
    expect(`${ru.cta.lead.main} ${ru.cta.lead.muted}`).toBe(
      'Чтобы предложить проект или обсудить сотрудничество, заполните форму:',
    )
    expect(`${en.cta.lead.main} ${en.cta.lead.muted}`).toBe(
      'To propose a project or discuss a collaboration, fill out the form:',
    )
  })

  it('тексты со ссылками собираются в строки «Контента»', () => {
    const tFor = (locale: 'ru' | 'en') =>
      createI18n({ legacy: false, locale, messages: makeMessages() }).global.t as (
        k: string,
        p?: Record<string, string>,
      ) => string
    const tRu = tFor('ru')
    const tEn = tFor('en')

    expect(tRu('form.consent', ru.form.consentLinks)).toBe(
      `Я ознакомлен с${NBSP}политикой обработки персональных данных и${NBSP}даю согласие на${NBSP}их обработку`,
    )
    expect(tEn('form.consent', en.form.consentLinks)).toBe(
      'I have read the Privacy Policy and give my consent to the processing of my personal data',
    )
    expect(tRu('form.newsletter', ru.form.newsletterLinks)).toBe(
      `Я хочу подписаться на${NBSP}новости и${NBSP}даю согласие на${NBSP}получение электронных рассылок`,
    )
    expect(tRu('cookie.text', ru.cookie.textLinks)).toBe(
      `Мы используем cookie для${NBSP}аналитики, чтобы сделать сайт удобнее. Подробнее — в${NBSP}Политике обработки персональных данных`,
    )
    expect(tEn('cookie.text', en.cookie.textLinks)).toBe(
      'We use cookies for analytics to improve the website. Learn more in our Privacy Policy',
    )
  })

  it('перебивка собирается с каждым словом', () => {
    const tRu = createI18n({ legacy: false, locale: 'ru', messages: makeMessages() }).global.t as (
      k: string,
      p: Record<string, string>,
    ) => string
    const tEn = createI18n({ legacy: false, locale: 'en', messages: makeMessages() }).global.t as (
      k: string,
      p: Record<string, string>,
    ) => string
    expect(ru.home.tagline.words).toEqual(['запуститься', 'найти клиентов', 'масштабироваться'])
    expect(en.home.tagline.words).toEqual(['launch', 'find clients', 'scale'])
    for (const word of ru.home.tagline.words) {
      expect(tRu('home.tagline.template', { word })).toBe(
        `Помогаем бизнесу ${word} через бренд и${NBSP}цифровой продукт`,
      )
    }
    for (const word of en.home.tagline.words) {
      expect(tEn('home.tagline.template', { word })).toBe(
        `We help businesses ${word} through branding and digital products`,
      )
    }
  })
})
