<script setup lang="ts">
// Preload шрифта Onest («Инфраструктура» → «Шрифт»: preload двух начертаний).
// URL берётся из сборки (файлы в app/assets/fonts получают хеш), поэтому preload здесь, а не в nuxt.config.
// TODO(question): new Н3 — какие два файла из четырёх; до ответа — latin 400 и 500 (нужны на всех страницах обеих локалей)
import onestLatin400 from '~/assets/fonts/onest-latin-400-normal.woff2?url'
import onestLatin500 from '~/assets/fonts/onest-latin-500-normal.woff2?url'

useHead({
  link: [onestLatin400, onestLatin500].map((href) => ({
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
  <NuxtPage />
</template>
