<script setup lang="ts">
// CaseCard — карточка кейса на главной (Figma Case card 2046:1064). Раскладки по Figma:
//   n=1 Featured (≥ 768) / Mobile Featured (380), n=2 Media Left, n=3 Media Right, n=4 Media Wide (≥ 1024),
//   на 768 и 380 кейсы 2–4 — Stacked. Тип выбирается номером кейса и шириной (медиазапросами, без JS):
//   страница передаёт только n, а не Type Figma, который смешивает кейс и ширину.
// Эталон — экраны главной (Р3, Р44): RU 35:2169 @1920, 2063:1352 @1440, 2063:1464 @1280, 2064:1422 @1024,
//   2064:1534 @768, 35:2468 @380; EN 51:13655 @1920, 2065:1486 @1440, 2065:1663 @1280, 2066:1737 @1024 …;
//   геометрия EN такая же, кроме ширины текстовой колонки кейса 2 на 1440 и 1280 (Р3, Р44: эталон — экран своей локали).
// «Компоненты» → Case card; ТЗ → «Главная» п. 2. Кейс 1 целиком — одна ссылка на кейс (Р31, фокус Р46);
// кейсы 2–4 с тегом «скоро кейс» — без ссылки, курсор обычный, hover фото есть (Р7, Р1 — в CaseImage).
// Названия кейсов — h3 (Р56). Раскладка раздела «Проекты» (отступы между карточками, колонки) — страница.
// Фото — CaseImage (радиус и пропорции рамки по кейсу и ширине — там).
// Рамки фото, текстовые колонки, позиции и высота Featured на ≥ 1024 — доли ширины карточки (Layout фрейма своей
// ширины: 998 / 1250 / 1408 / 1880); на контрольных ширинах равны фрейму, между ними растут вместе с рядом.
// На 768 и 380 — ширина карточки. Перенос в названиях — по ширине блока, ТЗ п. 6 (ручных переносов нет).
// Н26 — решение владельца 20.11.2026: размеры карточек на промежуточных ширинах — доли ширины ряда, пропорционально.
import CaseImage from '~/components/CaseImage.vue'
import Tag from '~/components/Tag.vue'

const props = defineProps<{
  /** Номер кейса на главной (1–4): 1 — Featured, 2 — Media Left, 3 — Media Right, 4 — Media Wide. */
  n: 1 | 2 | 3 | 4
  /** Атрибут loading фото. По умолчанию: кейс 1 — eager, кейсы 2–4 — lazy. */
  loading?: 'lazy' | 'eager'
}>()

const { locale } = useI18n()

// Н25 — решение владельца 20.11.2026: кейс 1 — eager (на 380/768 в первом экране, LCP), остальные lazy.
const imgLoading = computed(() => props.loading ?? (props.n === 1 ? 'eager' : 'lazy'))

const NuxtLinkLocale = resolveComponent('NuxtLinkLocale')

// Р31: страница кейса. Только кейс 1 — ссылка.
const root = computed(() => (props.n === 1 ? NuxtLinkLocale : 'div'))
const rootProps = computed(() => (props.n === 1 ? { to: '/cases/pharmacy-rebranding' } : {}))
</script>

<template>
  <component
    :is="root"
    v-bind="rootProps"
    class="case-card"
    :class="[`case-card--${n}`, { 'case-card--en': locale === 'en' }]"
  >
    <CaseImage
      class="case-card__media"
      :n="n"
      :alt="$t(`alt.home.case${n}`)"
      :loading="imgLoading"
    />
    <div class="case-card__text">
      <!-- Tag: Default на 1920–1280, Small на 1024–380 («Компоненты»); оба в DOM, лишний скрыт CSS -->
      <template v-if="n !== 1">
        <Tag class="case-card__tag case-card__tag--default" size="default" />
        <Tag class="case-card__tag case-card__tag--small" size="small" />
      </template>
      <h3 class="case-card__title">{{ $t(`home.cases.case${n}.title`) }}</h3>
      <p class="case-card__year">{{ $t(`home.cases.case${n}.year`) }}</p>
    </div>
  </component>
</template>

