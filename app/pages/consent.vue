<script setup lang="ts">
// Согласие на обработку персональных данных — ТЗ → «Документы и 404» (Р19, Р45), SEO. RU /consent и EN /en/consent
// (Н80 — владелец 27.11.2026), пара hreflang. /newsletter-consent остаётся только RU.
const { t } = useI18n()
usePageSeo({
  title: t('meta.document.title', { name: t('footer.consent') }),
  alternates: true,
})
</script>

<template>
  <DocumentPage :title="$t('footer.consent')" />
</template>
