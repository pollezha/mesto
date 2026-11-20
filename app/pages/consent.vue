<script setup lang="ts">
// Согласие на обработку персональных данных — ТЗ → «Документы и 404» (Р19, Р45), SEO. Только RU: EN-маршрут выключен («Инфраструктура» → «Стек»), /en/consent — 404; hreflang нет.
const { t } = useI18n()
definePageMeta({ i18n: { locales: ['ru'] } })
usePageSeo({
  title: t('meta.document.title', { name: t('footer.consent') }),
  alternates: false,
})
</script>

<template>
  <DocumentPage :title="$t('footer.consent')" />
</template>
