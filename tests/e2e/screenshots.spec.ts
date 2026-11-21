import { test } from '@playwright/test'

// Скриншоты для визуальной сверки с фреймами Figma (скил visual-check).
// Файл: screenshots/<locale>/<page>@<width>.png. Сравнение делает visual-reviewer, эталонов в репозитории нет.
const PAGES = [
  { name: 'home', ru: '/', en: '/en' },
  { name: 'services', ru: '/services', en: '/en/services' },
  { name: 'contacts', ru: '/contacts', en: '/en/contacts' },
  { name: 'case', ru: '/cases/pharmacy-rebranding', en: '/en/cases/pharmacy-rebranding' },
  { name: 'privacy', ru: '/privacy', en: '/en/privacy' },
  { name: '404', ru: '/__not-found__', en: '/en/__not-found__' },
] as const

const ONLY = process.env.PAGES?.split(',')

for (const page of PAGES) {
  if (ONLY && !ONLY.includes(page.name)) continue
  for (const locale of ['ru', 'en'] as const) {
    test(`${page.name} ${locale}`, async ({ page: browserPage }, testInfo) => {
      const width = browserPage.viewportSize()?.width
      await browserPage.emulateMedia({ reducedMotion: 'reduce' })
      await browserPage.goto(page[locale])
      await browserPage.evaluate(() => document.fonts.ready)
      // Full-page снимок не прокручивает страницу: lazy-картинки ниже первого экрана иначе остаются пустыми.
      await browserPage.evaluate(async () => {
        const images = Array.from(document.images)
        for (const img of images) img.loading = 'eager'
        await Promise.all(images.map((img) => img.decode().catch(() => undefined)))
      })
      await browserPage.screenshot({
        path: `screenshots/${locale}/${page.name}@${width}.png`,
        fullPage: true,
        animations: 'disabled',
      })
      testInfo.annotations.push({
        type: 'screenshot',
        description: `${locale}/${page.name}@${width}`,
      })
    })
  }
}
