<script setup lang="ts">
// Демо песочницы для CaptionItem: белая панель с двумя пунктами блока услуг, тексты из словаря
// текущей локали. Раскладка панели — как в ServicesBlock (≥ 1024: ряд, пункты делят панель поровну
// (flex 1 0 0), отступ 40, gap 16; 768 и 380: колонка, отступ 16, gap 16). Служебный файл /__kit, на сайт не попадает.
import CaptionItem from '~/components/CaptionItem.vue'

const props = defineProps<{
  block: 'branding' | 'marketing' | 'interfaces' | 'support'
  items: string[]
}>()

const base = computed(() => `home.services.blocks.${props.block}.items`)
</script>

<template>
  <div class="demo-panel">
    <CaptionItem
      v-for="id in items"
      :key="id"
      :title="$t(`${base}.${id}.title`)"
      :text="$t(`${base}.${id}.text`)"
    />
  </div>
</template>

<style scoped>
.demo-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: var(--color-white);
}

@media (min-width: 1024px) {
  .demo-panel {
    flex-direction: row;
    align-items: flex-start;
    padding: 40px;
  }

  .demo-panel > * {
    flex: 1 0 0;
  }
}
</style>
