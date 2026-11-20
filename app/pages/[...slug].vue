<script setup lang="ts">
// 404 — ТЗ → «Документы и 404», SEO (noindex, без description, без hreflang), Р60.
// Любой неизвестный адрес, в том числе под /en/. Пререндерится дважды: /404.html и /en/404.html (nuxt.config.ts, маршруты /404 и /en/404).
const { t } = useI18n()

// Статус 404 при SSR/пререндере; шаблон DocumentPage сохраняется (в отличие от createError).
if (import.meta.server) {
  setResponseStatus(useRequestEvent()!, 404)
}

usePageSeo({
  title: t('meta.notFound.title'),
  noindex: true,
})

// Vue при гидратации не переписывает href, а в пререндеренном 404.html ссылка переключателя языка посчитана
// для /404 (адрес посетителя подставляет plugins/not-found-url.client.ts, но уже после SSR). После монтирования
// шаблон перерисовывается — ссылки считаются по адресу посетителя (Р60).
const urlReplaced = useState('not-found-url-replaced', () => false)
const renderKey = ref(0)
onMounted(() => {
  if (urlReplaced.value) renderKey.value++
})
</script>

<template>
  <DocumentPage
    :key="renderKey"
    :title="$t('notFound.title')"
    :button-text="$t('notFound.button')"
    button-to="/"
  >
    {{ $t('notFound.text') }}
  </DocumentPage>
</template>
