<script setup lang="ts">
// Input — поле и многострочное поле формы. Figma 2044:984 (Type: Field / Textarea ·
// State: Default / Focus / Typing / Filled / Error / Disabled · Size: Default / Small);
// docs «Компоненты» → «Форма и CTA» → Input; Р51, Р64, Р71, Р72; ТЗ → «Форма».
// Вариант Size выбирает место использования (Form): Default на ≥ 1024, Small на 768 и 380
// («Какой вариант на какой ширине», Р72). size="auto" — то же самое медиазапросом (Small по умолчанию,
// Default в @media (min-width: 1024px)), без JS и без смены DOM; явные default / small — для песочницы.
// State не prop, а состояние нативного элемента (Р51): Default — пустое без фокуса; Focus — пустое в фокусе
// (:focus + :placeholder-shown); Typing — в фокусе с текстом; Filled — с текстом без фокуса;
// Error — prop error (держится и в фокусе); Disabled — prop disabled (во время отправки, ТЗ → «Форма» п. 3).
// Ошибку снимает Form / useLeadForm: компонент только сообщает событием clear-error, что в поле с ошибкой
// введён символ (Р51). Обводки фокуса нет (Р71, base.css) — фокус показывают Focus и Typing.
// Плейсхолдер — подпись поля из макета, он же доступное имя (aria-label); видимой подписи в макете нет.
// Атрибуты (autocomplete, id, inputmode, обработчики…) уходят на нативный элемент; class и style — на корень.
import type { StyleValue } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    /** Type в Figma: однострочное поле или многострочное. */
    type?: 'field' | 'textarea'
    /** Size в Figma; auto — Small ниже 1024 и Default на ≥ 1024 (медиазапросом, без JS; Form на сайте). */
    size?: 'default' | 'small' | 'auto'
    /** Подпись поля (плейсхолдер из словаря, передаёт Form) — и доступное имя. */
    placeholder: string
    /** State=Error. */
    error?: boolean
    /** Подсказка под полем в Error («Заполните это поле», Р49) — передаёт Form. */
    errorText?: string
    /** State=Disabled. */
    disabled?: boolean
    /** Лимит длины без счётчика (Р64: 100 / 100 / 2000). */
    maxlength?: number
    name: string
    required?: boolean
  }>(),
  {
    type: 'field',
    size: 'default',
    error: false,
    errorText: undefined,
    disabled: false,
    maxlength: undefined,
    required: false,
  },
)

const emit = defineEmits<{
  /** В поле с ошибкой введён символ (Р51): решение снять ошибку принимает Form / useLeadForm. */
  'clear-error': []
}>()

const model = defineModel<string>({ default: '' })

const attrs = useAttrs()
const { locale } = useI18n()
const hintId = useId()

const showHint = computed(() => props.error && Boolean(props.errorText))

const nativeAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([key]) => key !== 'class' && key !== 'style' && key !== 'aria-describedby',
    ),
  ),
)

const describedBy = computed(() => {
  const ids = [attrs['aria-describedby'], showHint.value ? hintId : undefined].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
})

function onInput(event: Event) {
  // Р51: ошибка снимается с первым введённым символом — удаление символа ввода не считается
  if (!props.error) return
  if (event instanceof InputEvent && event.inputType.startsWith('delete')) return
  emit('clear-error')
}
</script>

<template>
  <div
    class="input"
    :class="[
      `input--${type}`,
      `input--${size}`,
      { 'input--error': error, 'input--en': locale === 'en' },
      attrs.class,
    ]"
    :style="attrs.style as StyleValue"
  >
    <div class="input__control">
      <textarea
        v-if="type === 'textarea'"
        v-bind="nativeAttrs"
        v-model="model"
        class="input__native"
        rows="1"
        :name="name"
        :placeholder="placeholder"
        :aria-label="placeholder"
        :maxlength="maxlength"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @input="onInput"
      />
      <input
        v-else
        v-bind="nativeAttrs"
        v-model="model"
        class="input__native"
        type="text"
        :name="name"
        :placeholder="placeholder"
        :aria-label="placeholder"
        :maxlength="maxlength"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        @input="onInput"
      />
      <!-- Высота многострочного поля в Figma — по плейсхолдеру: перенос подписи добавляет строку
           (CTA главной RU: 150 @1440, 123 @1024). Невидимая копия подписи задаёт высоту ячейки. -->
      <span v-if="type === 'textarea'" class="input__sizer" aria-hidden="true">{{
        placeholder
      }}</span>
    </div>
    <p v-if="showHint" :id="hintId" class="input__hint">{{ errorText }}</p>
  </div>
