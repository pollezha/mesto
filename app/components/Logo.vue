<script setup lang="ts">
// Logo — «Компоненты» → «Навигация» → Logo; Figma 30:2908 (Color: Blue / White · Local: RU / EN).
// Только изображение: ссылку на главную и плавный скролл (Р68, Р69) делают места использования
// (NavBar, полоса Menu, PageHeader). Размер задаёт место использования шириной корня
// (класс или обёртка), высота — по пропорциям вектора своего варианта.
// Вектор — экспорт Figma без правки (app/assets/images/logo-*.svg), используется как маска,
// цвет — токен: Blue → --color-blue-500 (Brand Blue/500), White → --color-white (Achromatic/White).

type LogoColor = 'Blue' | 'White'
type LogoLocal = 'RU' | 'EN'

const props = defineProps<{
  /** Figma «Color»: Blue — на светлом, White — на тёмном. */
  color?: LogoColor
  /** Figma «Local»: RU — «МЕСТО», EN — «MESTO». Не задан — по текущей локали сайта. */
  local?: LogoLocal
}>()

const { locale, t } = useI18n()

const variantColor = computed<LogoColor>(() => props.color ?? 'Blue')
// Local выбирает только вектор; на сайте он всегда равен языку страницы (А7).
const variantLocal = computed<LogoLocal>(() => props.local ?? (locale.value === 'en' ? 'EN' : 'RU'))

// Текст альтернативы — текущей локали страницы.
// Н8 — решение владельца 20.11.2026: оставить «МЕСТО» / «MESTO» (logo.label — слово логотипа, Figma 30:2908).
const label = computed(() => t('logo.label'))
</script>

<template>
  <span
    class="logo"
    :class="[`logo--${variantColor.toLowerCase()}`, `logo--${variantLocal.toLowerCase()}`]"
    role="img"
    :aria-label="label"
  />
</template>

<style scoped>
.logo {
  /* Пропорции векторов вариантов (размер символа в Figma, не зависит от ширины экрана). */
  --logo-ratio-ru: 215.987 / 49.9585; /* Figma 5:373, 30:2909 @все ширины */
  --logo-ratio-en-blue: 218 / 49; /* Figma 38:12695 @все ширины */
  --logo-ratio-en-white: 218.04 / 49.0765; /* Figma 38:12676 @все ширины */

  display: block;
  width: 100%;
  aspect-ratio: var(--logo-ratio-ru);
  background-color: var(--color-blue-500);
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.logo--white {
  background-color: var(--color-white);
}

.logo--blue.logo--ru {
  -webkit-mask-image: url('~/assets/images/logo-blue-ru.svg');
  mask-image: url('~/assets/images/logo-blue-ru.svg');
}

.logo--white.logo--ru {
  -webkit-mask-image: url('~/assets/images/logo-white-ru.svg');
  mask-image: url('~/assets/images/logo-white-ru.svg');
}

.logo--blue.logo--en {
  aspect-ratio: var(--logo-ratio-en-blue);
  -webkit-mask-image: url('~/assets/images/logo-blue-en.svg');
  mask-image: url('~/assets/images/logo-blue-en.svg');
}

.logo--white.logo--en {
  aspect-ratio: var(--logo-ratio-en-white);
  -webkit-mask-image: url('~/assets/images/logo-white-en.svg');
  mask-image: url('~/assets/images/logo-white-en.svg');
}
</style>
