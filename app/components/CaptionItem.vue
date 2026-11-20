<script setup lang="ts">
// Пункт белой панели раскрытого блока услуг (Figma captionItem 8:523): слева вертикальная линия
// Blue 500, заголовок Caption 1 Black, описание Text 4 Gray 700. Колонки и отступы панели — у ServicesBlock.
// Уровень заголовка не меняет вид (Р56; ТЗ → «Общие правила» п. 9: в блоке услуг — h4).
withDefaults(
  defineProps<{
    title: string
    text: string
    level?: 2 | 3 | 4 | 5 | 6
  }>(),
  { level: 4 },
)
</script>

<template>
  <div class="caption-item">
    <component :is="`h${level}`" class="caption-item__title">{{ title }}</component>
    <p class="caption-item__text">{{ text }}</p>
  </div>
</template>

<style scoped>
.caption-item {
  /* Figma 35:7356 @380 (то же на 768: 35:7356 в 2064:1577) */
  --caption-item-line: 2px;
  --caption-item-indent: 8px;
  --caption-item-gap: 4px;

  box-sizing: border-box; /* линия и отступ входят в ширину: в панели пункт не шире колонки */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--caption-item-gap);
  min-width: 0;
  padding-left: var(--caption-item-indent);
  border-left: var(--caption-item-line) solid var(--color-blue-500);
}

.caption-item__title,
.caption-item__text {
  width: 100%;
  margin: 0;
}

.caption-item__title {
  color: var(--color-black);
  font-size: var(--fs-caption-1);
  font-weight: var(--fw-medium);
  line-height: var(--lh-caption-1);
}

.caption-item__text {
  color: var(--color-gray-700);
  font-size: var(--fs-txt-4);
  font-weight: var(--fw-regular);
  line-height: var(--lh-txt-4);
  text-wrap: balance; /* text-balance в Figma 8:525 */
}

@media (min-width: 1024px) {
  .caption-item {
    /* Figma 8:527 @1920, 2063:1395;8:527 @1440, 2063:1507;8:527 @1280, 2064:1465;8:527 @1024 */
    --caption-item-line: 4px;
    --caption-item-indent: 20px;
    --caption-item-gap: 8px;
  }
}
</style>