</template>

<style scoped>
/*
 * Геометрия по экранам (Р3): форма «Контактов» RU — I2074:5748 @1920, I2074:5790 @1440, I2074:5811 @1280,
 * I2074:5832 @1024, I2074:5853 @768, I2074:5769 @380 (поля ;2045:888 / ;2045:892 / ;2045:896, Small —
 * ;2045:924 / ;2045:928 / ;2045:932); EN — 2074:5874, 2074:5904, 2074:5919, 2074:5934, 2074:5949, 2074:5889;
 * CTA главной RU — I2063:1400;2073:156 @1440, I2064:1470;2073:156 @1024; EN — I2065:1535;2092:6735 @1440.
 * Default (≥ 1024): боковой паддинг = Spacing/36, радиус = Radius/20, текст = Text 3 своей ширины
 * (на экранах точно равны токенам); высоты и вертикальные отступы многострочного поля — не токены.
 * Small (768 и 380): фиксированные значения компонента, тексты в режиме Mobile (Р72).
 * Рамка входит в геометрию (текст в Figma смещён на её толщину: x 38 → 39 в Typing, 2044:884 / 2044:892 @1920).
 */
.input {
  display: flex;
  flex-direction: column;
  gap: var(--_input-hint-gap);
  font-family: var(--font-family);
}

.input__control {
  display: grid;
}

.input__native,
.input__sizer {
  grid-area: 1 / 1;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  border-style: solid;
  border-width: var(--_input-border-rest);
  border-radius: var(--_input-radius);
  font-family: inherit;
  font-size: var(--_input-fs);
  font-weight: var(--fw-regular);
  line-height: var(--_input-lh);
}

.input__native {
  appearance: none;
  padding: 0 var(--_input-pad-x);
  /* TODO(question): В27 — контраст рамки Gray 300 ниже нормы WCAG; до ответа — как в макете */
  border-color: var(--color-gray-300); /* Default / Filled — Achromatic/Gray 300 */
  background-color: var(--color-white); /* Achromatic/White — фон поля, 2044:885 @1920 */
  color: var(--color-black); /* Achromatic/Black — введённый текст (Typing, Filled) */
  caret-color: var(--color-blue-500); /* Brand Blue/500 — каретка, 2044:895 @1920 */
}

.input__native::placeholder {
  /* TODO(question): В27 — контраст плейсхолдера Gray 500 ниже нормы WCAG; до ответа — как в макете */
  color: var(--color-gray-500); /* Achromatic/Gray 500 — плейсхолдер */
  opacity: 1;
}

/* ---------- Field: высота поля, текст по центру ---------- */
.input--field .input__native {
  min-height: var(--_input-field-height);
}

/* ---------- Textarea ----------
 * Высота = отступ сверху + подпись (сколько строк займёт) + отступ снизу, но не меньше min-height
 * («Компоненты»: в коде min-height). Высоту задаёт невидимая копия подписи (.input__sizer). */
.input--textarea .input__native {
  align-self: stretch;
  min-height: var(--_input-textarea-min-height);
  padding-top: var(--_input-textarea-pad-top);
  padding-bottom: var(--_input-textarea-pad-top);
  overflow-y: auto;
  /* В макете у многострочного поля нет уголка изменения размера */
  resize: none;
}

