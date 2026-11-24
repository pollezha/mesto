<script setup lang="ts">
// Doodle — маленькая декоративная каракуля для «пустых» экранов главной (Н54, решение владельца 24.11.2026).
// В Figma такого элемента нет: форма и толщина штриха взяты из соединительных линий гифа (2092:3801 — тонкая кривая
// со скруглёнными концами) и из округлого логотипа; цвет — токены кита. Источника в макете нет, нужно подтверждение
// дизайнера. TODO(question): new Н54
// Рисунок задаётся prop `name`; размер — CSS-переменной --doodle-size у места использования (по ступеням ширины),
// положение — классом места. aria-hidden, без событий мыши. Штрих «дорисовывается» один раз, когда каракуля
// появляется в окне (IntersectionObserver); без JS и при prefers-reduced-motion — сразу нарисована.
export type DoodleName = 'spark' | 'arrow' | 'loop' | 'spiral'
export type DoodleTone = 'blue' | 'soft'

const props = withDefaults(defineProps<{ name: DoodleName; tone?: DoodleTone }>(), { tone: 'blue' })

// Все пути в квадрате 100 × 100; pathLength="1" в шаблоне нормирует длину штриха для stroke-dashoffset.
const drawings: Record<DoodleName, string[]> = {
  spark: [
    'M50 8 C52 26 48 38 50 50 C52 62 48 74 51 92',
    'M8 52 C26 48 38 52 50 50 C62 48 74 52 92 48',
    'M24 25 C28 29 31 33 36 37',
    'M76 75 C72 71 69 67 64 63',
  ],
  arrow: [
    'M10 82 C24 96 50 92 54 72 C58 52 32 46 32 62 C32 78 62 72 80 40',
    'M62 36 C69 37 75 38 81 38 C80 45 78 51 76 58',
  ],
  loop: ['M6 62 C18 34 42 30 41 50 C40 70 16 68 24 50 C32 30 62 26 72 44 C80 58 90 60 95 46'],
  spiral: [
    'M50 50 C54 50 55 45 52 43 C47 40 41 46 43 53 C45 62 56 64 62 56 C70 46 62 33 50 33 C34 33 28 50 33 62 C40 78 62 82 74 68 C86 54 80 30 62 20',
  ],
}

const paths = computed(() => drawings[props.name])

const root = ref<SVGSVGElement | null>(null)
// 'idle' — видна как есть (SSR, без JS, reduced motion); 'pending' — спрятана до появления в окне; 'drawn' — рисуется.
const state = ref<'idle' | 'pending' | 'drawn'>('idle')
let observer: IntersectionObserver | undefined

onMounted(() => {
  if (!root.value || typeof IntersectionObserver === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  state.value = 'pending'
  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      state.value = 'drawn'
      observer?.disconnect()
    },
    { threshold: 0.6 },
  )
  observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <svg
    ref="root"
    class="doodle"
    :class="[
      `doodle--${tone}`,
      { 'doodle--pending': state === 'pending', 'doodle--drawn': state === 'drawn' },
    ]"
    viewBox="0 0 100 100"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, i) in paths" :key="i" :d="d" pathLength="1" />
  </svg>
</template>

<style scoped>
.doodle {
  --_dd-size: var(
    --doodle-size,
    80px
  ); /* размер задаёт место использования; запасное значение — 80 */
  --_dd-stroke: 4; /* толщина штриха в единицах рисунка (100): 64 px → 2,6 px, 120 px → 4,8 px */
  --_dd-duration: 800ms; /* рисование 600–900 мс, ease-out — решение владельца 24.11.2026, Н54 */

  display: block;
  flex: none;
  width: var(--_dd-size);
  height: var(--_dd-size);
  overflow: visible;
  pointer-events: none;
  user-select: none;
}

.doodle path {
  stroke: var(--_dd-color);
  stroke-width: var(--_dd-stroke);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 0;
}

.doodle--blue {
  --_dd-color: var(--color-blue-500);
}

.doodle--soft {
  --_dd-color: var(--color-blue-300);
}

/* до появления в окне штрих убран целиком (opacity — чтобы круглый колпачок не оставлял точку) */
.doodle--pending path {
  stroke-dashoffset: 1;
  opacity: 0;
}

.doodle--drawn path {
  transition:
    stroke-dashoffset var(--_dd-duration) ease-out,
    opacity 50ms linear;
}

@media (prefers-reduced-motion: reduce) {
  .doodle--pending path,
  .doodle--drawn path {
    stroke-dashoffset: 0;
    opacity: 1;
    transition: none;
  }
}
</style>
