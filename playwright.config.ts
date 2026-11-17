import { defineConfig, devices } from '@playwright/test'

// Контрольные ширины — «Токены и стили» → «Брейкпоинты». Высота окна на сверку не влияет:
// скриншоты снимаются на всю страницу.
export const WIDTHS = [1920, 1440, 1280, 1024, 768, 380] as const

const PORT = Number(process.env.PORT ?? 3000)

export default defineConfig({
  testDir: 'tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: WIDTHS.map((width) => ({
    name: `w${width}`,
    use: {
      ...devices['Desktop Chrome'],
      viewport: { width, height: 900 },
      // Мобильные ширины без hover: эффекты с `pointer: fine` проверяются на ≥ 1024.
      hasTouch: width < 1024,
    },
  })),
  webServer: {
    // Проверяем пререндеренную сборку, а не dev-сервер; MESTO_KIT=1 добавляет песочницу /__kit.
    command: 'npm run build && npm run preview',
    env: { MESTO_KIT: '1' },
    url: `http://localhost:${PORT}`,
    // Локально подхватывает уже запущенный сервер: `MESTO_KIT=1 npm run build && npm run preview`
    // один раз, дальше тесты без пересборки.
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
})
