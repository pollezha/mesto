<script setup lang="ts">
// HeroGif — hero-надпись главной (h1, Р56) с эффектом курсора: круг 160 px (Н46) и гиф.
// docs: «Компоненты» → «Hero» (gif 2092:3801: 7 кадров 348×330, 150 мс на кадр, по кругу — Р25);
// ТЗ → «Главная» п. 1 и «Интерактив» (Hero-надпись · курсор); Р48; «Общие правила» п. 7.
// Figma (надпись во фрейме «Header» экрана, RU и EN одинаково): 35:2174 @1920, 2063:1357 @1440,
// 2063:1469 @1280, 2064:1427 @1024, 2064:1539 @768, 35:2470 @380 (EN: 51:13660, 2065:1491, 2065:1668,
// 2066:1742, 2066:1919, 51:13708). Надпись по центру фрейма Header (по горизонтали и вертикали).
// Эффект — только при (pointer: fine) и ≥ 1024 и без reduced motion: иначе ни круга, ни гифа в DOM,
// слушатели не вешаются. Круг невидим сам по себе: это маска (mask-image с мягким краем, Н46) для чёрной копии текста.
// Гиф: анимированный WebP, собран из 7 кадров 38:7680, 38:7687, 38:7694, 38:7701, 38:7714, 38:7723,
// 38:7728 (полотно 348×330, прозрачный фон; кадры 02, 05, 07 выходят за карточку 160×217).

const { t } = useI18n()

const textEl = ref<HTMLElement | null>(null)
const enabled = ref(false)
const active = ref(false)

let mql: MediaQueryList | null = null
let frame = 0
let x = 0 // цель: курсор
let y = 0
let gx = 0 // гиф: догоняет курсор с инерцией
let gy = 0

// Н46 — решение владельца 24.11.2026: гиф догоняет курсор, pos += (цель − pos) × k
const GIF_FOLLOW = 0.2
const GIF_SETTLE = 0.5 // px: ближе — считаем, что догнал, rAF останавливается

// Н50 — владелец 24.11.2026: сайт масштабируется CSS zoom на html (siteZoom(), utils/siteZoom.ts). getBoundingClientRect и clientX/Y —
// в пикселях окна, а left/top, transform и mask внутри блока — в «локальных» (до zoom). Делим на коэффициент.
function readPoint(e: PointerEvent) {
  const el = textEl.value
  if (!el) return
  const box = el.getBoundingClientRect()
  const zoom = siteZoom()
  x = (e.clientX - box.left) / zoom
  y = (e.clientY - box.top) / zoom
}

function tick() {
  frame = 0
  const el = textEl.value
  if (!el) return
  gx += (x - gx) * GIF_FOLLOW
  gy += (y - gy) * GIF_FOLLOW
  const done = Math.abs(x - gx) < GIF_SETTLE && Math.abs(y - gy) < GIF_SETTLE
  if (done) {
    gx = x
    gy = y
  }
  el.style.setProperty('--hero-x', `${x}px`) // круг — без задержки
  el.style.setProperty('--hero-y', `${y}px`)
  el.style.setProperty('--gif-x', `${gx}px`)
  el.style.setProperty('--gif-y', `${gy}px`)
  if (!done) frame = requestAnimationFrame(tick)
}

function onEnter(e: PointerEvent) {
  readPoint(e)
  gx = x // появление сразу в точке курсора, без «прилёта»
  gy = y
  if (frame) cancelAnimationFrame(frame)
  tick()
  active.value = true
}

function onMove(e: PointerEvent) {
  readPoint(e)
  if (!frame) frame = requestAnimationFrame(tick)
}

