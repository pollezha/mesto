<script setup lang="ts">
// Демо песочницы для ServiceCard: карточка в колонке раздела «Услуги» своей ширины, тексты — из словаря
// (short — «Логотип»: заголовок в строку, описание в 2 строки; long — «Сайты, лендинги, интернет-магазины»:
// длинное название и описание в 3–4 строки). Служебный файл /__kit, на сайт не попадает.
import ServiceCard from '~/components/ServiceCard.vue'

const props = defineProps<{
  size: 'default' | 'small'
  item: 'short' | 'long'
}>()

const keys = {
  short: 'services.blocks.branding.items.logo',
  long: 'services.blocks.interfaces.items.websites',
} as const
const base = computed(() => keys[props.item])
</script>

<template>
  <div class="demo-card" :class="`demo-card--${size}`">
    <ServiceCard :size="size" :title="$t(`${base}.title`)" :text="$t(`${base}.text`)" />
  </div>
</template>

<style scoped>
/* Ширина карточки в колонке: 380 — 356 (Figma 2076:6116), 768 — 696 (2076:6137), 1024 — 460 (2109:3931),
   1280 — 580 (2109:3875), 1440 — 660 (2109:3819), 1920 — 888 (2076:6113). Ниже ширины фрейма — тянется. */
.demo-card {
  width: 356px;
  max-width: 100%;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .demo-card--default {
    width: 696px;
  }
}

@media (min-width: 1024px) {
  .demo-card--default {
    width: 460px;
  }
}

@media (min-width: 1280px) {
  .demo-card--default {
    width: 580px;
  }
}

@media (min-width: 1440px) {
  .demo-card--default {
    width: 660px;
  }
}

@media (min-width: 1920px) {
  .demo-card--default {
    width: 888px;
  }
}
</style>
