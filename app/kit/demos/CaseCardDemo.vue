<script setup lang="ts">
// Демо песочницы для CaseCard: карточка в колонке раздела «Проекты» своей ширины
// (Layout 1880 / 1408 / 1250 / 998 / 744 / 356 — Figma 35:2178, 2063:1361, 2063:1473, 2064:1431, 2064:1543, 35:2474).
// Служебный файл /__kit, на сайт не попадает.
import CaseCard from '~/components/CaseCard.vue'

defineProps<{ n: 1 | 2 | 3 | 4 }>()
</script>

<template>
  <div class="demo-layout">
    <CaseCard :n="n" />
  </div>
</template>

<style scoped>
/* Ширина колонки — окно минус боковые поля раздела (Layout = окно − 2 × поле: 356 / 744 / 998 / 1250 / 1408 / 1880),
   на контрольных ширинах равна фрейму, между ними тянется (Н26) */
.demo-layout {
  --demo-gutter: 12px; /* (380 − 356) / 2 */
  width: calc(100% - 2 * var(--demo-gutter));
  max-width: 1880px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .demo-layout {
    --demo-gutter: 12px; /* (768 − 744) / 2 */
  }
}

@media (min-width: 1024px) {
  .demo-layout {
    --demo-gutter: 13px; /* (1024 − 998) / 2 */
  }
}

@media (min-width: 1280px) {
  .demo-layout {
    --demo-gutter: 15px; /* (1280 − 1250) / 2 */
  }
}

@media (min-width: 1440px) {
  .demo-layout {
    --demo-gutter: 16px; /* (1440 − 1408) / 2 */
  }
}

@media (min-width: 1920px) {
  .demo-layout {
    --demo-gutter: 20px; /* (1920 − 1880) / 2 */
  }
}
</style>
