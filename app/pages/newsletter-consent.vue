<script setup lang="ts">
// Согласие на получение email рассылок — ТЗ → «Документы и 404» (Р19, Р45), SEO. Только RU: EN-маршрут выключен («Инфраструктура» → «Стек»), /en/newsletter-consent — 404; hreflang нет.
const { t } = useI18n()
definePageMeta({ i18n: { locales: ['ru'] } })
usePageSeo({
  title: t('meta.document.title', { name: t('footer.newsletter') }),
  alternates: false,
})
</script>

<template>
  <DocumentPage :title="$t('footer.newsletter')" />
</template>