function onLeave() {
  active.value = false
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

function bind(el: HTMLElement) {
  el.addEventListener('pointerenter', onEnter)
  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerleave', onLeave)
}

function unbind(el: HTMLElement) {
  el.removeEventListener('pointerenter', onEnter)
  el.removeEventListener('pointermove', onMove)
  el.removeEventListener('pointerleave', onLeave)
}

function sync() {
  const el = textEl.value
  if (!el || !mql) return
  if (mql.matches && !enabled.value) {
    enabled.value = true
    bind(el)
  } else if (!mql.matches && enabled.value) {
    enabled.value = false
    active.value = false
    unbind(el)
  }
}

onMounted(() => {
  mql = window.matchMedia(
    '(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  )
  mql.addEventListener('change', sync)
  sync()
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', sync)
  if (textEl.value) unbind(textEl.value)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <section class="hero-gif">
    <div ref="textEl" class="hero-gif__text">
      <h1 class="hero-gif__line">{{ t('home.hero') }}</h1>
      <template v-if="enabled">
        <div
          class="hero-gif__line hero-gif__ink"
          :class="{ 'hero-gif__ink--on': active }"
          aria-hidden="true"
        >
          {{ t('home.hero') }}
        </div>
        <span class="hero-gif__gif" :class="{ 'hero-gif__gif--on': active }" aria-hidden="true" />
      </template>
    </div>
  </section>
</template>

<style scoped>
/*
 * Геометрия надписи — фрейм «Header» экрана главной (RU = EN), надпись по центру фрейма.
 * Кегль/межстрочный — Heading 3 (--fs-h3 / --lh-h3 по ширине), цвет Achromatic/Gray 500, вес Medium.
 * Высота фрейма и ширина текстового блока — без привязки к токенам, локальные переменные.
 * Переносы строк в Figma — ручные (после «:»), в словаре одна строка; перенос по ширине блока, ТЗ п. 6.
 */
.hero-gif {
  /* 380 — Figma 35:2469 @380 (RU), 51:13707 (EN) */
  --_hero-height: 598px; /* Figma 35:2469 @380 */
  --_hero-text-width: 353px; /* Figma 35:2470 @380 */

  /* Эффект: ТЗ «Главная» п. 1, Р48; gif 2092:3801. Одинаков на всех ширинах ≥ 1024.
     Н46 — решение владельца 24.11.2026: гиф ×0.4, угол карточки в 8 px от курсора (Р48 — отступ, было 16),
     круг 160 px (было 240) с мягким краем 10 % радиуса, гиф догоняет курсор с инерцией (k в скрипте) */
  --_hero-circle: 160px; /* Н46 — диаметр круга */
  --_hero-circle-feather: 0.1; /* Н46 — доля радиуса под мягкий край */
  --_hero-gif-scale: 0.4; /* подбирает владелец */
  /* Figma 2092:3801: карточка 87,56 160×217 в полотне 348×330; поле справа 348−247=101, снизу 330−273=57 */
  --_hero-gif-w: calc(348px * var(--_hero-gif-scale));
  --_hero-gif-h: calc(330px * var(--_hero-gif-scale));
  --_hero-gif-pad-r: calc(101px * var(--_hero-gif-scale));
  --_hero-gif-pad-b: calc(57px * var(--_hero-gif-scale));
  --_hero-gif-offset: calc(8px / var(--site-zoom)); /* Р48 — отступ, Н46: 8 px, не масштабируется; Н50: 8 px в окне при zoom */

  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: var(--_hero-height);
}

.hero-gif__text {
  --hero-x: 0px;
  --hero-y: 0px;
  --gif-x: 0px;
  --gif-y: 0px;

  position: relative;
  width: var(--_hero-text-width);
  max-width: 100%;
}

.hero-gif__line {
  margin: 0;
  color: var(--color-gray-500);
  font-size: var(--fs-h3);
  font-weight: var(--fw-medium);
  line-height: var(--lh-h3);
  text-align: center;
}

/* Чёрная копия текста поверх серой: видна только внутри круга вокруг курсора */
.hero-gif__ink {
  position: absolute;
  inset: 0;
  color: var(--color-black);
  --_ink-mask: radial-gradient(
    circle calc(var(--_hero-circle) / 2) at var(--hero-x) var(--hero-y),
    black calc(var(--_hero-circle) / 2 * (1 - var(--_hero-circle-feather))),
    transparent calc(var(--_hero-circle) / 2)
  );

  -webkit-mask-image: var(--_ink-mask);
  mask-image: var(--_ink-mask);
  opacity: 0;
  pointer-events: none;
  user-select: none;
  transition: opacity 300ms ease-out;
}

.hero-gif__ink--on {
  opacity: 1;
}

/* Гиф: правый нижний угол карточки — в (курсор − 8, курсор − 8), Р48, Н46 */
.hero-gif__gif {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--_hero-gif-w);
  height: var(--_hero-gif-h);
  background-image: image-set(
    url('~/assets/images/hero-gif.webp') 1x,
    url('~/assets/images/hero-gif@2x.webp') 2x
  );
  background-size: 100% 100%;
  transform: translate(
    calc(var(--gif-x) - var(--_hero-gif-offset) - var(--_hero-gif-w) + var(--_hero-gif-pad-r)),
    calc(var(--gif-y) - var(--_hero-gif-offset) - var(--_hero-gif-h) + var(--_hero-gif-pad-b))
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease-out;
}

.hero-gif__gif--on {
  opacity: 1;
}

@media (min-width: 768px) {
  .hero-gif {
    --_hero-height: 720px; /* Figma 2064:1535 @768 */
    --_hero-text-width: 680px; /* Figma 2064:1539 @768 */
  }
}

@media (min-width: 1024px) {
  .hero-gif {
    /* Н47 — решение владельца 24.11.2026: ≥ 1024 hero по высоте окна, но не ниже содержимого */
    /* Н50: под zoom на html единицы vh/svh уменьшаются вместе с блоком — делим на --site-zoom, hero = ровно окно */
    height: calc(100vh / var(--site-zoom));
    height: calc(100svh / var(--site-zoom));
    min-height: min-content;
    /* высота hero ≥ 1024 — по окну (Н47); высоты фреймов 768/800/900/1080: 2064:1423, 2063:1465, 2063:1353, 35:2170 */
    --_hero-text-width: 790px; /* Figma 2064:1427 @1024 */
  }
}

@media (min-width: 1280px) {
  .hero-gif {
    --_hero-text-width: 870px; /* Figma 2063:1469 @1280 */
  }
}

@media (min-width: 1440px) {
  .hero-gif {
    --_hero-text-width: 950px; /* Figma 2063:1357 @1440 */
  }
}

@media (min-width: 1920px) {
  .hero-gif {
    --_hero-text-width: 1106px; /* Figma 35:2174 @1920 */
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-gif__ink,
  .hero-gif__gif {
    transition: none;
  }
}
</style>
