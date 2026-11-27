// Маршруты сайта — ТЗ → «Маршруты» (Р21, Р31), «Инфраструктура» → «Стек».
// Используется nuxt.config.ts (пререндер) и server/routes/sitemap.xml.ts. Адреса RU — без приставки,
// EN — с /en; без завершающего слэша. 404 здесь нет: она не в sitemap и пререндерится отдельно.

/** Домен сайта по умолчанию — «Инфраструктура» → «Переменные окружения» (NUXT_PUBLIC_SITE_URL). */
export const SITE_URL = 'https://mesto.studio'

export type SiteLocale = 'ru' | 'en'

export interface SitePage {
  /** Путь RU-версии. */
  path: string
  /** Локали, в которых страница существует (newsletter-consent — только RU). */
  locales: SiteLocale[]
}

export const sitePages: SitePage[] = [
  { path: '/', locales: ['ru', 'en'] },
  { path: '/services', locales: ['ru', 'en'] },
  { path: '/contacts', locales: ['ru', 'en'] },
  { path: '/cases/pharmacy-rebranding', locales: ['ru', 'en'] },
  { path: '/privacy', locales: ['ru', 'en'] },
  { path: '/consent', locales: ['ru', 'en'] },
  { path: '/newsletter-consent', locales: ['ru'] },
]

/** Путь страницы в локали: EN — с /en, главная EN — /en. */
export function localizedPath(path: string, locale: SiteLocale): string {
  if (locale === 'ru') return path
  return path === '/' ? '/en' : `/en${path}`
}

/** Все индексируемые адреса (для sitemap.xml и пререндера). */
export const sitePaths: string[] = sitePages.flatMap((page) =>
  page.locales.map((locale) => localizedPath(page.path, locale)),
)
