<script setup lang="ts">
// «Услуги» — ТЗ → «Услуги» п. 1–3, «Общие правила» п. 4 и 9 (Р56), «SEO»; Р8, Р9, Р14, Р24, Р28.
// Экраны: RU 35:5080 @1920, 2057:1236 @1440, 2057:1357 @1280, 2058:1236 @1024, 2058:1357 @768, 35:5593 @380;
// EN 51:14892, 2059:1071, 2059:1205, 2060:1208, 2060:1342, 51:14957.
// Section: RU 35:5110 @1920, 2109:3814 @1440, 2109:3870 @1280, 2109:3926 @1024, 2058:1363 @768, 35:5824 @380;
// EN 2110:7349 @1920, 2110:7573 @768, 2110:7630 @380 (EN 1440/1280/1024 в документации не найдены).
// Состав: NavBar, Page header (h1 «Услуги»), четыре раздела (h2 Heading 3 + карточки h3), CTA с формой, Footer.
const { t } = useI18n()
usePageSeo({
  title: t('meta.services.title'),
  description: t('meta.services.description'),
  alternates: true,
})

// Порядок карточек — DOM-порядок 1920–768; на 380 в Маркетинге и Интерфейсах обратный (CSS order, без дублей в DOM).
const blocks = [
  { id: 'branding', items: ['fullBranding', 'rebranding', 'logo', 'brandbook'] },
  { id: 'marketing', items: ['communicationStrategy', 'social', 'adCreatives'] },
  { id: 'interfaces', items: ['platforms', 'mobileApps', 'websites'] },
  { id: 'support', items: ['consultation', 'support'] },
] as const
</script>

<template>
  <div class="services-page">
    <NavBar />
    <main>
      <PageHeader :title="$t('nav.services')" />
      <div class="services">
        <section
          v-for="block in blocks"
          :key="block.id"
          class="services__block"
          :class="`services__block--${block.id}`"
        >
          <h2 class="services__title">{{ $t(`services.blocks.${block.id}.title`) }}</h2>
          <div class="services__grid">
            <ServiceCard
              v-for="item in block.items"
              :key="item"
              :title="$t(`services.blocks.${block.id}.items.${item}.title`)"
              :text="$t(`services.blocks.${block.id}.items.${item}.text`)"
            />
          </div>
        </section>
      </div>
    </main>
    <ContactsCta overlap />
    <Footer />
  </div>
</template>

<style scoped>
/*
 * Значения — раскладка «Услуг» по фреймам Section (node id в шапке файла); 380 — база, дальше ступени (Р4).
 * Отступ до первого раздела и от последнего до низа секции — к паддингам самих разделов.
 */
.services-page {
  min-width: 0;
}

.services {
  --_sv-side: var(--space-24); /* 12 — Figma 35:5824 @380 */
  --_sv-gap: var(--space-24); /* 12 — Figma 35:5824 @380 */
  --_sv-title-gap: var(--space-32); /* 20 — Figma 35:5824 @380 */
  --_sv-pad: var(--space-32); /* 20 — Figma 35:5824 @380 */
  --_sv-first: var(--space-32); /* 20 — Figma 35:5824 @380 */
  --_sv-last: var(--space-32); /* 20 — Figma 35:5824 @380 */

  box-sizing: border-box;
  width: 100%;
  max-width: var(--container-max-width); /* Р24 */
  min-width: 0;
  margin-inline: auto;
  padding: var(--_sv-first) var(--_sv-side) var(--_sv-last);
}

.services__block {
  --_sv-block-top: var(--_sv-pad);
  --_sv-block-bottom: var(--_sv-pad);

  padding-block: var(--_sv-block-top) var(--_sv-block-bottom);
}

.services__block--branding {
  --_sv-block-top: 52px; /* Figma 35:5824 @380: исключение Брендинга */
  --_sv-block-bottom: 52px; /* Figma 35:5600 @380: pb 32 (35:5601) + pt 20 (35:5767), EN 2110:7631 */
}

.services__title {
  margin: 0 0 var(--_sv-title-gap);
  color: var(--color-black);
  font-size: var(--fs-h3);
  line-height: var(--lh-h3);
  font-weight: var(--fw-medium);
}

.services__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--_sv-gap);
}

/* 380: в Маркетинге и Интерфейсах порядок карточек обратный (Figma 35:5824 @380) */
.services__block--marketing .services__grid > :nth-child(1),
.services__block--interfaces .services__grid > :nth-child(1) {
  order: 3;
}

