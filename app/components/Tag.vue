<script setup lang="ts">
// Tag «скоро кейс» / «soon» — Figma 2044:1012 (Size=Default 2044:1008, Size=Small 2044:1010);
// docs «Компоненты» → «Главная: кейсы и услуги» → Tag. Не интерактивный, состояний нет.
// Вариант выбирает место использования (CaseCard) по «Какой вариант на какой ширине»:
// Default — 1920, 1440, 1280; Small — 1024, 768, 380. Tag сам по ширине не переключается.
// Положение тега в карточке — задача CaseCard.
withDefaults(defineProps<{ size?: 'default' | 'small' }>(), { size: 'default' })
</script>

<template>
  <span class="tag" :class="`tag--${size}`">{{ $t('tag.soon') }}</span>
</template>

<style scoped>
.tag {
  /* Паддинги и радиус в Figma не привязаны к Spacing/Radius и одинаковы на всех ширинах (фиксированные px):
     на 1440 Spacing/16 = 13, Spacing/4 = 3, а у тега 16 и 4; Radius/Max = 999, а у тега 99. */
  --tag-radius: 99px; /* Figma 2044:1008, 2044:1010; инстансы 2072:2413 @1920 … 2072:2419 @380 */

  display: inline-flex;
  align-items: flex-start;
  border-radius: var(--tag-radius);
  background-color: var(--color-blue-100);
  color: var(--color-blue-900);
  font-family: var(--font-family);
  font-weight: var(--fw-regular);
  white-space: nowrap;
}

/* Size=Default: Text 3 своей ширины (font-size/txt3 привязан: 32/36 @1920, 26/30 @1440, 24/28 @1280) */
.tag--default {
  --tag-padding-top: 4px; /* Figma 2072:2413 @1920, 2072:2437 @1440, 2072:2443 @1280 */
  --tag-padding-x: 16px; /* Figma 2072:2413 @1920, 2072:2437 @1440, 2072:2443 @1280 */
  --tag-padding-bottom: 8px; /* Figma 2072:2413 @1920, 2072:2437 @1440, 2072:2443 @1280 */

  padding: var(--tag-padding-top) var(--tag-padding-x) var(--tag-padding-bottom);
  font-size: var(--fs-txt-3);
  line-height: var(--lh-txt-3);
}

/* Size=Small: на экранах 1024, 768 и 380 Text 3 стоит в режиме Mobile — 16/20 на всех трёх ширинах
   (get_variable_defs инстансов), а не Text 3 своей ширины (20/24 @1024, 18/22 @768). Эталон — экран (Р3). */
.tag--small {
  --tag-padding-y: 4px; /* Figma 2072:2449 @1024, 2072:2455 @768, 2072:2419 @380 */
  --tag-padding-x: 12px; /* Figma 2072:2449 @1024, 2072:2455 @768, 2072:2419 @380 */
  --tag-small-fs: 16px; /* Figma 2072:2449 @1024, 2072:2455 @768, 2072:2419 @380: font-size/txt3 (Mobile) */
  --tag-small-lh: 20px; /* Figma 2072:2449 @1024, 2072:2455 @768, 2072:2419 @380: line-height/txt3 (Mobile) */

  padding: var(--tag-padding-y) var(--tag-padding-x);
  font-size: var(--tag-small-fs);
  line-height: var(--tag-small-lh);
}
</style>