<style scoped>
/* ---------- База = 380 (Mobile Featured 2046:1040, Mobile Stacked 2046:1050; экран 35:2468) ---------- */
.case-card {
  /* Радиус карточки Featured: Radius/28 на всех ширинах (20 / 17 / 18 / 21 / 22 / 28) */
  --cc-radius: var(--radius-28);
  /* Шаг заголовок–год и тег–заголовок: Spacing/16 на всех ширинах (4 / 10 / 10 / 12 / 13 / 16) */
  --cc-text-gap: var(--space-16);
  --cc-stack-gap: var(--space-20); /* Figma 35:2479 @380: фото → заголовок, 8 */
  --cc-tag-inset: var(--space-28); /* Figma 35:2480 @380: тег от угла фото, 16 */
  --cc-feat-pad: var(--space-24); /* Figma 35:2475 @380: 12 */
  /* Н24 — решение владельца 20.11.2026: высота Featured на 380 по RU (в EN Figma 271, здесь по RU) */
  --cc-feat-pad-bottom: var(--space-28); /* Figma 35:2475 @380: 303 − (247 + 40) = 16; Н24 */
  --cc-feat-gap: 40px; /* Figma 35:2475 @380: фото (низ 207) → заголовок (247); Н24 */

  /* Н51 — владелец 24.11.2026: каждый кейс — экран окна на всех ширинах. Поле кейса сверху и снизу = Spacing/24
     (как отступ раздела на 380); на ≥ 1024 — свои значения ниже. TODO(question): new Н51 */
  --cc-pad-y: var(--space-24);
  --cc-screen-h: 100vh;
  --cc-avail-h: calc(100vh - 2 * var(--cc-pad-y));

  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--cc-stack-gap);
  min-width: 0;
  color: var(--color-black);
  text-decoration: none;
}

@supports (height: 100svh) {
  .case-card {
    --cc-screen-h: 100svh;
    --cc-avail-h: calc(100svh - 2 * var(--cc-pad-y));
  }
}

/* < 1024: карточка занимает экран, фото забирает всё свободное место (растёт или уменьшается), текст и год — как есть */
.case-card:not(.case-card--1) {
  min-height: var(--cc-screen-h);
  padding-block: var(--cc-pad-y);
}

/* Н51 — владелец 24.11.2026: подпись «Проекты» в одном экране с кейсом 1. Остановка — верх раздела, поэтому кейс 1
   ниже на --cc-top-reserve (поле раздела + подпись + зазор; задаёт страница) и на поле снизу; без резерва — как остальные. */
.case-card--1 {
  --cc-avail-h-1: calc(var(--cc-screen-h) - var(--cc-pad-y) - var(--cc-top-reserve, var(--cc-pad-y)));

  height: var(--cc-avail-h-1);
  gap: var(--cc-feat-gap);
  padding: var(--cc-feat-pad) var(--cc-feat-pad) var(--cc-feat-pad-bottom);
  border-radius: var(--cc-radius);
  background: var(--color-black);
  color: var(--color-extra-white);
}

.case-card .case-card__media {
  flex: 1 1 0;
  min-height: 0;
  aspect-ratio: auto;
}

.case-card__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--cc-text-gap);
  min-width: 0;
}

.case-card__title {
  margin: 0;
  font-size: var(--fs-h5);
  line-height: var(--lh-h5);
  font-weight: var(--fw-medium);
}

.case-card__year {
  display: none; /* на 380 года нет ни у одного кейса */
  margin: 0;
  font-size: var(--fs-txt-3);
  line-height: var(--lh-txt-3);
  font-weight: var(--fw-regular);
}

.case-card--1 .case-card__year {
  color: var(--color-white);
}

.case-card .case-card__tag--default {
  display: none;
}

/* 380: тег поверх фото в правом верхнем углу (отступ 16), заголовок под фото */
.case-card .case-card__tag--small {
  position: absolute;
  top: calc(var(--cc-pad-y) + var(--cc-tag-inset));
  right: var(--cc-tag-inset);
}

/* ---------- 768 (Featured 2064:1545, Stacked 2064:1549) ---------- */
@media (min-width: 768px) {
  .case-card {
    --cc-stack-gap: 16px; /* Figma 2064:1549 @768: фото → блок тега и заголовка */
    --cc-feat-pad: var(--space-40); /* Figma 2064:1544 @768: 24 */
    --cc-feat-pad-bottom: var(--space-40); /* Figma 2064:1544 @768: 24 */
    --cc-feat-gap: var(--space-40); /* Figma 2064:1544 @768: текст (низ 84) → фото (108), 24 */
  }

  /* Featured на 768: текст сверху, фото под ним */
  .case-card--1 .case-card__text {
    order: -1;
  }

  .case-card--1 .case-card__year {
    display: block; /* на 768 год только у кейса 1 */
  }

  /* тег уходит из фото в поток: под фото, над заголовком */
  .case-card .case-card__tag--small {
    position: static;
  }
}

