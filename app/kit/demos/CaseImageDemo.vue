<script setup lang="ts">
// Демо песочницы для CaseImage: рамка по ширине фрейма Figma, alt из словаря (alt.home.caseN).
// Служебный файл /__kit, на сайт не попадает. Hover проверяется наведением на фото.
import CaseImage from '~/components/CaseImage.vue'

defineProps<{ n: 1 | 2 | 3 | 4 }>()
</script>

<template>
  <CaseImage :n="n" :alt="$t(`alt.home.case${n}`)" framed loading="eager" />
</template>
