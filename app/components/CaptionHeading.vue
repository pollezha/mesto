<script setup lang="ts">
// CaptionHeading — подпись раздела главной «Проекты» / «Услуги».
// docs «Компоненты» → «Hero» (Heading 14:1471: Heading 5, по правому краю); ТЗ → «Главная» п. 2, 4.
// Корень = фрейм «heading» экрана (Р3): во всю ширину раздела, текст прижат вправо с отступом справа.
// Экраны RU: 35:2176 / 35:2207 @1920, 2063:1359 / 2063:1392 @1440, 2063:1471 / 2063:1504 @1280,
// 2064:1429 / 2064:1462 @1024, 2064:1541 / 2064:1574 @768, 35:2472 / 35:2501 @380;
// EN — та же геометрия (51:13662 / 51:13695 @1920 … 51:13710 / 51:13741 @380).
// Паддинги раздела и отступ до контента под подписью — геометрия страницы, не компонента.
// Якорь «Проекты» (#projects, scroll-margin под навбар) ставит страница на раздел (ТЗ «Общие правила» п. 9).
// Текст — в слот по умолчанию, из словаря: home.projects.title / home.services.title.

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const props = withDefaults(
  defineProps<{
    /** Уровень заголовка в разметке; подписи разделов — h2 (Р56, ТЗ «Общие правила» п. 9). Вид от уровня не зависит. */
    level?: HeadingLevel
  }>(),
  { level: 2 },
)

const tag = computed(() => `h${props.level}`)
</script>

<template>
  <component :is="tag" class="caption-heading">
    <slot />
  </component>
</template>

<style scoped>
.caption-heading {
  /* Стиль Heading 5, цвет Achromatic/Black — Figma 14:1471 и инстансы на экранах, все ширины */
  margin: 0;
  /* Отступ справа фрейма «heading» — без привязки, на каждой ширине равен Spacing/40:
     40 @1920, 32 @1440, 30 @1280, 26 @1024, 24 @768, 10 @380 (кадры выше) */
  padding-right: var(--space-40);
  color: var(--color-black);
  font-size: var(--fs-h5);
  line-height: var(--lh-h5);
  font-weight: var(--fw-medium);
  text-align: right;
}
</style>
