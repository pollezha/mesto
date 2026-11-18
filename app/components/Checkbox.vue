<script setup lang="ts">
// Checkbox — квадрат, вариант Type=Checkbox компонента Checkbox 8:758 (State: Empty / Filled / Error ·
// Size: Default / Small); docs «Компоненты» → «Форма и CTA» → Checkbox. Подпись (Type=Checkbox Field) —
// отдельный компонент CheckboxField, он связывает подпись с этим чекбоксом через id / for.
// Вариант Size выбирает место использования («Какой вариант на какой ширине»): Default на ≥ 1024,
// Small на 768 и 380. Сам чекбокс по ширине не переключается.
// State не prop: Empty / Filled — состояние нативного input (v-model), Error — prop error.
// Варианта «Filled + Error» в Figma нет (8:758): отмеченный чекбокс всегда Filled, ошибку снимает
// форма при отметке (ТЗ → «Форма» п. 2). Hover и Pressed в Figma нет. Фокус — обводка Р46 (2 px Blue 500,
// отступ 2 px) на видимом квадрате; Р71 касается только полей ввода.
// Disabled — только «не нажимается», вид не меняется (ТЗ → «Форма» п. 3: отдельного состояния в Figma нет).
// Атрибуты (id, aria-describedby, aria-label, обработчики) уходят на нативный input; class и style — на корень.
import type { StyleValue } from 'vue'

defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    /** Size в Figma. */
    size?: 'default' | 'small'
    /** State=Error: рамка System/Error и aria-invalid (пока не отмечен). */
    error?: boolean
    /** Не нажимается (во время отправки формы); вид не меняется. */
    disabled?: boolean
    name?: string
    required?: boolean
  }>(),
  {
    size: 'default',
    error: false,
    disabled: false,
    name: undefined,
    required: false,
  },
)

/** Отмечен ли (State=Filled). */
const model = defineModel<boolean>({ default: false })

const attrs = useAttrs()

function rootClass() {
  return attrs.class
}

function rootStyle() {
  return attrs.style as StyleValue
}

function inputAttrs() {
  return Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key !== 'class' && key !== 'style'),
  )
}
</script>

<template>
  <span
    class="checkbox"
    :class="[`checkbox--${size}`, { 'checkbox--error': error }, rootClass()]"
    :style="rootStyle()"
  >
    <input
      v-bind="inputAttrs()"
      v-model="model"
      class="checkbox__input"
      type="checkbox"
      :name="name"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error && !model ? 'true' : undefined"
    />
    <span class="checkbox__box" aria-hidden="true" />
    <span class="checkbox__check" aria-hidden="true" />
  </span>
</template>

<style scoped>
/*
 * Значения одинаковы на всех экранах своего варианта (инстансы в форме «Контактов» RU и в CTA главной RU):
 * Default — I2074:5748;2045:900;2044:986 @1920, I2074:5790;2045:900;2044:986 @1440,
 *           I2074:5811;2045:900;2044:986 @1280, I2074:5832;2045:900;2044:986 @1024,
 *           I2064:1470;2073:156;2045:900;2044:986 @1024 (CTA главной);
 * Small   — I2074:5853;2045:936;2044:997 @768 (после А17 — 24×24), I2074:5769;2045:936;2044:997 @380.
 * Радиус на экранах 9.926 / 5.955 (в «Компонентах» округлён до 10 / 6) — эталон экран (Р3); Radius/* к нему
 * не привязан, точного токена нет. Толщины рамок 2 / 1.2 — после аудита А4 («Аудит 31.10»).
 */
.checkbox {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  width: var(--_checkbox-size);
  height: var(--_checkbox-size);
  vertical-align: top;
}

.checkbox--default {
  --_checkbox-size: 40px; /* Figma 8:756 / 8:757 / 2091:3622; I2074:5748;2045:900;2044:986 @1920 … @1024 */
  --_checkbox-radius: 9.926px; /* Figma I2074:5748;2045:900;2044:986 @1920 … I2074:5832;2045:900;2044:986 @1024 */
  --_checkbox-border: 2px; /* Figma 8:756, 2091:3622; I2074:5748;2045:900;2044:986 @1920 … @1024 */
}

.checkbox--small {
  --_checkbox-size: 24px; /* Figma 2043:1679 / 2043:1676 / 2091:3624; I2074:5853;2045:936;2044:997 @768, I2074:5769;2045:936;2044:997 @380 */
  --_checkbox-radius: 5.955px; /* Figma I2074:5853;2045:936;2044:997 @768, I2074:5769;2045:936;2044:997 @380 */
  --_checkbox-border: 1.2px; /* Figma 2043:1679, 2091:3624; I2074:5853;2045:936;2044:997 @768, @380 */
}

/* Нативный input поверх квадрата: клики, клавиатура, фокус и читалки — его; виден квадрат под ним. */
.checkbox__input {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
}

/* Обводку фокуса рисует видимый квадрат (ниже) */
.checkbox__input:focus-visible {
  outline: none;
}

/* State=Empty */
.checkbox__box {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  /* TODO(question): В27 — контраст рамки Gray 500 2,2:1 ниже нормы 3:1; до ответа — как в макете */
  border: var(--_checkbox-border) solid var(--color-gray-500); /* Achromatic/Gray 500 */
  border-radius: var(--_checkbox-radius);
}

/* State=Error (Р17: System/Error привязан к рамке). Только пока не отмечен — варианта Filled + Error нет */
.checkbox--error .checkbox__input:not(:checked) ~ .checkbox__box {
  border-color: var(--color-error); /* System/Error */
}

/* State=Filled: фон Black без рамки (рамка того же цвета — квадрат сплошной), белая галка */
.checkbox__input:checked ~ .checkbox__box {
  border-color: var(--color-black); /* Achromatic/Black */
  background-color: var(--color-black); /* Achromatic/Black */
}

/* Фокус с клавиатуры (Р46; ТЗ → «Общие правила» п. 8) */
.checkbox__input:focus-visible ~ .checkbox__box {
  outline: 2px solid var(--color-blue-500);
  outline-offset: 2px;
}

/*
 * Галка — вектор Check из Figma без правок (8:751 — Default 40×40, 2043:1677 — Small 24×24),
 * кадр галки равен квадрату. Используется как маска, цвет — токен Achromatic/White (привязан в 8:757, 2043:1676).
 */
.checkbox__check {
  position: absolute;
  inset: 0;
  display: none;
  background-color: var(--color-white); /* Achromatic/White */
  pointer-events: none;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.checkbox--default .checkbox__check {
  -webkit-mask-image: url('~/assets/images/checkbox-check-default.svg');
  mask-image: url('~/assets/images/checkbox-check-default.svg');
}

.checkbox--small .checkbox__check {
  -webkit-mask-image: url('~/assets/images/checkbox-check-small.svg');
  mask-image: url('~/assets/images/checkbox-check-small.svg');
}

.checkbox__input:checked ~ .checkbox__check {
  display: block;
}
</style>
