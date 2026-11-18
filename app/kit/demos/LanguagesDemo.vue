<script setup lang="ts">
// Демо песочницы для Languages: Dark показывается на тёмной подложке, иначе белый текст не виден.
// Служебный файл /__kit, на сайт не попадает. Активный язык — локаль страницы (/__kit — RU, /en/__kit — EN).
import Languages from '~/components/Languages.vue'

withDefaults(defineProps<{ mode?: 'light' | 'dark' }>(), { mode: 'light' })
</script>

<template>
  <div class="languages-demo" :class="`languages-demo--${mode}`">
    <Languages :mode="mode" />
  </div>
</template>

<style scoped>
.languages-demo {
  display: inline-block;
}

/* Подложка только для песочницы: на сайте Dark стоит на фоне кейса (Figma 52:17768) */
.languages-demo--dark {
  background-color: var(--color-black);
}
</style>
