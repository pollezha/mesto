<script setup lang="ts">
// Демо песочницы для CaptionHeading: подпись с текстом из словаря текущей локали.
// Служебный файл /__kit, на сайт не попадает.
import CaptionHeading from '~/components/CaptionHeading.vue'

withDefaults(defineProps<{ text?: 'projects' | 'services'; num?: string }>(), {
  text: 'projects',
  num: undefined,
})
</script>

<template>
  <CaptionHeading :num="num">{{ $t(`home.${text}.title`) }}</CaptionHeading>
</template>
