<script setup lang="ts">
// Демо песочницы для Button: кнопка с текстом из словаря текущей локали.
// Служебный файл /__kit, на сайт не попадает.
import Button from '~/components/Button.vue'

withDefaults(
  defineProps<{
    type?: 'primary' | 'secondary' | 'with-icon'
    device?: 'desktop' | 'mobile'
    /** Ключ словаря: «Обсудить проект» (форма, блок услуг) или «На главную» (404). */
    text?: 'cta.discuss' | 'notFound.button'
  }>(),
  { type: 'primary', device: 'desktop', text: 'cta.discuss' },
)
</script>

<template>
  <Button :type="type" :device="device">{{ $t(text) }}</Button>
</template>
