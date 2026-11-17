import { expect, test } from '@playwright/test'

// Скриншоты вариантов из песочницы /__kit для сверки компонентов с Figma (скил visual-check).
// Файл: screenshots/kit/<locale>/<Компонент>/<вариант>@<width>.png — снимаются только варианты,
// которые стоят на этой ширине (data-kit-widths). Фильтр компонентов: KIT=Button,Tag.
const ONLY = process.env.KIT

const slug = (label: string) => label.replace(/[^\p{L}\p{N}=-]+/gu, '_')

for (const locale of ['ru', 'en'] as const) {
  test(`kit ${locale}`, async ({ page }) => {
    const width = page.viewportSize()!.width
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${locale === 'en' ? '/en' : ''}/__kit${ONLY ? `?c=${ONLY}` : ''}`)
    await expect(page.locator('main.kit')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)

    for (const item of await page.locator('[data-kit-item]').all()) {
      const widths = (await item.getAttribute('data-kit-widths'))?.split(',').map(Number)
      if (widths && !widths.includes(width)) continue
      const name = await item.getAttribute('data-kit-item')
      const variant = slug((await item.getAttribute('data-kit-variant')) ?? 'default')
      await item.locator('[data-kit-stage]').screenshot({
        path: `screenshots/kit/${locale}/${name}/${variant}@${width}.png`,
        animations: 'disabled',
      })
    }
  })
}
