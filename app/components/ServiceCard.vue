<script setup lang="ts">
// ServiceCard — карточка услуги на странице «Услуги». Figma Service card 2045:972 (Size: Default 2045:960 / Small 2045:966);
// эталон вида — экраны «Услуги» (Р3): RU 35:5080 @1920, 2057:1236 @1440, 2057:1357 @1280, 2058:1236 @1024,
// 2058:1357 @768, 35:5593 @380; EN 51:14892, 2059:1071, 2059:1205, 2060:1208, 2060:1342, 51:14957.
// «Компоненты» → «Страница „Услуги“» → Service card; «Какой вариант на какой ширине»: Default на 1920–768, Small на 380.
// ТЗ → «Услуги» п. 2: карточка не кликабельна, hover нет (Р14). Названия карточек — h3 (Р56): prop level.
// size="auto" — Small ниже 768 и Default на ≥ 768 медиазапросом, без JS и смены DOM (как Input/Form);
// явные default / small — для песочницы. Тексты (title, text) передаёт страница из словаря services.blocks.*.
// TODO(question): new Н28 — высота карточки по содержимому (height: 100% / ряд), во фреймах ≥ 1024 высоты заданы вручную.
// Карточка тянется на высоту ячейки (height: 100%): раскладку раздела (колонки, высокая карточка, ряды одной высоты)
// делает страница. Содержимое разнесено по высоте (space-between), заголовок и описание прижаты к краям.
const props = withDefaults(
  defineProps<{
    /** Size в Figma; auto — Small ниже 768, Default на ≥ 768 (медиазапросом). */
    size?: 'default' | 'small' | 'auto'
    /** Название услуги (Caption 1, Black). */
    title: string
    /** Описание услуги (Text 3, Gray 700). */
    text: string
    /** Уровень заголовка названия (Р56: названия карточек — h3). */
    level?: 2 | 3 | 4
  }>(),
  { size: 'auto', level: 3 },
)

const { locale } = useI18n()
const titleTag = computed(() => `h${props.level}`)
</script>

<template>
  <div
    class="service-card"
    :class="[`service-card--${size}`, { 'service-card--en': locale === 'en' }]"
  >
    <component :is="titleTag" class="service-card__title">{{ title }}</component>
    <p class="service-card__text">{{ text }}</p>
  </div>
</template>

<style scoped>
/* Small (380) — база. Значения без токена — из фрейма (Figma Service card Small 2045:966, на экране 2076:6116 @380):
   паддинги 20 (--space-20 на 380 даёт 8), радиус 24 (--radius-24 на 380 даёт 10), высота блока названия 24. */
.service-card {
  --sc-pad: 20px; /* Figma 2076:6116 @380 */
  --sc-radius: 24px; /* Figma 2076:6116 @380 */
  --sc-title-h: 24px; /* Figma 2076:6116 @380: title 316 × 24 */
  --sc-gap: 0px; /* RU: заголовок и описание разнесены space-between; EN < 1024 — см. ниже */

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--sc-gap);
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: var(--sc-pad);
  border-radius: var(--sc-radius);
  background: var(--color-extra-white);
  overflow-wrap: break-word; /* Figma: word-break: break-word */
}

.service-card__title {
  flex: none;
  box-sizing: border-box;
  min-height: var(
    --sc-title-h
  ); /* блок названия фиксированной высоты в Figma; растёт, если название в 2 строки */
  margin: 0;
  color: var(--color-black);
  font-family: var(--font-family);
  font-size: var(--fs-caption-1);
  font-weight: var(--fw-medium);
  line-height: var(--lh-caption-1);
}

.service-card__text {
  flex: none;
  margin: 0;
  color: var(--color-gray-700);
  font-family: var(--font-family);
  font-size: var(--fs-txt-3);
  font-weight: var(--fw-regular);
  line-height: var(--lh-txt-3);
}

/* TODO(question): new Н27 — на EN-экранах 768 и 380 между названием и описанием 10 (--space-10), на RU-экранах 0 */
.service-card--en {
  --sc-gap: var(--space-10); /* Figma EN 2110:7578 @768, 2110:7636 @380 */
}

/* size="default" ниже 768 на сайте не используется (только песочница): токены дают значения 380, как и auto ниже 768;
   на ≥ 768 значения ступени 768 задаёт медиазапрос ниже (--space-36 = 22, --radius-24 = 14, Figma 2076:6137 @768) */
.service-card--default {
  --sc-pad: var(--space-36);
  --sc-radius: var(--radius-24);
  --sc-title-h: 48px; /* Figma 2076:6137 @768: title 652 × 48 */
}

@media (min-width: 768px) {
  .service-card--auto {
    --sc-pad: var(--space-36);
    --sc-radius: var(--radius-24);
    --sc-title-h: 48px; /* Figma 2076:6137 @768 */
  }
}

/* ≥ 1024 блок названия — 48 во всех фреймах: 2109:3931 @1024, 2109:3875 @1280, 2109:3819 @1440, 2076:6113 @1920 (title × 48) */

/* ≥ 1024 паддинг 36 и радиус 24 — как на 1920 (токены --space-36 / --radius-24 на 1024–1440 дают меньше,
   но во фреймах 2109:3931 @1024, 2109:3875 @1280, 2109:3819 @1440 стоят 36 и 24). Разнесение space-between — без зазора. */
@media (min-width: 1024px) {
  .service-card--auto,
  .service-card--default {
    --sc-pad: 36px; /* Figma 2109:3931 @1024 */
    --sc-radius: 24px; /* Figma 2109:3931 @1024 */
    --sc-gap: 0px;
  }
}

@media (min-width: 1920px) {
  .service-card--auto,
  .service-card--default {
    --sc-pad: var(--space-36); /* 36 — Figma 2076:6113 @1920 */
    --sc-radius: var(--radius-24); /* 24 */
  }
}
</style>
