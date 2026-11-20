<script setup lang="ts">
// Политика обработки персональных данных — ТЗ → «Документы и 404» (Р19, Р45), SEO. RU /privacy и EN /en/privacy (Privacy Policy), пара hreflang.
const { t } = useI18n()
usePageSeo({
  title: t('meta.document.title', { name: t('footer.privacy') }),
  alternates: true,
})
</script>

<template>
  <DocumentPage :title="$t('footer.privacy')" />
</template>
