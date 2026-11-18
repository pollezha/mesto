<script setup lang="ts">
// Демо песочницы для Input: подпись и подсказка ошибки — из словаря текущей локали.
// Служебный файл /__kit, на сайт не попадает.
// State в Figma, который нельзя выставить prop'ом: Focus и Typing показывает фокус (ревьюер ставит его
// через Playwright: Focus — пустое поле, Typing — поле с value); Filled — поле с value без фокуса.
// Error — prop error; ошибка снимается с первым введённым символом, как это будет делать Form (Р51).
import Input from '~/components/Input.vue'

const props = withDefaults(
  defineProps<{
    type?: 'field' | 'textarea'
    size?: 'default' | 'small'
    /** Ключ словаря подписи поля. */
    text?: 'form.name' | 'form.contact' | 'form.message'
    /** Начальное значение (пример ввода из варианта Figma). */
    value?: string
    error?: boolean
    disabled?: boolean
  }>(),
  {
    type: 'field',
    size: 'default',
    text: 'form.name',
    value: '',
    error: false,
    disabled: false,
  },
)

const model = ref(props.value)
const hasError = ref(props.error)
</script>

<template>
  <Input
    v-model="model"
    :type="type"
    :size="size"
    :name="`kit-${text}`"
    :placeholder="$t(text)"
    :error="hasError"
    :error-text="$t('form.required')"
    :disabled="disabled"
    @clear-error="hasError = false"
  />
</template>
