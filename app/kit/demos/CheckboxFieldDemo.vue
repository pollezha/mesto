<script setup lang="ts">
// Демо песочницы для CheckboxField. Служебный файл /__kit, на сайт не попадает.
// Согласие (kind: consent) есть в обеих локалях (Н80), подпись из словаря текущей локали. Рассылка
// (kind: newsletter) — только RU-форма: на /en/__kit вместо компонента служебная пометка.
// State: Filled — modelValue: true, Error — error: true. Клик по подписи переключает чекбокс,
// клик по ссылке открывает документ в новой вкладке и чекбокс не переключает (Р52).
import CheckboxField from '~/components/CheckboxField.vue'

const props = withDefaults(
  defineProps<{
    kind?: 'consent' | 'newsletter'
    size?: 'default' | 'small'
    error?: boolean
    modelValue?: boolean
  }>(),
  { kind: 'consent', size: 'default', error: false, modelValue: false },
)

const { locale } = useI18n()

const checked = ref(props.modelValue)
</script>

<template>
  <CheckboxField
    v-if="kind === 'consent' || locale === 'ru'"
    v-model="checked"
    :kind="kind"
    :size="size"
    :error="error && !checked"
    :required="kind === 'consent'"
  />
  <p v-else class="checkbox-field-demo__note">рассылка — только RU-форма, смотреть на /__kit</p>
</template>

<style scoped>
/* Служебная подпись песочницы, не часть сайта */
.checkbox-field-demo__note {
  padding: 0 8px;
  font: 12px/16px monospace;
  color: #737373;
}
</style>
