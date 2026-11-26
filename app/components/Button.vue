<script setup lang="ts">
// Button — Figma 1:1748 (Type: Primary / Secondary / With Icon · State: Default / Hover / Pressed ·
// Device: Desktop / Mobile); docs «Компоненты» → «Кнопки и иконки».
// Вариант Device выбирает место использования («Какой вариант на какой ширине»): Desktop на ≥ 1024,
// Mobile на 768 и 380. device="auto" — то же медиазапросом (Mobile, на ≥ 1024 Desktop), без JS.
// Где стоит: форма (Primary во всю ширину), раскрытый блок услуг (Secondary ≥ 1280 убрана по Н63 — сейчас на сайте не используется),
// 404 (Primary-ссылка на главную), cookie-баннер (размеры переопределяет CookieBanner, Р73 —
// через CSS-переменные --button-*, см. стили). With Icon на экранах сайта не стоит
// («Компоненты» → Icon/Arrow Up Right; кнопка навбара — фрейм Link внутри NavBar).
// State не prop: Hover — :hover (только pointer: fine), Pressed — :active. Фокус — глобальный
// :focus-visible из base.css (Р46).
import ArrowIcon from '~/components/ArrowIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Type в Figma. */
    type?: 'primary' | 'secondary' | 'with-icon'
    /** Device в Figma; auto — Mobile ниже 1024 и Desktop на ≥ 1024 (медиазапросом, без JS). */
    device?: 'desktop' | 'mobile' | 'auto'
    /** Идёт отправка (ТЗ → «Форма» п. 3): aria-busy, клики игнорируются, вид не меняется. Только для <button>. */
    busy?: boolean
    /** Атрибут type у <button> (в форме — submit). */
    nativeType?: 'button' | 'submit' | 'reset'
    /** Внутренняя ссылка (путь без префикса локали) → NuxtLinkLocale (404 — на главную); без to — <button>. */
    to?: string
  }>(),
  {
    type: 'primary',
    device: 'desktop',
    busy: false,
    nativeType: 'button',
    to: undefined,
  },
)

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const NuxtLinkLocale = resolveComponent('NuxtLinkLocale')

const tag = computed(() => {
  if (props.to) return NuxtLinkLocale
  return 'button'
})

const bindings = computed(() => {
  if (props.to) return { to: props.to }
  return { type: props.nativeType, 'aria-busy': props.busy ? 'true' : undefined }
})

function onClick(event: MouseEvent) {
  // ТЗ → «Форма» п. 3: во время отправки кнопка не нажимается (без disabled — вид и фокус остаются)
  if (props.busy && !props.to) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="tag"
    v-bind="bindings"
    class="button"
    :class="[`button--${type}`, `button--${device}`]"
    @click="onClick"
  >
    <span class="button__label"><slot /></span>
    <ArrowIcon v-if="type === 'with-icon'" class="button__icon" />
  </component>
</template>

<style scoped>
/*
 * Размеры задаются внутренними переменными --_button-* по варианту. Место использования может
 * переопределить их публичными --button-pad-y, --button-pad-x, --button-radius, --button-min-height,
 * --button-fs, --button-lh, --button-gap (на кнопке или предке) — так CookieBanner задаёт 64/40 и
 * Caption 2 (Р73), цвета и состояния остаются от Button.
 * Высота в Figma у Primary/Secondary — hug (паддинги + межстрочный), поэтому min-height только у With Icon Desktop.
 */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--button-gap, var(--_button-gap, 0));
  box-sizing: border-box;
  min-height: var(--button-min-height, var(--_button-min-height, 0));
  margin: 0;
  padding: var(--button-pad-y, var(--_button-pad-y)) var(--button-pad-x, var(--_button-pad-x));
  border: 0;
  border-radius: var(--button-radius, var(--_button-radius));
  background-color: var(--_button-bg);
  color: var(--_button-color);
  font-size: var(--button-fs, var(--_button-fs));
  line-height: var(--button-lh, var(--_button-lh));
  font-weight: var(--fw-medium);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  /* Текст в Figma — auto width (whitespace-nowrap), 1:1750 / 1:1758 */
  white-space: nowrap;
  /* «Компоненты» → Button: смена фона 300 мс ease-out */
  transition: background-color 300ms ease-out;
}

/* Идёт отправка: клики игнорируются — курсор progress (disabled у кнопки нет) */
.button[aria-busy='true'] {
  cursor: progress;
}

/* ---------- Цвета по состояниям («Компоненты» → Button, таблица; Figma 1:1749 / 1:1751 / 1:1753,
   1:1757 / 1:1761 / 1:1765, 2091:2923 / 2091:3484 / 2091:3492) ---------- */
.button--primary,
.button--with-icon {
  --_button-bg: var(--color-blue-500); /* Brand Blue/500 — Default */
  --_button-color: var(--color-white); /* Achromatic/White */
}

.button--secondary {
  --_button-bg: var(--color-white); /* Achromatic/White — Default */
  --_button-color: var(--color-black); /* Achromatic/Black */
}

/* Hover только с мышью (ТЗ → «Интерактив»: hover — pointer: fine) */
@media (pointer: fine) {
  .button--primary:hover,
  .button--with-icon:hover {
    --_button-bg: var(--color-blue-600); /* Brand Blue/600 — Hover */
  }

  .button--secondary:hover {
    --_button-bg: var(--color-gray-200); /* Achromatic/Gray 200 — Hover */
  }
}

/* Pressed. Во время отправки (aria-busy) кнопка не нажимается — Pressed не показывается (ТЗ → «Форма» п. 3) */
.button--primary:not([aria-busy='true']):active,
.button--with-icon:not([aria-busy='true']):active {
  --_button-bg: var(--color-blue-700); /* Brand Blue/700 — Pressed */
}

