<script setup lang="ts">
// Демо песочницы для PageHeader: заголовок из словаря текущей локали.
// short — «Услуги» (nav.services); long — название документа: footer.consent на RU,
// footer.privacy на EN (согласия на EN нет в словаре). Служебный файл /__kit, на сайт не попадает.
import PageHeader from '~/components/PageHeader.vue'

const props = withDefaults(defineProps<{ text?: 'short' | 'long' }>(), { text: 'short' })

const { t, locale } = useI18n()

const title = computed(() => {
  if (props.text === 'short') return t('nav.services')
  return t(locale.value === 'en' ? 'footer.privacy' : 'footer.consent')
})
</script>

<template>
  <PageHeader :title="title" />
</template>
