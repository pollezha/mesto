<script setup lang="ts">
// Демо песочницы для ArrowIcon: иконка внутри текста заданного стиля, чтобы было видно «размер = кегль».
// Служебный файл /__kit, на сайт не попадает.
import ArrowIcon from '~/components/ArrowIcon.vue'

withDefaults(defineProps<{ text?: 'caption-2' | 'h5' }>(), { text: 'caption-2' })
</script>

<template>
  <!-- Caption 2 — как в кнопке навбара; Heading 5 — как почта в Info card -->
  <p class="arrow-demo" :class="`arrow-demo--${text}`">
    {{ text === 'h5' ? $t('email') : $t('cta.discuss') }}
    <ArrowIcon />
  </p>
</template>

<style scoped>
.arrow-demo {
  margin: 0;
  color: var(--color-black);
  font-weight: var(--fw-medium);
}

.arrow-demo--caption-2 {
  font-size: var(--fs-caption-2);
  line-height: var(--lh-caption-2);
}

.arrow-demo--h5 {
  font-size: var(--fs-h5);
  line-height: var(--lh-h5);
}
</style>
