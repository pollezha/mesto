<script setup lang="ts">
// Кейс «Ребрендинг аптечной сети» — ТЗ → «Кейс» п. 1–4, «Общие правила» п. 3, 4, «SEO»; Р24, Р27, Р28, Р29, Р31, Р56, Р65, Р68, Р70.
// RU `/cases/pharmacy-rebranding`, EN `/en/cases/pharmacy-rebranding`. Блоки 01–09 (RU 1920 / 1440 / 1280 / 1024 / 768 / 380):
// 35:5828 … 35:6194 / 2068:1901 … 2068:2267 / 2068:2670 … 2068:3036 / 2069:1959 … 2069:2325 / 2069:2728 … 2069:3094 / 35:6562 … 35:6928;
// EN: 52:16315 … 52:16683 / 2069:5905 … 2069:6271 / 2069:6551 … 2069:6917 / 2069:7197 … 2069:7563 / 2069:7843 … 2069:8209 / 52:16826 … 52:17191.
// Section (CTA + Footer) RU 2143:6184 / 2068:2628 / 2068:3397 / 2069:2686 / 2069:3455 / 51:13573; EN 52:17817 / 2069:6298 / 2069:6944 / 2069:7590 / 2069:8236 / 52:18006.
// Полоса Menu (≥ 1024): RU 2109:4024 / 2109:4033 / 2109:4051 / 2109:4060; EN 52:17766 / 2069:5910 / 2069:6556 / 2069:7202.
// Н37 — решение владельца: полоса Menu по фрейму кейса отдельно для RU и EN (Logo White, Languages dark); кроме Languages в EN (Н9) — размер по умолчанию.
// Н39 (вариант а, как Н25) — блок 02 без lazy: на 380/768/1024 он в первом экране.
// Н38 — обложка (блок 01) ≥ 1024 уже без впечатанного Menu. Н7 — описание без «[иконка]».
import { CASE_BLOCK_HEIGHTS, CASE_WIDTHS } from '~~/config/case-pharmacy'

const { t, locale } = useI18n()

usePageSeo({
  title: t('meta.case.title'),
  description: t('meta.case.description'),
  alternates: true,
})

const lang = computed<'ru' | 'en'>(() => (locale.value === 'en' ? 'en' : 'ru'))

const files = import.meta.glob('../../assets/images/case-pharmacy/*/block-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function url(n: number, width: number, x2 = false): string {
  return (
    files[
      `../../assets/images/case-pharmacy/${lang.value}/block-0${n}@${width}${x2 ? '@2x' : ''}.webp`
    ] ?? ''
  )
}
function srcset(n: number, width: number): string {
  return `${url(n, width)} 1x, ${url(n, width, true)} 2x`
}

// Резерв места: aspect-ratio каждой ширины из реального файла своей локали (config/case-pharmacy.ts).
const blocks = computed(() =>
  Array.from({ length: 9 }, (_, i) => {
    const n = i + 1
    const style: Record<string, string> = {}
    for (const w of CASE_WIDTHS) style[`--r${w}`] = `${w} / ${CASE_BLOCK_HEIGHTS[lang.value][w][i]}`
    // Р70: alt у 01–03 пустой (текст в скрытом HTML), у 04–09 — из «Контента».
    const alt = n >= 4 ? t(`alt.case.block0${n}`) : ''
    return { n, style, alt }
  }),
)
</script>

<template>
  <div class="case" :class="`case--${lang}`">
    <NavBar />
    <main>
      <!-- Р65, Р29: текст блоков 01–09 — в картинках; для поисковиков и читалок — скрытый HTML (не display: none) -->
      <div class="visually-hidden">
        <h1>{{ $t('case.h1') }}</h1>
        <p>{{ $t('case.description') }}</p>
        <p>{{ $t('case.cities') }}</p>
        <p>{{ $t('case.task') }}</p>
      </div>

      <div class="case__blocks">
        <!-- Полоса Menu поверх обложки (≥ 1024), уезжает со страницей -->
        <div class="case__menu">
          <NuxtLinkLocale to="/" class="case__menu-logo">
            <Logo color="White" />
          </NuxtLinkLocale>
          <Languages mode="dark" />
        </div>

        <picture v-for="b in blocks" :key="b.n" class="case__block" :style="b.style">
          <source media="(min-width: 1920px)" :srcset="srcset(b.n, 1920)" type="image/webp" />
          <source media="(min-width: 1440px)" :srcset="srcset(b.n, 1440)" type="image/webp" />
          <source media="(min-width: 1280px)" :srcset="srcset(b.n, 1280)" type="image/webp" />
          <source media="(min-width: 1024px)" :srcset="srcset(b.n, 1024)" type="image/webp" />
          <source media="(min-width: 768px)" :srcset="srcset(b.n, 768)" type="image/webp" />
          <img
            class="case__img"
            :src="url(b.n, 380)"
            :srcset="srcset(b.n, 380)"
            :alt="b.alt"
            :loading="b.n <= 2 ? 'eager' : 'lazy'"
            :fetchpriority="b.n === 1 ? 'high' : undefined"
            decoding="async"
          />
        </picture>
      </div>
    </main>
    <ContactsCta overlap />
    <Footer />
  </div>