/* ---------- ≥ 1024: Featured — абсолютный текст в углу; Media — ряд (Media Left / Right / Wide) ----------
   Все размеры — числа фрейма своей ширины (без единиц) и доли ширины карточки --cc-layout (ширина Layout):
   calc(число / --cc-layout * 100%). На контрольной ширине карточка = Layout, значения равны фрейму. Н26 */
@media (min-width: 1024px) {
  .case-card {
    /* Figma 2064:1431 (Layout), 2064:1432 / 2064:1437 / 2064:1444 / 2064:1451 @1024 */
    --cc-layout: 998; /* 2064:1431 */
    --cc-feat-h: 671; /* 2064:1432 */
    --cc-feat-img-top: 127; /* 2064:1433 */
    --cc-feat-img-h: 459; /* 2064:1433, высота рамки фото (782 × 459) */
    --cc-gap-top: 38; /* 127 − 23 − (32 + 10 + 24): низ текста → фото; 2064:1433, 2064:1434 */
    --cc-gap-bot: 85; /* 671 − 127 − 459: фото → низ карточки; 2064:1432 */
    --cc-feat-text-x: 21; /* 2064:1434 */
    --cc-feat-text-y: 23; /* 2064:1434 */
    --cc-feat-text-w: 622; /* 2064:1434 */
    --cc-text-w-2: 385; /* 2064:1439; EN 2066:1757 — то же */
    --cc-text-w-3: 381; /* 2064:1445 */
    /* высота рамки фото, Figma 2064:1438 / 2064:1449 / 2064:1456 @1024 (как --case-image-ratio в CaseImage) */
    --cc-img-h-2: 314.667;
    --cc-img-h-3: 362;
    --cc-img-h-4: 402;
    --cc-media-gap: var(--space-32); /* фото ↔ текст: 21 / 24 / 26 / 32 */
  }

  .case-card:not(.case-card--1) {
    flex-direction: row;
    gap: var(--cc-media-gap);
  }

  /* Н47 — владелец 24.11.2026: кейс 1 по высоте окна — уменьшается только фото, ширина и текст как во фрейме
     Высота карточки = min(пропорциональная, окно − зазор сверху и снизу (как между карточками, --space-48)).
     --cc-u — одна единица фрейма в px (доля ширины карточки), --cc-h — итоговая высота карточки. */
  .case-card {
    --cc-pad-y: var(--space-48);
    --cc-screen-h: calc(100vh / var(--site-zoom)); /* Н51, Н50 */
    --cc-avail-h: calc(100vh / var(--site-zoom) - 2 * var(--space-48));
  }

  @supports (height: 100svh) {
    .case-card {
      --cc-screen-h: calc(100svh / var(--site-zoom));
      --cc-avail-h: calc(100svh / var(--site-zoom) - 2 * var(--space-48));
    }
  }

  .case-card--1 {
    --cc-u: calc(100cqw / var(--cc-layout));
    --cc-h: min(calc(var(--cc-feat-h) * var(--cc-u)), var(--cc-avail-h-1));

    display: block;
    container-type: inline-size;
    height: auto;
    aspect-ratio: var(--cc-layout) / var(--cc-feat-h);
    max-height: var(--cc-avail-h-1);
    padding: 0;
  }

  /* Н47 — владелец 24.11.2026: фото кейса 1 не кадрируется; при низком окне сжимаются поля, затем фото целиком.
     Рамка всегда в пропорциях рамки фрейма (--case-image-w : --cc-feat-img-h), по центру. Поля — зазор «низ текста →
     фото» (--cc-gap-top) и «фото → низ карточки» (--cc-gap-bot) во фрейме своей ширины; при нехватке высоты окна
     сначала сжимаются они (пропорционально, не меньше --space-24), потом фото (не больше рамки фрейма). Окно высокое —
     всё как во фрейме. Высота текста = h5 + gap + txt-3 (одна строка заголовка). */
  .case-card--1 {
    --cc-text-h: calc(var(--lh-h5) + var(--cc-text-gap) + var(--lh-txt-3));
    --cc-tb: calc(var(--cc-feat-text-y) * var(--cc-u) + var(--cc-text-h)); /* низ блока текста */
    --cc-g1: calc(var(--cc-gap-top) * var(--cc-u));
    --cc-g2: calc(var(--cc-gap-bot) * var(--cc-u));
    --cc-pf: calc(var(--cc-feat-img-h) * var(--cc-u)); /* высота рамки во фрейме */
    --cc-a: calc(var(--cc-h) - var(--cc-tb));
    --cc-deficit: max(calc(var(--cc-pf) + var(--cc-g1) + var(--cc-g2) - var(--cc-a)), 0px);
    --cc-w1: calc(var(--cc-gap-top) / (var(--cc-gap-top) + var(--cc-gap-bot)));
    --cc-g1-eff: min(var(--cc-g1), max(var(--space-24), calc(var(--cc-g1) - var(--cc-deficit) * var(--cc-w1))));
    --cc-g2-eff: min(
      var(--cc-g2),
      max(var(--space-24), calc(var(--cc-g2) - var(--cc-deficit) * (1 - var(--cc-w1))))
    );
    --cc-ph: max(min(var(--cc-pf), calc(var(--cc-a) - var(--cc-g1-eff) - var(--cc-g2-eff))), 0px);
  }

  .case-card--1 .case-card__media {
    position: absolute;
    flex: none;
    aspect-ratio: auto;
    top: calc(var(--cc-tb) + var(--cc-g1-eff));
    left: 50%;
    transform: translateX(-50%);
    height: var(--cc-ph);
    width: calc(var(--cc-ph) * var(--case-image-w) / var(--cc-feat-img-h));
  }

  .case-card--1 .case-card__text {
    position: absolute;
    top: calc(var(--cc-feat-text-y) * var(--cc-u));
    left: calc(var(--cc-feat-text-x) / var(--cc-layout) * 100%);
    width: calc(var(--cc-feat-text-w) / var(--cc-layout) * 100%);
  }

  /* Н51 — владелец 24.11.2026: каждый кейс 2–4 — экран окна. Карточка = высота окна, ряд по центру по вертикали;
     уменьшается только фото (как у кейса 1): высота = min(высота рамки фрейма как доля ряда, окно − 2 × --space-48),
     ширина — по пропорции рамки (CaseImage). Если окно высокое — фото как во фрейме, вокруг больше воздуха.
     --cc-img-h — высота рамки фото своей ширины фрейма (число, без единиц), задаётся ниже по ширинам. */
  .case-card:not(.case-card--1) {
    --cc-u: calc(100cqw / var(--cc-layout));
    --cc-photo-h: min(calc(var(--cc-img-h) * var(--cc-u)), var(--cc-avail-h));
    /* то же в процентах ширины ряда: для padding самой карточки (cqw на самом контейнере не работает) */
    --cc-photo-h-pct: min(calc(var(--cc-img-h) / var(--cc-layout) * 100%), var(--cc-avail-h));

    container-type: inline-size;
    min-height: 0;
    padding-block: calc((var(--cc-screen-h) - var(--cc-photo-h-pct)) / 2);
  }

  .case-card--2 {
    --cc-img-h: var(--cc-img-h-2);
  }

  .case-card--3 {
    --cc-img-h: var(--cc-img-h-3);
  }

  .case-card--4 {
    --cc-img-h: var(--cc-img-h-4);
  }

  /* фото — рамка своей ширины фрейма как доля ряда (число --case-image-w, пропорции и радиус — в CaseImage);
     при нехватке высоты окна рамка укорачивается, картинка кадрируется (Н47: фото не сужается) */
  .case-card:not(.case-card--1) .case-card__media {
    flex: none;
    aspect-ratio: auto;
    width: calc(var(--case-image-w) / var(--cc-layout) * 100%);
    height: var(--cc-photo-h);
  }

  .case-card .case-card__tag--small {
    position: static;
  }

  .case-card--2 .case-card__text {
    flex: none;
    width: calc(var(--cc-text-w-2) / var(--cc-layout) * 100%);
  }

  /* Media Right: текст слева от фото, прижат к низу, текст и тег по правому краю */
  .case-card--3 {
    justify-content: flex-end;
    align-items: flex-end;
  }

  .case-card--3 .case-card__text {
    order: -1;
    flex: none;
    align-items: flex-end;
    width: calc(var(--cc-text-w-3) / var(--cc-layout) * 100%);
    text-align: right;
  }

  /* Media Wide: текст справа от фото, прижат к низу, занимает остаток ряда */
  .case-card--4 {
    align-items: flex-end;
  }

  .case-card--4 .case-card__text {
    flex: 1 1 0;
  }

  .case-card__year {
    display: block;
  }
}

