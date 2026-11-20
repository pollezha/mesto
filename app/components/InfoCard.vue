<script setup lang="ts">
// InfoCard — Figma Info card 2045:997 (Type: Socials / Mail · Size: Default / Small · Locale: RU / EN);
// docs «Компоненты» → «Страница „Контакты“». Карточки «познакомиться поближе» (соцсети) и «написать нам» (почта).
// Эталон вида — экраны «Контакты» (Р16, Р3): RU 35:4665 @1920, 2061:1237 @1440, 2061:1309 @1280, 2061:1381 @1024,
// 2061:1453 @768, 35:4912 @380; EN 51:15057, 2062:1318, 2062:1404, 2062:1490, 2062:1576, 51:15097.
// Варианты компонента: Socials/Mail Default RU 2045:973 / 2045:979, Small RU 2045:985 / 2045:991,
// EN — 2140:5982 / 2140:5997 / 2140:6002 / 2140:6017.
// Какой вариант на какой ширине (по экранам; вкладка «Компоненты» этого не говорит): Default на 1920–768
// (на 768 — паддинг 22, кегль 24), Small — на 380 (364×247 соцсети, 364×142 почта).
// size="auto" переключает ступенями медиазапросом (только CSS); "default" / "small" фиксируют ступень.
// Локаль — из i18n: RU — одна колонка ссылок, EN — две (config/links.ts → contactsSocials).
// Ширину карточки задаёт ряд на странице (карточки резиновые, Р4); высота — min-height ступени + рост по контенту
// (на RU 1024 и 768 ряд выше, чем на EN, — А4), почта в ряду тянется до высоты соседней карточки (align-items: stretch).
// Линия почты — доля ширины карточки (решение по аналогии с Н26 (владелец, 20.11.2026); остальное — Р16, А4):
// на контрольных ширинах равна значению фрейма, между ними тянется вместе с карточкой.
// Р56: подпись — h2 по умолчанию (prop headingLevel; вид от уровня не зависит).
// Р33: соцсети — новая вкладка; почта — mailto:. Р62: hover — текст, ↗ и линия под почтой Brand Blue/500, 300 мс.
// Фокус с клавиатуры — :focus-visible из base.css (Р46).
import ArrowIcon from '~/components/ArrowIcon.vue'
import {
  contactsSocials,
  links,
  type LinkKey,
  type LinkLocale,
  type SocialKey,
} from '~~/config/links'

const props = withDefaults(
  defineProps<{
    /** Type в Figma. */
    type: 'socials' | 'mail'
    /** Size в Figma; auto — Small на < 768, Default на ≥ 768 (медиазапросом). */
    size?: 'default' | 'small' | 'auto'
    /** Уровень заголовка подписи (Р56: h2). */
    headingLevel?: 2 | 3 | 4 | 5 | 6
  }>(),
  { size: 'auto', headingLevel: 2 },
)

const { t, locale } = useI18n()

const sets: Record<LinkLocale, readonly (readonly LinkKey[])[]> = contactsSocials

const columns = computed(() => {
  const set = sets[locale.value === 'en' ? 'en' : 'ru']
  return set.map((column) =>
    column.filter((key): key is SocialKey => key !== 'email').map((key) => links[key]),
  )
})

const title = computed(() => t(`contacts.${props.type}.title`))
</script>

<template>
  <div
    class="info-card"
    :class="[
      `info-card--${type}`,
      `info-card--${size}`,
      `info-card--${locale === 'en' ? 'en' : 'ru'}`,
    ]"
  >
    <component :is="`h${headingLevel}`" class="info-card__title">{{ title }}</component>

    <div v-if="type === 'socials'" class="info-card__columns">
      <ul v-for="(column, i) in columns" :key="i" class="info-card__list">
        <li v-for="link in column" :key="link.href">
          <a class="info-card__link" :href="link.href" target="_blank" rel="noopener">{{
            link.label
          }}</a>
        </li>
      </ul>
    </div>

    <a v-else class="info-card__mail" :href="links.email.href">
      <span class="info-card__email">{{ t('email') }}</span>
      <ArrowIcon class="info-card__arrow" />
    </a>
  </div>
</template>

