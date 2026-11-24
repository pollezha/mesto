<script setup lang="ts">
// HeroGif — hero-надпись главной (h1, Р56) с эффектом курсора: гиф на месте курсора (Н46) и подсветка букв по близости к нему (Н55).
// docs: «Компоненты» → «Hero» (gif 2092:3801: 7 кадров 348×330, 150 мс на кадр, по кругу — Р25);
// ТЗ → «Главная» п. 1 и «Интерактив» (Hero-надпись · курсор); Р48; «Общие правила» п. 7.
// Figma (надпись во фрейме «Header» экрана, RU и EN одинаково): 35:2174 @1920, 2063:1357 @1440,
// 2063:1469 @1280, 2064:1427 @1024, 2064:1539 @768, 35:2470 @380 (EN: 51:13660, 2065:1491, 2065:1668,
// 2066:1742, 2066:1919, 51:13708). Надпись по центру фрейма Header (по горизонтали и вертикали).
// Эффект — только при (pointer: fine) и ≥ 1024: иначе ни гифа, ни разбивки на буквы в DOM, слушатели не вешаются.
// При reduced motion буквы темнеют сразу (без инерции), гифа нет.
// Гиф: анимированный WebP, собран из 7 кадров 38:7680, 38:7687, 38:7694, 38:7701, 38:7714, 38:7723,
// 38:7728 (полотно 348×330, прозрачный фон; кадры 02, 05, 07 выходят за карточку 160×217).

const { t } = useI18n()

// Н55 — решение владельца 24.11.2026: подсветка букв по близости (letters): буква темнеет тем сильнее, чем ближе к гифу.

const textEl = ref<HTMLElement | null>(null)
const enabled = ref(false)
const active = ref(false)
const reduced = ref(false)

// Разбивка надписи на буквы; пробелы — обычным текстом, переносы строк не меняются.
const parts = computed(() => Array.from(t('home.hero')).map((s) => ({ s, w: s !== ' ' })))

let mql: MediaQueryList | null = null
let rmql: MediaQueryList | null = null
let frame = 0
let x = 0 // цель: курсор
let y = 0
let gx = 0 // гиф: догоняет курсор с инерцией
let gy = 0

// Н46 — решение владельца 24.11.2026: гиф догоняет курсор, pos += (цель − pos) × k
const GIF_FOLLOW = 0.3
const GIF_SETTLE = 0.5 // px: ближе — считаем, что догнал, rAF останавливается
// Н55 (владелец 24.11.2026: быстрее, радиус меньше): буквы темнеют так же быстро, как движется гиф (GIF_FOLLOW 0.3), а гаснут чуть медленнее
const HL_RADIUS = 160 // px (локальные): подсветка спадает до нуля на этом расстоянии от гифа
const HL_FADE = 0.12 // k затухания буквы за кадр
const HL_SETTLE = 0.004

// измеренные один раз рамки букв (локальные координаты внутри textEl)
let toks: HTMLElement[] = []
let box: { l: number; t: number; r: number; b: number }[] = []
let level: number[] = []
let shown: number[] = []
let ro: ResizeObserver | null = null

function measure() {
  const el = textEl.value
  if (!el) return
  toks = Array.from(el.querySelectorAll<HTMLElement>('.hero-gif__tok'))
  const o = el.getBoundingClientRect()
  const zoom = siteZoom()
  box = toks.map((tk) => {
    const r = tk.getBoundingClientRect()
    return {
      l: (r.left - o.left) / zoom,
      t: (r.top - o.top) / zoom,
      r: (r.right - o.left) / zoom,
      b: (r.bottom - o.top) / zoom,
    }
  })
  if (level.length !== toks.length) {
    level = toks.map(() => 0)
    shown = toks.map(() => -1)
  }
}

// Н50 — владелец 24.11.2026: сайт масштабируется CSS zoom на html (siteZoom(), utils/siteZoom.ts). getBoundingClientRect и clientX/Y —
// в пикселях окна, а left/top, transform и mask внутри блока — в «локальных» (до zoom). Делим на коэффициент.
function readPoint(e: PointerEvent) {
  const el = textEl.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  const zoom = siteZoom()
  x = (e.clientX - rect.left) / zoom
  y = (e.clientY - rect.top) / zoom
}

// возвращает true, пока подсветка ещё меняется
function paintLetters(on: boolean): boolean {
  let moving = false
  for (let i = 0; i < toks.length; i++) {
    const b = box[i]
    if (!b) continue
    const s = on
      ? Math.min(
          1,
          Math.max(0, 1 - Math.hypot(gx - (b.l + b.r) / 2, gy - (b.t + b.b) / 2) / HL_RADIUS),
        )
      : 0
    const target = s * s * (3 - 2 * s) // smoothstep: мягкий спад без видимой границы
    let cur = level[i] ?? 0
    if (reduced.value) cur = target
    else cur += (target - cur) * (target > cur ? GIF_FOLLOW : HL_FADE)
    if (Math.abs(target - cur) < HL_SETTLE) cur = target
    else moving = true
    level[i] = cur
    const pct = Math.round(cur * 100)
    if (pct !== shown[i]) {
      shown[i] = pct
      const tk = toks[i]
      if (tk) {
        tk.style.color =
          pct === 0 ? '' : `color-mix(in srgb, var(--color-black) ${pct}%, var(--color-gray-500))`
      }
    }
  }
  return moving
}

