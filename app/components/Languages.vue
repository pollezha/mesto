<script setup lang="ts">
// Languages — переключатель RU / EN. Figma 4:323 (Mode: Light / Dark · Language: Russian / English);
// «Компоненты» → «Навигация» → Languages. Где стоит: на ≥ 1024 — полоса Menu, на < 1024 — строка
// в футере (Р23, Р43; В4 — расположение в футере как сейчас в Figma). Положение задаёт родитель.
// Свойство Figma Language (какой язык активен) не prop: активный язык — текущая локаль.

type LanguageCode = 'ru' | 'en'

withDefaults(
  defineProps<{
    /** Mode в Figma: Light — на светлом фоне, Dark — на тёмном (полоса Menu кейса). */
    mode?: 'light' | 'dark'
  }>(),
  { mode: 'light' },
)

const { locale, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()

// Порядок как в Figma: RU, затем EN.
const codes: LanguageCode[] = ['ru', 'en']

const items = computed(() =>
  codes.map((code) => ({
    code,
    label: code === 'ru' ? t('languages.ru') : t('languages.en'),
    active: locale.value === code,
    // ТЗ → «Маршруты» (Р21, Р60): та же страница в другой локали; на 404 (catch-all) — тот же адрес
    // с /en/ или без. У RU-документов без EN-версии (/consent, /newsletter-consent — EN-маршрут
    // выключен, «Инфраструктура» → «Стек») switchLocalePath возвращает '' → /en/privacy (ТЗ → «Маршруты»).
    to: switchLocalePath(code) || localePath('/privacy', code),
  })),
)
</script>

<template>
  <div class="languages" :class="`languages--${mode}`">
    <NuxtLink
      v-for="item in items"
      :key="item.code"
      :to="item.to"
      :aria-current="item.active ? 'page' : undefined"
      class="languages__link"
      :class="{ 'languages__link--active': item.active }"
    >
      {{ item.label }}
    </NuxtLink>
  </div>
</template>

<style scoped>
/*
 * Геометрия и текст переопределяются местом использования через публичные переменные
 * (задать на предке или на самом компоненте через класс):
 *   --languages-font-size, --languages-line-height, --languages-gap, --languages-pad-y.
 * Не заданы — значения по умолчанию ниже (--_languages-*): полоса Menu (≥ 1024) и строка в футере (< 1024).
 * Н9 — решение владельца 20.11.2026: везде один размер (полоса Menu главной), в Page header без переопределений.
 */
.languages {
  /* 380 и 768: gap 32 и вертикальный паддинг кнопки 31 не масштабируются
     (Figma I2046:1065;2152:546 @380, I2064:1583;2141:6417 @768) — в ките такого значения на этих ширинах нет.
     TODO(question): В4 — положение строки RU/EN в футере на < 1024 ждёт проверки дизайнера (Р43) */
  --_languages-gap: 32px; /* Figma I2046:1065;2152:546 @380 */
  --_languages-pad-y: 31px; /* Figma I2046:1065;2152:546 @380 */

  display: flex;
  align-items: center;
  gap: var(--languages-gap, var(--_languages-gap));
}

/* Цвета («Компоненты» → Languages; Figma 4:322 / 4:339 Light, 4:324 / 4:334 Dark) */
.languages--light {
  --_languages-color: var(--color-black-a50); /* Alpha/Black 50 — неактивный */
  --_languages-color-active: var(--color-black); /* Achromatic/Black — активный */
}

.languages--dark {
  --_languages-color: var(--color-white-a50); /* Alpha/White 50 — неактивный */
  --_languages-color-active: var(--color-white); /* Achromatic/White — активный */
}

.languages__link {
  display: block;
  padding-block: var(--languages-pad-y, var(--_languages-pad-y));
  color: var(--_languages-color);
  /* Caption 2 — токены своей ширины (по умолчанию) */
  font-size: var(--languages-font-size, var(--fs-caption-2));
  line-height: var(--languages-line-height, var(--lh-caption-2));
  font-weight: var(--fw-medium);
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  /* ТЗ → «Общие правила» п. 10, Р62: 300 мс ease-out */
  transition:
    color 300ms ease-out,
    opacity 300ms ease-out;
}

.languages__link--active {
  color: var(--_languages-color-active);
}

/* Hover только с мышью (ТЗ → «Общие правила» п. 10, Р62) */
@media (pointer: fine) {
  /* Light: текст — Brand Blue/500 */
  .languages--light .languages__link:hover {
    color: var(--color-blue-500);
  }

  /* Dark: вместо синего — прозрачность 60 %, неактивный язык становится непрозрачным */
  .languages--dark .languages__link--active:hover {
    opacity: 0.6;
  }

  .languages--dark .languages__link:not(.languages__link--active):hover {
    color: var(--color-white);
  }
}

@media (prefers-reduced-motion: reduce) {
  .languages__link {
    transition: none;
  }
}

/* 768–1023 — как 380 (Figma I2064:1583;2141:6417 @768: gap 32, паддинг 31) */

/* ≥ 1024 — значения по умолчанию из полосы Menu главной и кейса */
@media (min-width: 1024px) {
  .languages {
    --_languages-gap: var(--space-32); /* 21 — Figma 2064:1426 @1024 */
    --_languages-pad-y: 20px; /* Figma 2064:1426 @1024 */
  }
}

@media (min-width: 1280px) {
  .languages {
    /* gap --space-32 = 24 — Figma 2063:1468 @1280 */
    --_languages-pad-y: 23px; /* Figma 2063:1468 @1280 */
  }
}

@media (min-width: 1440px) {
  .languages {
    /* gap --space-32 = 26 — Figma 2063:1356 @1440 */
    --_languages-pad-y: 25px; /* Figma 2063:1356 @1440 */
  }
}

@media (min-width: 1920px) {
  .languages {
    /* gap --space-32 = 32 — Figma 35:2173 @1920 */
    --_languages-pad-y: 31px; /* Figma 35:2173 @1920 */
  }
}
</style>