.services__block--marketing .services__grid > :nth-child(3),
.services__block--interfaces .services__grid > :nth-child(3) {
  order: 1;
}

.services__block--marketing .services__grid > :nth-child(2),
.services__block--interfaces .services__grid > :nth-child(2) {
  order: 2;
}

@media (min-width: 768px) {
  .services {
    --_sv-side: var(--space-60); /* 36 — Figma 2058:1363 @768 */
    --_sv-gap: var(--space-24); /* 14 — Figma 2058:1363 @768 */
    --_sv-title-gap: var(--space-36); /* 22 — Figma 2058:1363 @768 */
    --_sv-pad: var(--space-60); /* 36 — Figma 2058:1363 @768 */
    --_sv-first: 20px; /* Figma 2058:1363 @768 (--space-32 здесь 19) */
    --_sv-last: 20px; /* Figma 2058:1363 @768 (--space-32 здесь 19) */
  }

  .services__block--branding {
    --_sv-block-top: var(--_sv-pad);
    --_sv-block-bottom: var(--_sv-pad);
  }

  /* :nth-child(n) — та же специфичность, что у базовых правил 380, и стоит позже */
  .services__block--marketing .services__grid > :nth-child(n),
  .services__block--interfaces .services__grid > :nth-child(n) {
    order: 0; /* на 768 и шире — порядок DOM */
  }
}

@media (min-width: 1024px) {
  .services {
    --_sv-side: 40px; /* Figma 2109:3926 @1024 */
    --_sv-gap: 24px; /* Figma 2109:3926 @1024 */
    --_sv-title-gap: var(--space-56); /* 36 — Figma 2109:3926 @1024 */
    --_sv-pad: 40px; /* Figma 2109:3926 @1024 */
    --_sv-first: 28px; /* Figma 2109:3926 @1024 */
    --_sv-last: 64px; /* Figma 2109:3926 @1024 */
  }

  .services__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* Маркетинг: слева высокая карточка, справа столбик из двух */
  .services__block--marketing .services__grid > :nth-child(1) {
    grid-column: 1;
    grid-row: 1 / span 2;
  }

  .services__block--marketing .services__grid > :nth-child(2) {
    grid-column: 2;
    grid-row: 1;
  }

  .services__block--marketing .services__grid > :nth-child(3) {
    grid-column: 2;
    grid-row: 2;
  }

  /* Интерфейсы: слева столбик из двух, справа высокая карточка */
  .services__block--interfaces .services__grid > :nth-child(1) {
    grid-column: 1;
    grid-row: 1;
  }

  .services__block--interfaces .services__grid > :nth-child(2) {
    grid-column: 1;
    grid-row: 2;
  }

  .services__block--interfaces .services__grid > :nth-child(3) {
    grid-column: 2;
    grid-row: 1 / span 2;
  }
}

@media (min-width: 1280px) {
  .services {
    --_sv-side: var(--space-64); /* 48 — Figma 2109:3870 @1280 */
    --_sv-title-gap: var(--space-48); /* 36 — Figma 2109:3870 @1280 (--space-56 здесь 42) */
    --_sv-gap: var(--space-32); /* 24 — Figma 2109:3870 @1280 */
    /* pad 40, first 28, last 64 — из 1024, подтверждены 2109:3870 @1280; токена с таким значением на 1280 нет */
  }
}

@media (min-width: 1440px) {
  .services {
    --_sv-side: var(--space-60); /* 48 — Figma 2109:3814 @1440 (--space-64 здесь 51) */
    --_sv-title-gap: 36px; /* Figma 2109:3814 @1440: токена 36 нет, --space-48 здесь 38 */
    --_sv-pad: 60px; /* Figma 2109:3814 @1440 */
    --_sv-gap: 24px; /* Figma 2109:3814 @1440: токена 24 нет */
    --_sv-first: 40px; /* Figma 2109:3814 @1440 */
    --_sv-last: 80px; /* Figma 2109:3814 @1440 */
  }
}

@media (min-width: 1920px) {
  .services {
    --_sv-side: var(--space-60); /* 60 — Figma 35:5110 @1920 */
    --_sv-title-gap: var(--space-36); /* 36 — Figma 35:5110 @1920 */
    --_sv-gap: var(--space-24); /* 24 — Figma 35:5110 @1920 */
    --_sv-pad: var(--space-60); /* 60 — Figma 35:5110 @1920 */
    --_sv-first: var(--space-60); /* 60 — Figma 35:5110 @1920 */
    --_sv-last: 120px; /* Figma 35:5110 @1920 */
  }
}
</style>
