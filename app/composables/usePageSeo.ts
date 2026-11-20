import { SITE_URL } from '~~/config/site'

// Общая SEO-основа страниц — ТЗ → «SEO», «Контент» (Р21, Р28, Р60, В3).
// title; description — только где положено (главная, «Услуги», «Контакты», кейс); canonical — абсолютный,
// без завершающего слэша; hreflang (ru, en, x-default → RU) — только у страниц с парой RU/EN;
// noindex — у 404; Open Graph — заголовок и описание как у страницы, без картинки (В3).
// <html lang> ставится глобально в app.vue.

export interface PageSeoOptions {
  /** Готовый title страницы («Раздел — МЕСТО»). */
  title: string
  /** Meta description; у документов и 404 не передаётся. */
  description?: string
  /** У страницы есть пара RU/EN: выводятся hreflang и x-default. */
  alternates?: boolean
  /** noindex — 404. */
  noindex?: boolean
}

export function usePageSeo(options: PageSeoOptions) {
  const { locale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const route = useRoute()
  // Домен — NUXT_PUBLIC_SITE_URL, по умолчанию из docs (config/site.ts).
  const origin = (useRuntimeConfig().public.siteUrl || SITE_URL).replace(/\/+$/, '')

  const absolute = (path: string) => {
    const clean = path.replace(/[?#].*$/, '').replace(/\/+$/, '')
    return `${origin}${clean}`
  }

  const canonical = computed(() => absolute(switchLocalePath(locale.value) || route.path))

  const links = computed(() => {
    const list: { rel: string; href: string; hreflang?: string }[] = [
      { rel: 'canonical', href: canonical.value },
    ]
    const ruPath = switchLocalePath('ru')
    const enPath = switchLocalePath('en')
    // Пара должна существовать в обеих локалях, иначе hreflang не ставится.
    if (options.alternates && ruPath && enPath) {
      const ru = absolute(ruPath)
      list.push(
        { rel: 'alternate', hreflang: 'ru', href: ru },
        { rel: 'alternate', hreflang: 'en', href: absolute(enPath) },
        { rel: 'alternate', hreflang: 'x-default', href: ru },
      )
    }
    return list
  })

  useHead({ link: links })

  // TODO(question): В3 — og:image (и фавикон) не задаются до ответа владельца
  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    description: options.description,
    ogDescription: options.description,
    robots: options.noindex ? 'noindex' : undefined,
  })
}
