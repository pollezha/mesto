<script setup lang="ts">
// Демо песочницы для DocumentPage: document — footer.privacy на обеих локалях; document-long — длинное
// название footer.consent на обеих локалях (как в PageHeaderDemo, Н80); 404 — notFound.*. Служебный файл /__kit, на сайт не попадает.
import DocumentPage from '~/components/DocumentPage.vue'

const props = withDefaults(defineProps<{ kind?: 'document' | 'document-long' | 'not-found' }>(), {
  kind: 'document',
})

const { t } = useI18n()

const title = computed(() => {
  if (props.kind === 'not-found') return t('notFound.title')
  if (props.kind === 'document-long')
    return t('footer.consent')
  return t('footer.privacy')
})
</script>

<template>
  <DocumentPage
    v-if="kind === 'not-found'"
    static-nav
    :title="title"
    :button-text="t('notFound.button')"
    button-to="/"
  >
    {{ t('notFound.text') }}
  </DocumentPage>
  <DocumentPage v-else static-nav :title="title" />
</template>
