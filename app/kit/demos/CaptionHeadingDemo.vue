<script setup lang="ts">
// Демо песочницы для CaptionHeading: подпись с текстом из словаря текущей локали.
// Служебный файл /__kit, на сайт не попадает.
import CaptionHeading from '~/components/CaptionHeading.vue'

// withNum — номер раздела из словаря (home.projects.num), как на главной
withDefaults(defineProps<{ text?: 'projects' | 'services'; withNum?: boolean }>(), {
  text: 'projects',
  withNum: false,
})
</script>

<template>
  <CaptionHeading :num="withNum ? $t('home.projects.num') : undefined">{{ $t(`home.${text}.title`) }}</CaptionHeading>
</template>