/* ---------- 1280 (Layout 2063:1473; 2063:1474 …; EN 2065:1663 …) ---------- */
@media (min-width: 1280px) {
  .case-card {
    --cc-layout: 1250; /* 2063:1473 */
    --cc-feat-h: 839; /* 2063:1474 */
    --cc-feat-img-top: 159; /* 2063:1475 */
    --cc-feat-img-h: 574; /* 2063:1475, высота рамки фото */
    --cc-gap-top: 54; /* 159 − 29 − (36 + 12 + 28); 2063:1475, 2063:1476 */
    --cc-gap-bot: 106; /* 839 − 159 − 574; 2063:1474 */
    --cc-feat-text-x: 27; /* 2063:1476 */
    --cc-feat-text-y: 29; /* 2063:1476 */
    --cc-feat-text-w: 711; /* 2063:1476 */
    --cc-text-w-2: 543; /* 2063:1481 */
    --cc-text-w-3: 476; /* 2063:1487 */
    /* высота рамки фото, Figma 2063:1480 / 2063:1492 / 2063:1494 @1280 */
    --cc-img-h-2: 393.333;
    --cc-img-h-3: 452;
    --cc-img-h-4: 503;
  }

  .case-card--en {
    --cc-text-w-2: 481; /* Figma 2065:1683 @1280 (EN) */
  }

  .case-card .case-card__tag--default {
    display: inline-flex;
  }

  .case-card .case-card__tag--small {
    display: none;
  }
}

