<script setup lang="ts">
// CheckboxField — вариант Type=Checkbox Field компонента Checkbox 8:758 (State: Empty / Filled / Error ·
// Size: Default / Small); docs «Компоненты» → «Форма и CTA» → Checkbox Field. Квадрат — Checkbox.vue.
// Подпись собирается здесь по kind: тексты и ссылки согласий фиксированы (Р52, «Контент» → form.consent /
// form.newsletter), Form передаёт только kind — без копий ссылок и :deep-стилей в каждом месте использования.
// RU: два чекбокса; EN — только согласие (Н80, владелец 27.11.2026), рассылки на EN нет.
// Вся подпись — <label for>: клик по ней переключает чекбокс; клик по ссылке внутри label чекбокс не
// переключает (активация label не срабатывает на интерактивных потомках) и открывает документ в новой
// вкладке (Р52; ТЗ → «Интерактив», «Форма» п. 1).
// Size выбирает место использования: Default на ≥ 1024, Small на 768 и 380 (Р72); auto — то же медиазапросом.
// State: Empty / Filled — v-model, Error — prop error (снимает форма при отметке, ТЗ → «Форма» п. 2).

withDefaults(
  defineProps<{
    /** Какое согласие: consent — обработка персональных данных (обязательное), newsletter — рассылка. */
    kind: 'consent' | 'newsletter'
    /** Size в Figma; auto — Small ниже 1024 и Default на ≥ 1024 (медиазапросом, без JS). */
    size?: 'default' | 'small' | 'auto'
    /** State=Error: рамка квадрата System/Error, подпись Black (пока не отмечен). */
    error?: boolean
    /** Не нажимается (во время отправки формы); вид не меняется (ТЗ → «Форма» п. 3). */
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

const id = useId()

/** Документы из подписей (Р52); адрес своей локали — NuxtLinkLocale. */
const docs = {
  privacy: '/privacy',
  consent: '/consent',
  newsletter: '/newsletter-consent',
} as const
</script>

<template>
  <div
    class="checkbox-field"
    :class="[`checkbox-field--${size}`, { 'checkbox-field--error': error && !model }]"
  >
    <Checkbox
      :id="id"
      v-model="model"
      :size="size"
      :error="error"
      :disabled="disabled"
      :name="name"
      :required="required"
    />
    <label :for="id" class="checkbox-field__label">
      <i18n-t v-if="kind === 'consent'" keypath="form.consent" scope="global">
        <template #privacy>
          <NuxtLinkLocale
            :to="docs.privacy"
            class="checkbox-field__link"
            target="_blank"
            rel="noopener"
            >{{ $t('form.consentLinks.privacy') }}</NuxtLinkLocale
          >
        </template>
        <template #consent>
          <NuxtLinkLocale
            :to="docs.consent"
            class="checkbox-field__link"
            target="_blank"
            rel="noopener"
            >{{ $t('form.consentLinks.consent') }}</NuxtLinkLocale
          >
        </template>
      </i18n-t>
      <i18n-t v-else keypath="form.newsletter" scope="global">
        <template #newsletter>
          <NuxtLinkLocale
            :to="docs.newsletter"
            class="checkbox-field__link"
            target="_blank"
            rel="noopener"
            >{{ $t('form.newsletterLinks.newsletter') }}</NuxtLinkLocale
          >
        </template>
      </i18n-t>
    </label>
  </div>
</template>

<style scoped>
/*
 * Инстансы на экранах (форма «Контактов» RU и блок CTA главной / «Услуг» RU):
 * Default — I2074:5748;2045:900 / 2045:903 @1920, I2074:5790;2045:900 @1440, I2074:5811;2045:900 @1280,
 *           I2074:5832;2045:900 @1024; CTA главной I35:2215;2073:156;2045:900 @1920,
 *           I2063:1400;2073:156;2045:900 @1440, I2063:1512;2073:156;2045:900 @1280,
 *           I2064:1470;2073:156;2045:900 / 2045:903 @1024, «Услуги» I2057:1298;2073:156;2045:900 @1440;
 * Small   — I2074:5853;2045:936 @768, I2074:5769;2045:936 / 2045:939 @380; CTA главной
 *           I2064:1582;2073:177;2045:936 @768, I2074:2565;2073:177;2045:936 @380.
 * Раскладка везде: flex, items-start (верх подписи по верху квадрата), подпись занимает остаток и переносится.
 * Высота строки подписи = line-height Caption 2 текущей ширины (label 32 / 26 / 24 / 22 на 1920–1024,
 * 16 на 768 и 380).
 */
.checkbox-field {
  display: flex;
  align-items: flex-start;
  /* Публичный хук: предок (ContactsCta) задаёт --checkbox-field-gap по своему фрейму (Р3) */
  gap: var(--checkbox-field-gap, var(--_checkbox-field-gap));
}

.checkbox-field--default {
  /*
   * Figma 2044:985 / 2044:988 / 2044:993; I2074:5748;2045:900 @1920, I2074:5790;2045:900 @1440,
   * I2074:5811;2045:900 @1280, I2074:5832;2045:900 @1024, I35:2215;2073:156;2045:900 @1920 (CTA)
   */
  /*
   * В CTA главной, «Услуг» и кейса на 1440 / 1280 / 1024 gap по своим фреймам (CTA главной RU: 24 / 23 / 20,
   * Figma I2063:1400;2073:156;2045:900 @1440, I2063:1512;2073:156;2045:900 @1280, I2064:1470;2073:156;2045:900 @1024):
   * задаёт ContactsCta через --checkbox-field-gap (Р3).
   */
  --_checkbox-field-gap: 30px;
  /* Caption 2 текущей ширины (в форме Default — стили текущей ширины, «Компоненты» → Checkbox Field) */
  --_checkbox-field-fs: var(--fs-caption-2);
  --_checkbox-field-lh: var(--lh-caption-2);
}

.checkbox-field--small,
.checkbox-field--auto {
  --_checkbox-field-gap: 12px; /* Figma 2044:996 / 2044:999 / 2044:1004; I2074:5853;2045:936 @768, I2074:5769;2045:936 @380 */
  /*
   * Р72: в форме Small тексты в режиме Mobile — Caption 2 Mobile 12/16 и на 768 (токен 768 — 16/20).
   * Figma I2074:5853;2045:936;2044:998 @768 (label h 16), I2074:5769;2045:939;2044:998 @380 (2 строки, h 32)
   */
  --_checkbox-field-fs: 12px; /* Figma I2074:5853;2045:936 @768, I2074:5769;2045:936 @380: font-size/caption 2 (Mobile) */
  --_checkbox-field-lh: 16px; /* Figma I2074:5853;2045:936 @768, I2074:5769;2045:936 @380: line-height/caption 2 (Mobile) */
}

/* size=auto на ≥ 1024 — значения Default (источники и комментарии — у .checkbox-field--default) */
@media (min-width: 1024px) {
  .checkbox-field--auto {
    --_checkbox-field-gap: 30px;
    --_checkbox-field-fs: var(--fs-caption-2);
    --_checkbox-field-lh: var(--lh-caption-2);
  }
}

/* Caption 2, Achromatic/Gray 700 (Empty и Filled) */
.checkbox-field__label {
  flex: 1 1 0;
  min-width: 0;
  font-size: var(--_checkbox-field-fs);
  line-height: var(--_checkbox-field-lh);
  font-weight: var(--fw-medium);
  color: var(--color-gray-700); /* Achromatic/Gray 700 */
  overflow-wrap: break-word;
  /* Клик по подписи переключает чекбокс (label for) */
  cursor: pointer;
}

/* Чекбокс не нажимается (идёт отправка формы) */
.checkbox-field:has(input:disabled) .checkbox-field__label {
  cursor: default;
}

/* State=Error: подпись Achromatic/Black (Figma 2044:995, 2044:1006) */
.checkbox-field--error .checkbox-field__label {
  color: var(--color-black); /* Achromatic/Black */
}

/*
 * Ссылки в подписи (Р52): цвет и подчёркивание — цветом подписи; толщина и положение линии — из шрифта
 * (Figma 2044:987: text-decoration from-font). Фокус — глобальная обводка Р46 (base.css).
 */
.checkbox-field__link {
  color: inherit;
  text-decoration-line: underline;
  text-decoration-thickness: from-font;
  text-underline-position: from-font;
  /* ТЗ → «Общие правила» п. 10, Р62: 300 мс ease-out */
  transition: color 300ms ease-out;
}

/* Hover только с мышью: текст и линия — Brand Blue/500 (Р62; ТЗ → «Общие правила» п. 10) */
@media (pointer: fine) {
  .checkbox-field__link:hover {
    color: var(--color-blue-500); /* Brand Blue/500 */
  }
}

@media (prefers-reduced-motion: reduce) {
  .checkbox-field__link {
    transition: none;
  }
}
</style>