<style scoped>
/*
 * Значения — экраны «Контакты» (RU/EN совпадают, если не сказано иное). Токены, где совпадают точно:
 * паддинг = Spacing/36 (36 / 29 / 27 / 23 / 22 на 1920–768, 24 на 380); кегль и межстрочный = Heading 5
 * (44/48, 36/40, 32/36, 28/32, 24/28, 16/20); отступ между ссылками RU = Spacing/24, EN = Spacing/20;
 * зазор колонок EN = Spacing/64; минимальный зазор подпись → ссылки = Spacing/20 (RU 1024: 13, RU 768: 12).
 * Цвета: ExtraWhite (фон), Gray 700 (подпись), Black (ссылки), Brand Blue/500 (hover).
 *
 * Переменные по ступеням (auto и default; small — значения 380):
 *   --_radius, --_line, --_link-w, --_link-pad-b, --_link-shift, --_min-h, --_list-gap, --_cols-gap.
 */

/* ---------- Small: 380 (Figma 35:4920 / 35:4926 @380 RU, 51:15102 / 51:15108 @380 EN); база auto и small ---------- */
.info-card {
  --_radius: var(--radius-36); /* 36 — Figma 35:4920 @380 */
  --_line: 2px; /* Figma 51:13473 @380 (border-b-2) */
  --_link-w: 100%; /* Figma 51:13473 @380: на всю ширину карточки (316) */
  --_link-pad-b: 6.4775px; /* Figma 51:13473 @380: (32.955 − 20) / 2 */
  --_link-shift: 6.4775px; /* Figma 51:13474 @380: текст по центру блока 32.955, иконка прижата к верху */
  --_min-h: 247px; /* Figma 35:4920 @380 (Socials Small); у Mail Small — 142, ниже */
  --_list-gap: 16px; /* Figma 35:4922 @380 (RU); Spacing/24 на 380 = 12, не привязан */
  --_cols-gap: 64px; /* Figma 52:16290 @380 (EN: 140 − 76); Spacing/64 на 380 = 10, не привязан */

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-20); /* минимальный зазор подпись → содержимое: на RU 1024 / 768 — 13 / 12 */
  box-sizing: border-box;
  min-height: var(--_min-h);
  padding: var(--space-36);
  border-radius: var(--_radius);
  background-color: var(--color-extra-white); /* Achromatic/ExtraWhite */
  font-size: var(--fs-h5);
  line-height: var(--lh-h5);
  font-weight: var(--fw-medium); /* Heading 5 */
  color: var(--color-black); /* Achromatic/Black */
}

.info-card--mail {
  --_min-h: 142px; /* Figma 35:4926 @380 (Mail Small) */
}

/* size="default" ниже 768 на сайте не используется (только песочница): токены (--space-*, --fs-h5) берут значения 380,
   локальные переменные ниже — значения ступени 768; на ≥ 768 перекрываются медиазапросами */
.info-card--default {
  --_radius: 22px; /* Figma 2061:1461 @768 */
  --_line: 3.424px; /* Figma 2061:1469 @768, 2061:1397 @1024, 2061:1325 @1280, 2061:1253 @1440, 35:4681 @1920 */
  --_link-w: calc(100% * 320 / 321); /* Figma 2061:1469 @768: 320 из 321 (365 − 2 × 22) */
  --_link-pad-b: 8px; /* Figma 2061:1469 @768 */
  --_link-shift: 0px;
  --_min-h: 0px; /* на 768 высоту задаёт контент: RU 238 (2061:1461), EN 192 (2062:1584) */
  --_list-gap: var(--space-24); /* 14 */
  --_cols-gap: var(--space-64); /* 38 */
}

.info-card__title {
  margin: 0;
  font: inherit; /* Heading 5; вид от уровня h2…h6 не зависит (Р56) */
  color: var(--color-gray-700); /* Achromatic/Gray 700 */
}

/* Колонки ссылок прижаты к низу карточки; в EN вторая колонка стоит по нижней линии первой (Figma 52:15934) */
.info-card__columns {
  display: flex;
  align-items: flex-end;
  column-gap: var(--_cols-gap);
}

