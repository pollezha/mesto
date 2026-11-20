<script setup lang="ts">
// Демо песочницы для InfoCard: карточка в ячейке ряда «Контактов» своей ширины (Figma Layout 35:4672 @1920,
// 2061:1244 @1440, 2061:1316 @1280, 2061:1388 @1024, 2061:1460 @768, 35:4919 @380). Ряд — две карточки рядом,
// на 380 друг под другом. Ширина ячейки = (окно − 2 × поле − gap) / 2: 928 / 694.5 / 616 / 491 / 365; на 380 — 364.
// Служебный файл /__kit, на сайт не попадает.
import InfoCard from '~/components/InfoCard.vue'

defineProps<{
  type: 'socials' | 'mail'
  size: 'default' | 'small' | 'auto'
}>()
</script>

<template>
  <div class="demo-row">
    <InfoCard :type="type" :size="size" />
  </div>
</template>

<style scoped>
.demo-row {
  --demo-gutter: 8px; /* (380 − 364) / 2 */
  --demo-gap: 0px;
  --demo-cols: 1;
  box-sizing: border-box;
  width: calc(
    (100% - 2 * var(--demo-gutter) - (var(--demo-cols) - 1) * var(--demo-gap)) / var(--demo-cols)
  );
  margin: 0 auto;
  background: var(--color-white);
}

/* поля ряда = Spacing/20 (12 / 13 / 15 / 16 / 20), зазор = Spacing/24 (14 / 16 / 18 / 19 / 24) — Figma Layout 2061:1460 @768 … 35:4672 @1920 */
@media (min-width: 768px) {
  .demo-row {
    --demo-gutter: var(--space-20);
    --demo-gap: var(--space-24);
    --demo-cols: 2;
    margin-left: var(--demo-gutter);
  }
}
</style>
