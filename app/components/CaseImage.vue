<script setup lang="ts">
// CaseImage — фото кейса в рамке (Figma case-image 14:1481, state Default / Hover).
// «Компоненты» → «Главная: кейсы и услуги»; Р1: hover +6% внутри рамки, рамка не растёт.
// Фото — заранее кадрированные растры из Figma на каждую ширину (case-0N@<ширина>[@2x].webp), кадр как в макете.
// Радиус и пропорции рамки — по фрейму кейса N на каждой ширине (ниже, с node id). Радиус, совпадающий с
// Radius/28 своей ширины, — токеном; px остаются там, где токена нет (кейс 1 @380, кейсы 2–4 @380, кейс 2 @768–1440).
// Рамка занимает ширину родителя; framed — ширина фрейма Figma (песочница). --case-image-w — та же ширина без
// единиц: CaseCard выражает её долей ширины ряда (Н26).
// Hover — на фото, не на всей карточке (Р1; ТЗ → «Интерактив», «Фото кейса — hover»).

const props = withDefaults(
  defineProps<{
    /** Номер кейса на главной (1–4). */
    n: 1 | 2 | 3 | 4
    alt: string
    loading?: 'lazy' | 'eager'
    /** Ширина рамки как во фрейме Figma текущей ширины (для песочницы). */
    framed?: boolean
  }>(),
  { loading: 'lazy', framed: false },
)

const files = import.meta.glob('../assets/images/case-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function url(width: number, x2 = false): string {
  return files[`../assets/images/case-0${props.n}@${width}${x2 ? '@2x' : ''}.webp`] ?? ''
}
function srcset(width: number): string {
  return `${url(width)} 1x, ${url(width, true)} 2x`
}
</script>

<template>
  <div class="case-image" :class="{ 'case-image--framed': framed }" :data-case="n">
    <picture>
      <source media="(min-width: 1920px)" :srcset="srcset(1920)" type="image/webp" />
      <source media="(min-width: 1440px)" :srcset="srcset(1440)" type="image/webp" />
      <source media="(min-width: 1280px)" :srcset="srcset(1280)" type="image/webp" />
      <source media="(min-width: 1024px)" :srcset="srcset(1024)" type="image/webp" />
      <source media="(min-width: 768px)" :srcset="srcset(768)" type="image/webp" />
      <img
        class="case-image__img"
        :src="url(380)"
        :srcset="srcset(380)"
        :alt="alt"
        :loading="loading"
        decoding="async"
      />
    </picture>
  </div>
</template>

<style scoped>
.case-image {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  width: 100%;
  aspect-ratio: var(--case-image-ratio);
  border-radius: var(--case-image-radius);
  background: var(--color-gray-300);
}

.case-image--framed {
  width: var(--case-image-frame);
}

.case-image picture {
  display: block;
  width: 100%;
  height: 100%;
}

.case-image__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1);
}

@media (pointer: fine) {
  .case-image__img {
    transition: transform 300ms ease-out;
  }

  .case-image:hover .case-image__img {
    transform: scale(1.06);
  }
}

@media (prefers-reduced-motion: reduce) {
  .case-image__img {
    transition: none;
  }
}

/* Figma 35:2180 @1920, 2063:1363 @1440, 2063:1475 @1280, 2064:1433 @1024, 2064:1545 @768, 35:2476 @380 */
.case-image[data-case='1'] {
  --case-image-radius: 16px;
  --case-image-ratio: 332 / 194.988;
  --case-image-frame: 332px;
  --case-image-w: 332;
}
@media (min-width: 768px) {
  .case-image[data-case='1'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 696 / 409;
    --case-image-frame: 696px;
    --case-image-w: 696;
  }
}
@media (min-width: 1024px) {
  .case-image[data-case='1'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 782 / 459;
    --case-image-frame: 782px;
    --case-image-w: 782;
  }
}
@media (min-width: 1280px) {
  .case-image[data-case='1'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 977 / 574;
    --case-image-frame: 977px;
    --case-image-w: 977;
  }
}
@media (min-width: 1440px) {
  .case-image[data-case='1'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 1100 / 646;
    --case-image-frame: 1100px;
    --case-image-w: 1100;
  }
}
@media (min-width: 1920px) {
  .case-image[data-case='1'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 1466 / 861;
    --case-image-frame: 1466px;
    --case-image-w: 1466;
  }
}

