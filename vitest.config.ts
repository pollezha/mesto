import { defineVitestConfig } from '@nuxt/test-utils/config'

// Логика: useLeadForm, useConsent, server/api/lead.
// Файлы с composables помечаются `// @vitest-environment nuxt`, сервер — в node.
export default defineVitestConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
})