.button--secondary:not([aria-busy='true']):active {
  --_button-bg: var(--color-gray-300); /* Achromatic/Gray 300 — Pressed */
}

/* ---------- Primary / Secondary, Desktop (≥ 1024) ----------
 * На экранах паддинги и радиус меняются по ширине и точно равны токенам своей ширины:
 * 1920 — 36/24, радиус 24, высота 88 (форма I2074:5748;2045:906, 404 2151:3573 — как компонент 1:1749);
 * 1440 — 29/19, 19, 70 (форма I2074:5790;2045:906, CTA главной I2063:1400;2073:156;2045:906, EN I2065:1535;2092:6735;2045:921);
 * 1280 — 27/18, 18, 66 (форма I2074:5811;2045:906); 1024 — 23/16, 16, 58 (форма I2074:5832;2045:906).
 * = Spacing/36 × Spacing/24, Radius/24; текст Caption 1 своей ширины.
 * Secondary в раскрытом блоке услуг на 1440/1280 на экране другой: фиксированные 36/24, радиус 24, высота 80/78
 * (Figma I2063:1395;8:414 @1440, I2063:1507;8:414 @1280). Каждое место — по своему экрану (Р3), EN-блоки услуг —
 * по геометрии RU (Р75), поэтому эти значения задаёт ServicesBlock через --button-pad-x / --button-pad-y /
 * --button-radius; здесь — значения формы.
 */
.button--primary.button--desktop,
.button--secondary.button--desktop {
  --_button-pad-y: var(--space-24);
  --_button-pad-x: var(--space-36);
  --_button-radius: var(--radius-24);
  --_button-fs: var(--fs-caption-1);
  --_button-lh: var(--lh-caption-1);
}

/* ---------- Primary / Secondary, Mobile (768 и 380) ----------
 * На 768 и 380 одинаково, в режиме Mobile (Р72: в форме Small кнопка 14): паддинги 12/24, радиус 12,
 * Caption 1 14/18, высота 42. На 768 токены своей ширины другие (Spacing/24 = 14, Caption 1 = 18/22),
 * поэтому значения фиксированные. Figma 2043:1658 / 2043:1666; I2074:5853;2045:942 @768,
 * I2074:5769;2045:942 @380, 404 2151:3644 @380.
 */
.button--primary.button--mobile,
.button--secondary.button--mobile,
.button--primary.button--auto,
.button--secondary.button--auto {
  --_button-pad-y: 12px; /* Figma I2074:5853;2045:942 @768, I2074:5769;2045:942 @380 */
  --_button-pad-x: 24px; /* Figma I2074:5853;2045:942 @768, I2074:5769;2045:942 @380 */
  --_button-radius: var(--radius-12); /* Radius/12 — 12 на всех ширинах */
  --_button-fs: 14px; /* Figma I2074:5853;2045:942 @768, I2074:5769;2045:942 @380: font-size/caption 1 (Mobile) */
  --_button-lh: 18px; /* Figma I2074:5853;2045:942 @768, I2074:5769;2045:942 @380: line-height/caption 1 (Mobile) */
}

/* ---------- With Icon — на экранах сайта нет, значения компонента ---------- */
.button--with-icon.button--desktop {
  --_button-min-height: 64px; /* Figma 2091:2923 @1920 (h 64) */
  --_button-pad-y: 0px; /* Figma 2091:2923: высота задана 64, текст 32 по центру */
  --_button-pad-x: 24px; /* Figma 2091:2923 @1920 */
  --_button-gap: 8px; /* Figma 2091:2923 @1920 */
  --_button-radius: 20px; /* Figma 2091:2923 @1920 */
  --_button-icon-size: 32px; /* Figma 2091:2925 @1920 («Компоненты» → Icon/Arrow Up Right: 32) */
  --_button-fs: var(--fs-caption-2);
  --_button-lh: var(--lh-caption-2);
}

.button--with-icon.button--mobile,
.button--with-icon.button--auto {
  --_button-pad-y: 12px; /* Figma 2091:3514 */
  --_button-pad-x: 20px; /* Figma 2091:3514 */
  --_button-gap: 8px; /* Figma 2091:3514 */
  --_button-radius: var(--radius-12); /* Figma 2091:3514: 12 */
  /* Figma 2091:3516 — 13.714 («Компоненты» округляет до 14) */
  --_button-icon-size: 13.714px; /* Figma 2091:3516 */
  --_button-fs: 12px; /* Figma 2091:3514: font-size/caption 2 (Mobile) */
  --_button-lh: 16px; /* Figma 2091:3514: line-height/caption 2 (Mobile) */
}

/* device=auto на ≥ 1024 — значения Desktop (источники — выше, у .button--desktop) */
@media (min-width: 1024px) {
  .button--primary.button--auto,
  .button--secondary.button--auto {
    --_button-pad-y: var(--space-24);
    --_button-pad-x: var(--space-36);
    --_button-radius: var(--radius-24);
    --_button-fs: var(--fs-caption-1);
    --_button-lh: var(--lh-caption-1);
  }

  .button--with-icon.button--auto {
    --_button-min-height: 64px;
    --_button-pad-y: 0px;
    --_button-pad-x: 24px;
    --_button-gap: 8px;
    --_button-radius: 20px;
    --_button-icon-size: 32px;
    --_button-fs: var(--fs-caption-2);
    --_button-lh: var(--lh-caption-2);
  }
}

/* Иконка в With Icon — не «размер = кегль», а фиксированный размер варианта */
.button__icon {
  width: var(--_button-icon-size);
  height: var(--_button-icon-size);
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}
</style>