/* ---------- 1440 (Layout 2063:1361; 2063:1362 …; EN 2065:1486 …) ---------- */
@media (min-width: 1440px) {
  .case-card {
    --cc-layout: 1408; /* 2063:1361 */
    --cc-feat-h: 944; /* 2063:1362 */
    --cc-feat-img-top: 179; /* 2063:1363 */
    --cc-feat-img-h: 646; /* 2063:1363, высота рамки фото */
    --cc-gap-top: 63; /* 179 − 33 − (40 + 13 + 30); 2063:1363, 2063:1364 */
    --cc-gap-bot: 119; /* 944 − 179 − 646; 2063:1362 */
    --cc-feat-text-x: 30; /* 2063:1364 */
    --cc-feat-text-y: 33; /* 2063:1364 */
    --cc-feat-text-w: 799; /* 2063:1364 */
    --cc-text-w-2: 627; /* 2063:1369 */
    --cc-text-w-3: 536; /* 2063:1375 */
    /* высота рамки фото, Figma 2063:1368 / 2063:1380 / 2063:1382 @1440 */
    --cc-img-h-2: 442.5;
    --cc-img-h-3: 509;
    --cc-img-h-4: 566;
  }

  .case-card--en {
    --cc-text-w-2: 541; /* Figma 2065:1506 @1440 (EN) */
  }
}

/* ---------- 1920 (Layout 35:2178; 35:2179 …; EN 51:13655 …) ---------- */
@media (min-width: 1920px) {
  .case-card {
    --cc-layout: 1880; /* 35:2178 */
    --cc-feat-h: 1258; /* 35:2179 */
    --cc-feat-img-top: 199; /* 35:2180 */
    --cc-feat-img-h: 861; /* 35:2180, высота рамки фото */
    --cc-gap-top: 55; /* 199 − 44 − (48 + 16 + 36); 35:2180, 35:2181 */
    --cc-gap-bot: 198; /* 1258 − 199 − 861; 35:2179 */
    --cc-feat-text-x: 40; /* 35:2181 */
    --cc-feat-text-y: 44; /* 35:2181 */
    --cc-feat-text-w: 977; /* 35:2181 */
    --cc-text-w-2: 721; /* 35:2186 */
    --cc-text-w-3: 714; /* 35:2190 */
    /* высота рамки фото, Figma 35:2185 / 35:2195 / 35:2197 @1920 */
    --cc-img-h-2: 590;
    --cc-img-h-3: 678;
    --cc-img-h-4: 754;
  }

  .case-card--en {
    --cc-text-w-2: 721; /* Figma 51:13675 @1920 (EN) — как RU */
  }
}
</style>