</template>

<style scoped>
.case {
  min-width: 0;
}

.case__blocks {
  position: relative;
  width: 100%;
  max-width: var(--container-max-width); /* Р24 */
  margin-inline: auto;
  margin-bottom: var(--space-28); /* 16 — зазор до Section: Figma 35:6561 → 51:13573 @380 (RU), 52:18006 (EN); ≥ 768 — 0 */
}

/* Без отступов между блоками (ТЗ → «Кейс» п. 2) */
.case__block {
  display: block;
  width: 100%;
}

.case__img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: var(--r380);
}

@media (min-width: 768px) {
  .case__blocks {
    margin-bottom: 0; /* на ≥ 768 Section ровно под блоком 09 */
  }

  .case__img {
    aspect-ratio: var(--r768);
  }
}

/* ---------- Полоса Menu: на 768 слой hidden, на 380 нет ---------- */
.case__menu {
  display: none;
}

.case__menu-logo {
  display: block;
  flex-shrink: 0;
}

@media (min-width: 1024px) {
  .case {
    /* Figma 2109:4060 @1024 (RU); EN 2069:7202 */
    --_cm-height: 114px;
    --_cm-pad: var(--space-60); /* 39 */
    --_cm-logo-w: 151.19px;
  }

  .case--en {
    --_cm-height: 93.03px; /* Figma 2069:7202 @1024 */
    --_cm-pad: 32px; /* Figma 2069:7202 @1024 */
    --_cm-logo-w: 116.29px; /* Figma 2069:7202 @1024 */
  }

  .case__img {
    aspect-ratio: var(--r1024);
  }

  .case__menu {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--_cm-height);
    padding-inline: var(--_cm-pad);
  }

  .case__menu-logo {
    width: var(--_cm-logo-w);
  }
}

@media (min-width: 1280px) {
  .case {
    --_cm-height: 130px; /* Figma 2109:4051 @1280 (RU) */
    --_cm-pad: var(--space-60); /* 45 */
    --_cm-logo-w: 172.79px; /* Figma 2109:4051 @1280 (RU) */
  }

  .case--en {
    --_cm-height: 116.28px; /* Figma 2069:6556 @1280 */
    --_cm-pad: 40px; /* Figma 2069:6556 @1280 */
    --_cm-logo-w: 145.36px; /* Figma 2069:6556 @1280 */
  }

  .case__img {
    aspect-ratio: var(--r1280);
  }
}

@media (min-width: 1440px) {
  .case {
    --_cm-height: 140px; /* Figma 2109:4033 @1440 (RU) */
    --_cm-pad: var(--space-60); /* 48 */
    --_cm-logo-w: 183.589px; /* Figma 2109:4033 @1440 (RU) */
  }

  .case--en {
    --_cm-height: 130.82px; /* Figma 2069:5910 @1440 */
    --_cm-pad: var(--space-56); /* 45 — Figma 2069:5910 @1440 */
    --_cm-logo-w: 163.53px; /* Figma 2069:5910 @1440 */
  }

  .case__img {
    aspect-ratio: var(--r1440);
  }
}

@media (min-width: 1920px) {
  .case,
  .case--en {
    --_cm-height: 174.42px; /* Figma 2109:4024 @1920 (RU), 52:17766 (EN) */
    --_cm-pad: var(--space-60); /* 60 */
    --_cm-logo-w: 215.987px; /* Figma 2109:4024 @1920 (RU) */
  }

  .case--en {
    --_cm-logo-w: 218.04px; /* Figma 52:17766 @1920 (EN) */
  }

  .case__img {
    aspect-ratio: var(--r1920);
  }
}
</style>
