<script setup lang="ts">
// Контакты — ТЗ → «Контакты», «Общие правила» п. 4, 9; Р11, Р16, Р24, Р33, Р55, Р56, Р72.
// RU /contacts, EN /en/contacts. Экраны: RU 35:4665 @1920, 2061:1237 @1440, 2061:1309 @1280, 2061:1381 @1024,
// 2061:1453 @768, 35:4912 @380; EN 51:15057, 2062:1318, 2062:1404, 2062:1490, 2062:1576, 51:15097.
// Порядок: NavBar, Page header (h1), ряд Info card (layout-ряды 35:4672, 2061:1244, 2061:1316, 2061:1388,
// 2061:1460, 35:4919), h2 «Предложить проект…» + Form (I2074:5748 @1920 … I2074:5769 @380), Footer.
// Блока ContactsCta на «Контактах» нет (ТЗ «Общие правила» п. 4): форма на светлом фоне.
const { t } = useI18n()
usePageSeo({
  title: t('meta.contacts.title'),
  description: t('meta.contacts.description'),
  alternates: true,
})
</script>

<template>
  <div class="contacts-page">
    <NavBar />
    <main>
      <PageHeader :title="$t('contacts.title')" />

      <section class="contacts-page__cards">
        <InfoCard type="socials" />
        <InfoCard type="mail" />
      </section>

      <section class="contacts-page__form-section">
        <h2 class="contacts-page__form-title">{{ $t('contacts.form.title') }}</h2>
        <!-- Якорь #form (Р55): NavBar с других страниц ведёт на /contacts#form -->
        <div class="contacts-page__form-wrap">
          <div id="form" class="contacts-page__form">
            <Form />
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
/*
 * Ряд карточек — layout-ряды 35:4672 @1920, 2061:1244 @1440, 2061:1316 @1280, 2061:1388 @1024, 2061:1460 @768,
 * 35:4919 @380: поле 20 / 16 / 15 / 13 / 12 / 8 = --space-20, gap 24 / 19 / 18 / 16 / 14 / 12 = --space-24,
 * вертикальные отступы 60 / 48 / 45 / 39 / 36 / 10 = --space-60 (токены своей ширины совпадают точно).
 * На 380 карточки друг под другом, на ≥ 768 — в ряд, почта тянется по высоте соцсетей (stretch).
 *
 * Раздел формы — значения по Figma (вариант б Н35, решение 21.11.2026). Section / заголовок / контейнер формы / Form:
 * 35:4671 / 35:4685 / 35:4687 / 2074:5748 @1920; 2061:1243 / 2061:1257 / 2061:1259 / 2074:5790 @1440;
 * 2061:1315 / 2061:1329 / 2061:1331 / 2074:5811 @1280; 2061:1387 / 2061:1401 / 2061:1403 / 2074:5832 @1024;
 * 2061:1459 / 2061:1473 / 2061:1475 / 2074:5853 @768; 35:4918 / 35:4932 / 35:5079 / 2074:5769 @380
 * (EN: 51:15077 / 2062:1342 / 2062:1428 / 2062:1514 / 2062:1600 / 51:15114, контейнеры 51:15079 … 51:15116).
 * Структура как в Figma: gap Section (--space-36, на 380 — 36) → заголовок (поле --space-60) → контейнер формы
 * (поля и паддинг --space-20, на 380 — 12 и 0) → низ Section (--space-60, на 380 — 60).
 */
.contacts-page {
  --_cp-field: var(--space-20); /* ряд: 20 / 16 / 15 / 13 / 12 / 8 */
  --_cp-gap: var(--space-24); /* ряд: 24 / 19 / 18 / 16 / 14 / 12 */
  --_cp-pad-y: var(--space-60); /* ряд: 60 / 48 / 45 / 39 / 36 / 10 */
  --_cp-sec-gap: 36px; /* Figma 35:4918 @380: gap-[36px], у ≥ 768 — --space-36 */
  --_cp-form-side: var(--space-24); /* 12 — Figma 35:5079 @380: px-[12px]; у ≥ 768 — --space-20 */
  --_cp-form-pad-y: 0px; /* Figma 35:5079 @380: вертикального паддинга нет; у ≥ 768 — --space-20 */
  --_cp-sec-bottom: 60px; /* Figma 35:4918 @380: pb-[60px]; у ≥ 768 — --space-60 */
  --_cp-scroll-margin: 104px; /* 12 + 80 + 12: NavBar 35:2546 @380, Н17 */

  min-width: 0;
}

.contacts-page__cards,
.contacts-page__form-section {
  box-sizing: border-box;
  max-width: var(--container-max-width); /* Р24 */
  margin-inline: auto;
}

.contacts-page__cards {
  padding-inline: var(--_cp-field);
}

.contacts-page__cards {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: var(--_cp-gap);
  padding-block: var(--_cp-pad-y);
}

.contacts-page__form-section {
  display: flex;
  flex-direction: column;
  gap: var(--_cp-sec-gap);
  padding-block-start: var(--_cp-sec-gap); /* gap Section: низ ряда карточек → заголовок */
  padding-block-end: var(--_cp-sec-bottom);
}

.contacts-page__form-wrap {
  padding: var(--_cp-form-pad-y) var(--_cp-form-side);
}

.contacts-page__form-title {
  margin: 0;
  padding-inline: var(--space-60); /* поле заголовка 60 / 48 / 45 / 39 / 36 / 10 */
  color: var(--color-black);
  font-size: var(--fs-h2);
  line-height: var(--lh-h2);
  font-weight: var(--fw-medium);
  overflow-wrap: anywhere;
}

.contacts-page__form {
  min-width: 0;
  scroll-margin-top: var(--_cp-scroll-margin);
}

@media (min-width: 768px) {
  .contacts-page {
    --_cp-scroll-margin: 96px; /* 16 + 64 + 16: NavBar 2064:1584 @768, Н17 */
    --_cp-sec-gap: var(--space-36); /* 36 / 29 / 27 / 23 / 22 — Figma 2061:1459 @768 */
    --_cp-form-side: var(--space-20); /* 20 / 16 / 15 / 13 / 12 — Figma 2061:1475 @768 */
    --_cp-form-pad-y: var(--space-20); /* Figma 2061:1475 @768 */
    --_cp-sec-bottom: var(--space-60); /* Figma 2061:1459 @768 */
  }

  .contacts-page__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .contacts-page {
    --_cp-scroll-margin: 94px; /* 13 + 68 + 13: NavBar 2064:1472 @1024, Н17 */
  }
}

@media (min-width: 1280px) {
  .contacts-page {
    --_cp-scroll-margin: 116px; /* 19 + 78 + 19: NavBar 2063:1514 @1280, Н17 */
  }
}

@media (min-width: 1440px) {
  .contacts-page {
    --_cp-scroll-margin: 132px; /* 24 + 84 + 24: NavBar 2063:1402 @1440, Н17 */
  }
}

@media (min-width: 1920px) {
  .contacts-page {
    --_cp-scroll-margin: 176px; /* 36 + 104 + 36: NavBar 35:2217 @1920, Н17 */
  }
}
</style>
