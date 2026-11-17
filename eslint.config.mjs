// @ts-check
import prettier from 'eslint-config-prettier'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(prettier, {
  ignores: ['docs/**', 'playwright-report/**', 'test-results/**', 'screenshots/**'],
}).override('nuxt/vue/rules', {
  rules: {
    // Имена компонентов заданы документацией (Logo, Tag, Button, Input, Form, Footer…),
    // поэтому однословные имена и совпадения с HTML-тегами разрешены.
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
  },
})
