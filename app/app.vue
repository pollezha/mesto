<script setup lang="ts">
// Preload шрифта Onest («Инфраструктура» → «Шрифт»).
// URL берётся из сборки (файлы в app/assets/fonts получают хеш), поэтому preload здесь, а не в nuxt.config.
// Н3 — решение владельца 20.11.2026: предзагружаются все четыре файла (latin и cyrillic, 400 и 500).
import onestCyrillic400 from '~/assets/fonts/onest-cyrillic-400-normal.woff2?url'
import onestCyrillic500 from '~/assets/fonts/onest-cyrillic-500-normal.woff2?url'
import onestLatin400 from '~/assets/fonts/onest-latin-400-normal.woff2?url'
import onestLatin500 from '~/assets/fonts/onest-latin-500-normal.woff2?url'

// <html lang> по локали — на всех страницах (ТЗ → «SEO»).
const { locale, locales } = useI18n()
const htmlLang = computed(() => {
  const current = locales.value.find(
    (item) => typeof item !== 'string' && item.code === locale.value,
  )
  return (typeof current === 'object' && current.language) || locale.value
})

useHead({
  htmlAttrs: { lang: htmlLang },
  link: [onestLatin400, onestLatin500, onestCyrillic400, onestCyrillic500].map((href) => ({
    rel: 'preload',
    as: 'font',
    type: 'font/woff2',
    href,
    crossorigin: 'anonymous' as const,
  })),
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <div class="site-page">
    <NuxtPage />
  </div>
  <!-- Cookie-баннер (Р22, Р40): один раз на всех страницах, fixed поверх; показ — useConsent().bannerOpen -->
  <CookieBanner />
</template>