function tick() {
  frame = 0
  const el = textEl.value
  if (!el) return
  gx += (x - gx) * GIF_FOLLOW
  gy += (y - gy) * GIF_FOLLOW
  let done = Math.abs(x - gx) < GIF_SETTLE && Math.abs(y - gy) < GIF_SETTLE
  if (done || reduced.value) {
    gx = x
    gy = y
    done = true
  }
  el.style.setProperty('--gif-x', `${gx}px`)
  el.style.setProperty('--gif-y', `${gy}px`)
  const moving = paintLetters(active.value)
  if (!done || moving) frame = requestAnimationFrame(tick)
}

function onEnter(e: PointerEvent) {
  readPoint(e)
  gx = x // появление сразу в точке курсора, без «прилёта»
  gy = y
  if (frame) cancelAnimationFrame(frame)
  active.value = true
  tick()
}

function onMove(e: PointerEvent) {
  readPoint(e)
  if (!frame) frame = requestAnimationFrame(tick)
}

function onLeave() {
  active.value = false
  if (frame) cancelAnimationFrame(frame)
  frame = 0
  tick() // буквы плавно гаснут
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
  if (!el || !mql || !rmql) return
  reduced.value = rmql.matches
  const on = mql.matches
  if (on && !enabled.value) {
    enabled.value = true
    bind(el)
    void nextTick(() => {
      measure()
      if (!ro) {
        ro = new ResizeObserver(() => measure())
        ro.observe(el)
        void document.fonts?.ready.then(measure)
      }
    })
  } else if (!on && enabled.value) {
    enabled.value = false
    active.value = false
    unbind(el)
  }
}

onMounted(() => {
  mql = window.matchMedia('(pointer: fine) and (min-width: 1024px)')
  rmql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', sync)
  rmql.addEventListener('change', sync)
  sync()
})

onBeforeUnmount(() => {
  mql?.removeEventListener('change', sync)
  rmql?.removeEventListener('change', sync)
  ro?.disconnect()
  if (textEl.value) unbind(textEl.value)
  if (frame) cancelAnimationFrame(frame)
})
</script>

<template>
  <section class="hero-gif">
    <div
      ref="textEl"
      class="hero-gif__text"
      :class="{ 'hero-gif__text--gif': enabled && !reduced }"
    >
      <h1 class="hero-gif__line" :aria-label="enabled ? t('home.hero') : undefined">
        <template v-if="enabled">
          <template v-for="(p, i) in parts" :key="i">
            <span v-if="p.w" class="hero-gif__tok" aria-hidden="true">{{ p.s }}</span>
            <template v-else>{{ p.s }}</template>
          </template>
        </template>
        <template v-else>{{ t('home.hero') }}</template>
      </h1>
      <span
        v-if="enabled && !reduced"
        class="hero-gif__gif"
        :class="{ 'hero-gif__gif--on': active }"
        aria-hidden="true"
      />
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
     гиф догоняет курсор с инерцией (k в скрипте) */
  --_hero-gif-scale: 0.4; /* подбирает владелец */
  /* Figma 2092:3801: карточка 87,56 160×217 в полотне 348×330; поле справа 348−247=101, снизу 330−273=57 */
  --_hero-gif-w: calc(348px * var(--_hero-gif-scale));
  --_hero-gif-h: calc(330px * var(--_hero-gif-scale));
  /* владелец 24.11.2026: гиф на месте курсора, курсор скрыт (Н46); центр видимой карточки 160×217 в полотне 348×330 (Figma 2092:3801): (87+80, 56+108.5) */
  --_hero-gif-cx: calc(167px * var(--_hero-gif-scale));
  --_hero-gif-cy: calc(164.5px * var(--_hero-gif-scale));

  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-height: var(--_hero-height);
}

.hero-gif__text {
  --gif-x: 0px;
  --gif-y: 0px;

  position: relative;
  /* Н50 — владелец 24.11.2026: надпись hero без уменьшения (ширина блока в окне = как во фрейме) */
  width: calc(var(--_hero-text-width) / var(--site-zoom));
  max-width: 100%;

  /* владелец 24.11.2026: надпись hero не выделяется (Н55) */
  cursor: default;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}

.hero-gif__text--gif {
  cursor: none; /* владелец 24.11.2026: гиф на месте курсора, курсор скрыт (Н46); только над надписью, пока эффект работает */
}

.hero-gif__line {
  margin: 0;
  color: var(--color-gray-500);
  /* Н50 — владелец 24.11.2026: надпись hero без уменьшения (кегль и интервал в окне = как во фрейме) */
  font-size: calc(var(--fs-h3) / var(--site-zoom));
  font-weight: var(--fw-medium);
  line-height: calc(var(--lh-h3) / var(--site-zoom));
  text-align: center;
}

/* Н55: цвет буквы ставит скрипт (color-mix по близости к гифу); transition — как было в режиме letters до выбора */
.hero-gif__tok {
  transition: color 600ms ease-out;
}

/* Гиф: центр карточки — в точке курсора (с инерцией), владелец 24.11.2026, Н46 */
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
    calc(var(--gif-x) - var(--_hero-gif-cx)),
    calc(var(--gif-y) - var(--_hero-gif-cy))
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 300ms ease-out;
}

.hero-gif__gif--on {
  opacity: 1;
}

/* Н61 — владелец 24.11.2026: на < 1024 нет подсветки курсором, поэтому надпись сразу чёрная (было Gray 500, блёкло).
   Откат — убрать правило. TODO(question): new Н61 */
@media (max-width: 1023px) {
  .hero-gif__line {
    color: var(--color-black);
  }
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
  .hero-gif__gif,
  .hero-gif__tok {
    transition: none;
  }
}
</style>
