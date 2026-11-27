<script setup lang="ts">
// Демо песочницы для PageHeader: заголовок из словаря текущей локали.
// short — «Услуги» (nav.services); long — самое длинное название документа: footer.consent
// на обеих локалях (Н80). Служебный файл /__kit, на сайт не попадает.
import PageHeader from '~/components/PageHeader.vue'

const props = withDefaults(defineProps<{ text?: 'short' | 'long' }>(), { text: 'short' })

const { t } = useI18n()

const title = computed(() => {
  if (props.text === 'short') return t('nav.services')
  return t('footer.consent')
})
</script>

<template>
  <PageHeader :title="title" />
</template>
