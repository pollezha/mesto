<script setup lang="ts">
// Демо песочницы для CaptionHeading: подпись с текстом из словаря текущей локали.
// Служебный файл /__kit, на сайт не попадает.
import CaptionHeading from '~/components/CaptionHeading.vue'

withDefaults(defineProps<{ text?: 'projects' | 'services' }>(), { text: 'projects' })
</script>

<template>
  <CaptionHeading>{{ $t(`home.${text}.title`) }}</CaptionHeading>
</template>