/* Figma 35:2185 @1920, 2063:1368 @1440, 2063:1480 @1280, 2064:1438 @1024, 2064:1678 @768, 35:2480 @380 */
.case-image[data-case='2'] {
  --case-image-radius: 28px;
  --case-image-ratio: 356 / 254;
  --case-image-frame: 356px;
  --case-image-w: 356;
}
@media (min-width: 768px) {
  .case-image[data-case='2'] {
    --case-image-radius: 11.2px;
    --case-image-ratio: 744 / 513;
    --case-image-frame: 744px;
    --case-image-w: 744;
  }
}
@media (min-width: 1024px) {
  .case-image[data-case='2'] {
    --case-image-radius: 14.933px;
    --case-image-ratio: 479.467 / 314.667;
    --case-image-frame: 479.467px;
    --case-image-w: 479.467;
  }
}
@media (min-width: 1280px) {
  .case-image[data-case='2'] {
    --case-image-radius: 18.667px;
    --case-image-ratio: 599.333 / 393.333;
    --case-image-frame: 599.333px;
    --case-image-w: 599.333;
  }
}
@media (min-width: 1440px) {
  .case-image[data-case='2'] {
    --case-image-radius: 21px;
    --case-image-ratio: 674.25 / 442.5;
    --case-image-frame: 674.25px;
    --case-image-w: 674.25;
  }
}
@media (min-width: 1920px) {
  .case-image[data-case='2'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 899 / 590;
    --case-image-frame: 899px;
    --case-image-w: 899;
  }
}

/* Figma 35:2195 @1920, 2063:1380 @1440, 2063:1492 @1280, 2064:1450 @1024, 2064:1562 @768, 35:2485 @380 */
.case-image[data-case='3'] {
  --case-image-radius: 28px;
  --case-image-ratio: 356 / 254;
  --case-image-frame: 356px;
  --case-image-w: 356;
}
@media (min-width: 768px) {
  .case-image[data-case='3'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 744 / 513;
    --case-image-frame: 744px;
    --case-image-w: 744;
  }
}
@media (min-width: 1024px) {
  .case-image[data-case='3'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 286 / 362;
    --case-image-frame: 286px;
    --case-image-w: 286;
  }
}
@media (min-width: 1280px) {
  .case-image[data-case='3'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 357 / 452;
    --case-image-frame: 357px;
    --case-image-w: 357;
  }
}
@media (min-width: 1440px) {
  .case-image[data-case='3'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 402 / 509;
    --case-image-frame: 402px;
    --case-image-w: 402;
  }
}
@media (min-width: 1920px) {
  .case-image[data-case='3'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 536 / 678;
    --case-image-frame: 536px;
    --case-image-w: 536;
  }
}

/* Figma 35:2197 @1920, 2063:1382 @1440, 2063:1494 @1280, 2064:1452 @1024, 2064:1564 @768, 35:2492 @380 */
.case-image[data-case='4'] {
  --case-image-radius: 28px;
  --case-image-ratio: 356 / 254;
  --case-image-frame: 356px;
  --case-image-w: 356;
}
@media (min-width: 768px) {
  .case-image[data-case='4'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 744 / 513;
    --case-image-frame: 744px;
    --case-image-w: 744;
  }
}
@media (min-width: 1024px) {
  .case-image[data-case='4'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 613 / 402;
    --case-image-frame: 613px;
    --case-image-w: 613;
  }
}
@media (min-width: 1280px) {
  .case-image[data-case='4'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 766 / 503;
    --case-image-frame: 766px;
    --case-image-w: 766;
  }
}
@media (min-width: 1440px) {
  .case-image[data-case='4'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 862 / 566;
    --case-image-frame: 862px;
    --case-image-w: 862;
  }
}
@media (min-width: 1920px) {
  .case-image[data-case='4'] {
    --case-image-radius: var(--radius-28);
    --case-image-ratio: 1149 / 754;
    --case-image-frame: 1149px;
    --case-image-w: 1149;
  }
}
</style>