.info-card__list {
  display: flex;
  flex-direction: column;
  gap: var(--_list-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

.info-card--en .info-card__list {
  gap: var(--space-20); /* Figma 52:15939 …: 20 / 16 / 15 / 13 / 12 / 8 */
}

.info-card__link {
  color: var(--color-black);
  text-decoration: none;
  white-space: nowrap;
  transition: color 300ms ease-out;
}

/* Почта: ссылка = текст + ↗ + линия снизу (Figma Link 35:4681 …); ↗ = кегль текста (1em) */
.info-card__mail {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  box-sizing: border-box;
  width: var(--_link-w);
  max-width: 100%;
  padding-bottom: var(--_link-pad-b);
  border-bottom: var(--_line) solid var(--color-black); /* Achromatic/Black */
  color: var(--color-black);
  text-decoration: none;
  transition:
    color 300ms ease-out,
    border-color 300ms ease-out;
}

.info-card__email {
  min-width: 0;
  margin-top: var(--_link-shift);
  white-space: nowrap;
}

@media (pointer: fine) {
  .info-card__link:hover {
    color: var(--color-blue-500); /* Р62 */
  }

  .info-card__mail:hover {
    color: var(--color-blue-500); /* текст и ↗ (currentColor) */
    border-color: var(--color-blue-500); /* линия */
  }
}

@media (prefers-reduced-motion: reduce) {
  .info-card__link,
  .info-card__mail {
    transition: none;
  }
}

/* ---------- 768 (Figma 2061:1453 RU, 2062:1576 EN) ---------- */
@media (min-width: 768px) {
  .info-card--auto,
  .info-card--default {
    --_radius: 22px; /* Figma 2061:1461 @768 */
    --_line: 3.424px; /* Figma 2061:1469 @768 */
    --_link-w: calc(100% * 320 / 321); /* Figma 2061:1469 @768: 320 из 321 (365 − 2 × 22) */
    --_link-pad-b: 8px; /* Figma 2061:1469 @768 */
    --_link-shift: 0px;
    --_min-h: 0px;
    --_list-gap: var(--space-24); /* 14 */
    --_cols-gap: var(--space-64); /* 38 */
  }
}

/* ---------- 1024 (Figma 2061:1381 RU, 2062:1490 EN) ---------- */
@media (min-width: 1024px) {
  .info-card--auto,
  .info-card--default {
    --_radius: 23px; /* Figma 2061:1389 @1024 */
    --_link-w: calc(100% * 427 / 445); /* Figma 2061:1397 @1024: 427 из 445 (491 − 2 × 23) */
    --_link-pad-b: 9px; /* Figma 2061:1397 @1024 */
    --_min-h: 254px; /* Figma 2062:1498 @1024 (EN; RU 267 — рост по контенту, 2061:1389) */
  }
}

/* ---------- 1280 (Figma 2061:1309 RU, 2062:1404 EN) ---------- */
@media (min-width: 1280px) {
  .info-card--auto,
  .info-card--default {
    --_radius: 27px; /* Figma 2061:1317 @1280 */
    --_link-w: calc(100% * 533 / 562); /* Figma 2061:1325 @1280: 533 из 562 (616 − 2 × 27) */
    --_link-pad-b: 11px; /* Figma 2061:1325 @1280 */
    --_min-h: 325px; /* Figma 2061:1317 @1280 */
  }
}

/* ---------- 1440 (Figma 2061:1237 RU, 2062:1318 EN) ---------- */
@media (min-width: 1440px) {
  .info-card--auto,
  .info-card--default {
    --_radius: 29px; /* Figma 2061:1245 @1440 */
    --_link-w: calc(100% * 600 / 636.5); /* Figma 2061:1253 @1440: 600 из 636.5 (694.5 − 2 × 29) */
    --_link-pad-b: 11px; /* Figma 2061:1253 @1440 */
    --_min-h: 371px; /* Figma 2061:1245 @1440 */
  }
}

/* ---------- 1920 (Figma 35:4665 RU, 51:15057 EN) ---------- */
@media (min-width: 1920px) {
  .info-card--auto,
  .info-card--default {
    --_radius: var(--radius-36); /* 36 — Figma 35:4673 @1920 */
    --_link-w: calc(100% * 800 / 856); /* Figma 35:4681 @1920: 800 из 856 (928 − 2 × 36) */
    --_link-pad-b: 14px; /* Figma 35:4681 @1920 */
    --_min-h: 503px; /* Figma 35:4673 @1920 */
  }
}
</style>
