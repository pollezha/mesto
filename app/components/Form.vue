<script setup lang="ts">
// Form — компонент Form 2045:959 (Locale: RU / EN · Size: Default / Small); docs «Компоненты» → «Форма и CTA»,
// ТЗ → «Форма», Р51, Р52, Р64, Р67, Р71, Р72. Логика (значения, проверка, отправка) — useLeadForm.
// Size: Default на ≥ 1024, Small на 768 и 380 (Р72). По умолчанию 'auto' — Small ниже 1024 и Default на ≥ 1024
// медиазапросом (ТЗ → «Общие правила» п. 1, Р4): один DOM, без JS, без скачка после гидратации; 'auto'
// уходит и детям (Input, CheckboxField, Button). Явные default / small — для песочницы. Locale — язык страницы:
// в EN чекбоксов нет, высоту многострочного поля по локали знает Input.
// Раскладка одинакова на «Контактах» и в CTA главной (паддинги, gap, радиус сняты по обоим, см. стили),
// ширину задаёт место использования (ContactsCta: max-width 806 на ≥ 1024), Form тянется на 100%.
import { LEAD_LIMITS, useLeadForm } from '~/composables/useLeadForm'

const props = withDefaults(
  defineProps<{
    /** Size в Figma; auto — Small ниже 1024 и Default на ≥ 1024 (медиазапросом). */
    size?: 'default' | 'small' | 'auto'
  }>(),
  { size: 'auto' },
)

const { values, errors, status, isRu, clearError, submit } = useLeadForm()

/** Во время отправки: поля Disabled, чекбоксы и кнопка не нажимаются без смены вида (ТЗ → «Форма» п. 3). */
const sending = computed(() => status.value === 'sending')

// Согласие снимает ошибку при отметке (ТЗ → «Форма» п. 2)
watch(
  () => values.consent,
  (checked) => {
    if (checked) clearError('consent')
  },
)

// После успеха фокус — на текст сообщения (ТЗ → «Форма» п. 4)
const successText = ref<HTMLElement | null>(null)
watch(status, async (value) => {
  if (value !== 'success') return
  await nextTick()
  successText.value?.focus()
})

const buttonDevice = computed(() => {
  if (props.size === 'auto') return 'auto'
  return props.size === 'small' ? 'mobile' : 'desktop'
})

function onSubmit() {
  if (sending.value) return
  void submit()
}
</script>

<template>
  <!-- aria-live="polite": успех и ошибка отправки объявляются читалкам (ТЗ → «Форма» п. 4) -->
  <div class="form" :class="`form--${props.size}`" aria-live="polite">
    <!-- Успех (Р67): поля, чекбоксы и кнопка заменяются текстом внутри той же карточки -->
    <!-- TODO(question): В26 — вид текста успеха «как в ТЗ»: Text 1 Black внутри карточки -->
    <p v-if="status === 'success'" ref="successText" class="form__success" tabindex="-1">
      {{ $t('form.success') }}
    </p>
    <!-- method/action: до гидратации и без JS нативная отправка уходит POST-ом, а не GET с данными в адресе
         (Р18, Р42); после гидратации — @submit.prevent. TODO: приём нативного POST — этап /api/lead -->
    <form
      v-else
      class="form__body"
      method="post"
      action="/api/lead"
      novalidate
      @submit.prevent="onSubmit"
    >
      <Input
        v-model="values.name"
        :size="props.size"
        name="name"
        autocomplete="name"
        :placeholder="$t('form.name')"
        :error="errors.name"
        :error-text="$t('form.required')"
        :disabled="sending"
        :maxlength="LEAD_LIMITS.name"
        required
        @clear-error="clearError('name')"
      />
      <!-- autocomplete не задан: поле принимает и почту, и ник Telegram, значение токена в документации не задано -->
      <Input
        v-model="values.contact"
        :size="props.size"
        name="contact"
        :placeholder="$t('form.contact')"
        :error="errors.contact"
        :error-text="$t('form.required')"
        :disabled="sending"
        :maxlength="LEAD_LIMITS.contact"
        required
        @clear-error="clearError('contact')"
      />
      <Input
        v-model="values.message"
        type="textarea"
        :size="props.size"
        name="message"
        :placeholder="$t('form.message')"
        :disabled="sending"
        :maxlength="LEAD_LIMITS.message"
      />
      <!-- Чекбоксы только в RU-форме («Компоненты» → Form) -->
      <template v-if="isRu">
        <CheckboxField
          v-model="values.consent"
          kind="consent"
          :size="props.size"
          name="consent"
          :error="errors.consent"
          :disabled="sending"
          required
        />
        <CheckboxField
          v-model="values.newsletter"
          kind="newsletter"
          :size="props.size"
          name="newsletter"
          :disabled="sending"
        />
      </template>
      <Button
        class="form__submit"
        type="primary"
        :device="buttonDevice"
        native-type="submit"
        :busy="sending"
      >
        {{ $t('form.submit') }}
      </Button>
      <!-- Ловушка для ботов (Р37): не display: none — простые боты пропускают такие поля, а это поле
           остаётся в потоке разметки; людям и читалкам скрыто (aria-hidden, tabindex -1, вне экрана) -->
      <div class="form__trap visually-hidden" aria-hidden="true">
        <input
          v-model="values.website"
          type="text"
          name="website"
          tabindex="-1"
          autocomplete="off"
        />
      </div>
      <!-- Ошибка отправки (ТЗ → «Форма» п. 4; вид — В26): данные сохраняются -->
      <!-- TODO(question): В26 — вид сообщений «как в ТЗ»: Caption 2 System/Error под кнопкой; В27 — контраст 3,9:1 в Small -->
      <p v-if="status === 'error'" class="form__error">{{ $t('form.error') }}</p>
    </form>
  </div>