.input__sizer {
  padding: var(--_input-textarea-pad-top) var(--_input-pad-x) var(--_input-textarea-pad-bottom);
  border-color: transparent;
  visibility: hidden;
  pointer-events: none;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

/* ---------- Состояния (Р51; «Компоненты» → Input, таблица). Фокусные — через :where(), чтобы Error
   держался в фокусе (Р51), а Disabled был сильнее всех ---------- */

/* Focus: пустое поле в фокусе — рамка Gray 500 той же толщины (2044:888 @1920) */
.input__native:where(:focus:placeholder-shown) {
  border-color: var(--color-gray-500);
}

/* Typing: в фокусе с текстом — рамка Brand Blue/500, толще (2044:892 @1920) */
.input__native:where(:focus:not(:placeholder-shown)) {
  border-width: var(--_input-border-active);
  border-color: var(--color-blue-500);
}

/* Error: рамка Black, толще (2044:901 @1920); держится и в фокусе */
.input--error .input__native {
  border-width: var(--_input-border-active);
  border-color: var(--color-black);
}

/* Disabled: рамка Gray 200, фон Gray 100, текст и подпись Gray 300 (2044:905 @1920) */
.input__native:disabled {
  border-width: var(--_input-border-rest);
  border-color: var(--color-gray-200);
  background-color: var(--color-gray-100);
  color: var(--color-gray-300);
  /* Safari приглушает текст отключённого поля — цвет задаётся явно */
  -webkit-text-fill-color: var(--color-gray-300);
  opacity: 1;
}

.input__native:disabled::placeholder {
  color: var(--color-gray-300);
  -webkit-text-fill-color: var(--color-gray-300);
}

/* Подсказка ошибки: Caption 2 Medium, System/Error (2044:904 @1920) */
.input__hint {
  margin: 0;
  /* TODO(question): В27 — System/Error на Small (12 px) 3,9:1 при норме 4,5:1; до ответа — как в макете */
  color: var(--color-error);
  font-size: var(--_input-hint-fs);
  font-weight: var(--fw-medium);
  line-height: var(--_input-hint-lh);
}

/* ---------- Size=Default (≥ 1024). База — значения 1024 (ниже 1024 Default на сайте не стоит) ---------- */
.input--default {
  --_input-border-rest: 2px; /* Figma 2044:884 @1920; I2074:5790;2045:888 @1440 … I2074:5832;2045:888 @1024 */
  --_input-border-active: 3px; /* Figma 2044:892, 2044:901 @1920 (Typing, Error) */
  --_input-pad-x: var(
    --space-36
  ); /* Spacing/36: 36 / 29 / 27 / 23 на экранах 1920 / 1440 / 1280 / 1024 */
  --_input-radius: var(
    --radius-20
  ); /* Radius/20: 20 / 16 / 15 / 13 на экранах 1920 / 1440 / 1280 / 1024 */
  --_input-fs: var(
    --fs-txt-3
  ); /* Text 3 своей ширины (Р72: в форме Default — стили текущей ширины) */
  --_input-lh: var(--lh-txt-3);
  --_input-hint-fs: var(--fs-caption-2); /* Caption 2 своей ширины */
  --_input-hint-lh: var(--lh-caption-2);
  /* Н11 — решение владельца 20.11.2026: отступ подсказки 12 px на всех ширинах (Error на 1440–1024 на экранах нет) */
  --_input-hint-gap: 12px; /* Figma 2044:901 @1920 */
  --_input-field-height: 68px; /* Figma I2074:5832;2045:888 @1024 */
  --_input-textarea-pad-top: 20px; /* Figma I2074:5832;2045:896 @1024 */
  --_input-textarea-pad-bottom: 51px; /* Figma I2074:5832;2045:896 @1024 */
  --_input-textarea-min-height: 99px; /* Figma I2074:5832;2045:896, 2074:5934 (EN) @1024 */
}

@media (min-width: 1280px) {
  .input--default {
    --_input-field-height: 78px; /* Figma I2074:5811;2045:888 @1280 */
    --_input-textarea-pad-top: 23px; /* Figma I2074:5811;2045:896 @1280 */
    --_input-textarea-pad-bottom: 59px; /* Figma I2074:5811;2045:896 @1280 */
    --_input-textarea-min-height: 114px; /* Figma I2074:5811;2045:896, 2074:5919 (EN) @1280 */
  }
}

@media (min-width: 1440px) {
  .input--default {
    --_input-field-height: 82px; /* Figma I2074:5790;2045:888 @1440 */
    --_input-textarea-pad-top: 24px; /* Figma I2074:5790;2045:896 @1440 */
    --_input-textarea-pad-bottom: 62px; /* Figma I2074:5790;2045:896 @1440 */
    --_input-textarea-min-height: 120px; /* Figma I2074:5790;2045:896, 2074:5904 (EN) @1440 */
  }
}

@media (min-width: 1920px) {
  .input--default {
    --_input-field-height: 96px; /* Figma 2044:884, I2074:5748;2045:888 @1920 */
    --_input-textarea-pad-top: 30px; /* Figma 2044:909, I2074:5748;2045:896 @1920 */
    --_input-textarea-pad-bottom: 74px; /* Figma 2044:909, I2074:5748;2045:896 @1920 */
    --_input-textarea-min-height: 180px; /* Figma I2074:5748;2045:896 @1920 (RU) */
  }

  .input--default.input--en {
    --_input-textarea-min-height: 144px; /* Figma I2074:5874;2045:917 @1920 (EN) */
  }
}

/* ---------- Size=Small (768 и 380): одинаково на обеих ширинах, тексты в режиме Mobile (Р72) ---------- */
.input--small,
.input--auto {
  --_input-border-rest: 1px; /* Figma 2044:934 @380; I2074:5853;2045:924 @768, I2074:5769;2045:924 @380 */
  --_input-border-active: 2px; /* Figma 2044:942, 2044:951 @380 (Typing, Error) */
  --_input-pad-x: 12px; /* Figma 2044:934 @380; I2074:5853;2045:932 @768, I2074:5769;2045:932 @380 */
  --_input-radius: 10px; /* Figma 2044:934 @380; I2074:5853;2045:932 @768 (Radius/20 на 768 = 12 — не он) */
  --_input-fs: 16px; /* Figma I2074:5853;2045:932 @768, 2044:951 @380: font-size/txt3 (Mobile) */
  --_input-lh: 20px; /* Figma I2074:5853;2045:932 @768, 2044:951 @380: line-height/txt3 (Mobile) */
  --_input-hint-fs: 12px; /* Figma 2044:954 @380: font-size/caption 2 (Mobile) */
  --_input-hint-lh: 16px; /* Figma 2044:954 @380: line-height/caption 2 (Mobile) */
  --_input-hint-gap: 6px; /* Figma 2044:951 @380 */
  --_input-field-height: 56px; /* Figma 2044:934 @380; I2074:5853;2045:924 @768, I2074:5769;2045:924 @380 */
  --_input-textarea-pad-top: 12px; /* Figma 2044:959 @380; I2074:5853;2045:932 @768 */
  --_input-textarea-pad-bottom: 66px; /* Figma 2044:959 @380; I2074:5853;2045:932 @768 */
  --_input-textarea-min-height: 120px; /* Figma I2074:5769;2045:932 @380 (RU) */
}

:where(.input--small, .input--auto).input--en {
  --_input-textarea-min-height: 100px; /* Figma I2074:5889;2045:953 @380 (EN) */
}

@media (min-width: 768px) {
  .input--small,
  .input--auto,
  :where(.input--small, .input--auto).input--en {
    --_input-textarea-min-height: 100px; /* Р72; Figma I2074:5853;2045:932 (RU), I2074:5949;2045:953 (EN) @768 */
  }
}

/* ---------- Size=auto: Default на ≥ 1024 — те же значения, что у .input--default (источники — там) ---------- */
@media (min-width: 1024px) {
  .input--auto {
    --_input-border-rest: 2px;
    --_input-border-active: 3px;
    --_input-pad-x: var(--space-36);
    --_input-radius: var(--radius-20);
    --_input-fs: var(--fs-txt-3);
    --_input-lh: var(--lh-txt-3);
    --_input-hint-fs: var(--fs-caption-2);
    --_input-hint-lh: var(--lh-caption-2);
    --_input-hint-gap: 12px; /* Н11 — решение владельца 20.11.2026: как у Default */
    --_input-field-height: 68px;
    --_input-textarea-pad-top: 20px;
    --_input-textarea-pad-bottom: 51px;
    --_input-textarea-min-height: 99px;
  }
}

@media (min-width: 1280px) {
  .input--auto {
    --_input-field-height: 78px;
    --_input-textarea-pad-top: 23px;
    --_input-textarea-pad-bottom: 59px;
    --_input-textarea-min-height: 114px;
  }
}

@media (min-width: 1440px) {
  .input--auto {
    --_input-field-height: 82px;
    --_input-textarea-pad-top: 24px;
    --_input-textarea-pad-bottom: 62px;
    --_input-textarea-min-height: 120px;
  }
}

@media (min-width: 1920px) {
  .input--auto {
    --_input-field-height: 96px;
    --_input-textarea-pad-top: 30px;
    --_input-textarea-pad-bottom: 74px;
    --_input-textarea-min-height: 180px;
  }

  .input--auto.input--en {
    --_input-textarea-min-height: 144px;
  }
}
</style>
