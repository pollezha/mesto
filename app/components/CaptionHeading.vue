<script setup lang="ts">
// CaptionHeading — подпись раздела главной «Проекты» / «Услуги».
// docs «Компоненты» → «Hero» (Heading 14:1471: Heading 5, по правому краю); ТЗ → «Главная» п. 2, 4.
// Корень = фрейм «heading» экрана (Р3): во всю ширину раздела, текст прижат вправо с отступом справа.
// Экраны RU: 35:2176 / 35:2207 @1920, 2063:1359 / 2063:1392 @1440, 2063:1471 / 2063:1504 @1280,
// 2064:1429 / 2064:1462 @1024, 2064:1541 / 2064:1574 @768, 35:2472 / 35:2501 @380;
// EN — та же геометрия (51:13662 / 51:13695 @1920 … 51:13710 / 51:13741 @380).
// Паддинги раздела и отступ до контента под подписью — геометрия страницы, не компонента.
// Якорь «Проекты» (#projects) ставит страница на раздел, не на подпись; scroll-margin под навбар — только на < 1024 (ТЗ «Общие правила» п. 9, Н51).
// Текст — в слот по умолчанию, из словаря: home.projects.title / home.services.title.

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

const props = withDefaults(
  defineProps<{
    /** Уровень заголовка в разметке; подписи разделов — h2 (Р56, ТЗ «Общие правила» п. 9). Вид от уровня не зависит. */
    level?: HeadingLevel
    /** Н61: номер раздела («01») — виден только на < 1024: «номер — линия — название». */
    num?: string
  }>(),
  { level: 2, num: undefined },
)

const tag = computed(() => `h${props.level}`)
</script>

<template>
  <component :is="tag" class="caption-heading">
    <template v-if="num">
      <span class="caption-heading__num" aria-hidden="true">{{ num }}</span>
      <span class="caption-heading__line" aria-hidden="true" />
    </template>
    <span class="caption-heading__text"><slot /></span>
  </component>
</template>

<style scoped>
.caption-heading {
  /* Стиль Heading 5 (на <768 — H3, Н53), цвет Achromatic/Black — Figma 14:1471 и инстансы на экранах, все ширины */
  margin: 0;
  /* Отступ справа фрейма «heading» — без привязки, на каждой ширине равен Spacing/40:
     40 @1920, 32 @1440, 30 @1280, 26 @1024, 24 @768, 10 @380 (кадры выше) */
  padding-right: var(--space-40);
  color: var(--color-black);
  /* Н53 — владелец 24.11.2026: подписи разделов на телефоне крупнее — 28/32 */
  font-size: var(--fs-h3);
  line-height: var(--lh-h3);
  font-weight: var(--fw-medium);
  text-align: right;
  white-space: nowrap;
}

/* Н61 — владелец 24.11.2026: на < 1024 подпись — одна строка на всю ширину «01 ──── Проекты»; на ≥ 1024 номера и линии нет.
   Номер — Gray 500 тем же кеглем, линия 1 px Gray 300. Нужно подтверждение дизайнера. TODO(question): new Н61 */
.caption-heading:has(.caption-heading__num) {
  display: flex;
  gap: var(--space-20);
  align-items: center;
  padding-right: 0;
  text-align: left;
}

.caption-heading__num {
  display: block;
  color: var(--color-gray-500);
}

.caption-heading__line {
  display: block;
  flex: 1 1 auto;
  height: 1px;
  background: var(--color-gray-300);
}

@media (min-width: 768px) {
  .caption-heading {
    font-size: var(--fs-h5);
    line-height: var(--lh-h5);
  }
}

@media (min-width: 1024px) {
  .caption-heading:has(.caption-heading__num) {
    display: block;
    padding-right: var(--space-40);
    text-align: right;
  }

  .caption-heading__num,
  .caption-heading__line {
    display: none;
  }
}
</style>