</template>

<style scoped>
/*
 * Экраны (Р3), форма «Контактов» RU: I2074:5748 @1920, I2074:5790 @1440, I2074:5811 @1280, I2074:5832 @1024,
 * I2074:5853 @768, I2074:5769 @380 (EN: 2074:5874, 2074:5904, 2074:5919, 2074:5934, 2074:5949, 2074:5889);
 * CTA главной RU: I35:2215;2073:156 @1920, I2063:1400;2073:156 @1440, I2063:1512;2073:156 @1280,
 * I2064:1470;2073:156 @1024, I2064:1582;2073:177 @768, I2074:2565;2073:177 @380.
 * Паддинги, gap и радиус на «Контактах» и в CTA совпадают на каждой ширине — публичных переменных не нужно.
 * Default (≥ 1024): паддинг Spacing/48 (48 / 38 / 36 / 31), gap Spacing/32 (32 / 26 / 24 / 21), радиус Radius/40
 *   (40 / 32 / 30 / 26) — Figma 2045:887 и инстансы выше.
 * Small: 768 — те же токены (29 / 19 / 24), Figma I2074:5853 / I2064:1582;2073:177; 380 — 20 / 16, gap 12,
 *   радиус Radius/40 (20), Figma I2074:5769 / I2074:2565;2073:177.
 */
.form {
  position: relative; /* для ловушки (visually-hidden — absolute) */
  box-sizing: border-box;
  width: 100%;
  padding: var(--_form-pad-y) var(--_form-pad-x);
  border-radius: var(--_form-radius);
  background-color: var(--color-white); /* Achromatic/White */
}

.form--default {
  --_form-pad-y: var(--space-48);
  --_form-pad-x: var(--space-48);
  --_form-gap: var(--space-32);
  --_form-radius: var(--radius-40);
}

.form--small,
.form--auto {
  --_form-pad-y: 20px; /* Figma I2074:5769 @380, I2074:2565;2073:177 @380 */
  --_form-pad-x: 16px; /* Figma I2074:5769 @380, I2074:2565;2073:177 @380 */
  --_form-gap: 12px; /* Figma I2074:5769 @380, I2074:2565;2073:177 @380 */
  --_form-radius: var(--radius-40);
}

@media (min-width: 768px) {
  .form--small,
  .form--auto {
    --_form-pad-y: var(--space-48); /* 29, Figma I2074:5853 @768 */
    --_form-pad-x: var(--space-48);
    --_form-gap: var(--space-32); /* 19, Figma I2074:5853 @768 */
  }
}

.form__body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--_form-gap);
  margin: 0;
}

.form__submit {
  width: 100%;
}

/* Успех (Р67): Text 1, Achromatic/Black; паддинги карточки прежние. В форме Small — Text 1 Mobile (Р72, В26),
   на ≥ 1024 — Text 1 своей ширины. Получает фокус программно (tabindex -1) — обводки нет: в ТЗ → «Общие правила» п. 8
   его нет среди элементов с обводкой фокуса. */
.form__success {
  margin: 0;
  outline: none;
  color: var(--color-black); /* Achromatic/Black */
  font-size: var(--_form-success-fs);
  line-height: var(--_form-success-lh);
  font-weight: var(--fw-regular);
}

/* Ошибка отправки: Caption 2, System/Error; в форме Small — Caption 2 Mobile (Р72, В26; контраст 3,9:1 — В27) */
.form__error {
  margin: 0;
  color: var(--color-error); /* System/Error */
  font-size: var(--_form-error-fs);
  line-height: var(--_form-error-lh);
  font-weight: var(--fw-medium);
}

.form--default {
  --_form-error-fs: var(--fs-caption-2);
  --_form-error-lh: var(--lh-caption-2);
  --_form-success-fs: var(--fs-txt-1);
  --_form-success-lh: var(--lh-txt-1);
}

.form--small,
.form--auto {
  --_form-error-fs: 12px; /* Caption 2 Mobile, как подпись чекбокса Small (Р72, В26, В27) */
  --_form-error-lh: 16px;
  --_form-success-fs: 20px; /* Text 1 Mobile (Р72, В26) */
  --_form-success-lh: 24px;
}

/* size=auto на ≥ 1024 — значения Default (источники — у .form--default) */
@media (min-width: 1024px) {
  .form--auto {
    --_form-pad-y: var(--space-48);
    --_form-pad-x: var(--space-48);
    --_form-gap: var(--space-32);
    --_form-radius: var(--radius-40);
    --_form-error-fs: var(--fs-caption-2);
    --_form-error-lh: var(--lh-caption-2);
    --_form-success-fs: var(--fs-txt-1);
    --_form-success-lh: var(--lh-txt-1);
  }
}
</style>
