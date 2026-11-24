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

// TODO(question): new Н55 — владелец 24.11.2026: подсветка кругом «топорная». Три варианта на выбор, временный ?hl=:
// (нет) — круг как раньше · letters — буквы темнеют по близости к гифу · words — след из слов · blue — letters синим
// (blue-words — то же для слов). Выбранное оставим, лишнее удалим. Центр подсветки — позиция гифа (та же инерция, GIF_FOLLOW).
type Highlight = 'circle' | 'letters' | 'words'
const mode = ref<Highlight>('circle')
const blue = ref(false)
const split = computed(() => mode.value !== 'circle')

const textEl = ref<HTMLElement | null>(null)
const enabled = ref(false)
const active = ref(false)
const reduced = ref(false)

// Разбивка надписи: буквы (letters) или слова (words); пробелы — обычным текстом, переносы строк не меняются.
const parts = computed(() => {
  const text = t('home.hero')
  if (mode.value === 'letters') {
    return Array.from(text).map((s) => ({ s, w: s !== ' ' }))
  }
  return text.split(/( )/).map((s) => ({ s, w: s !== ' ' && s !== '' }))
})

let mql: MediaQueryList | null = null
let rmql: MediaQueryList | null = null
let frame = 0
let x = 0 // цель: курсор
let y = 0
let gx = 0 // гиф: догоняет курсор с инерцией
let gy = 0

// Н46 — решение владельца 24.11.2026: гиф догоняет курсор, pos += (цель − pos) × k
const GIF_FOLLOW = 0.2
const GIF_SETTLE = 0.5 // px: ближе — считаем, что догнал, rAF останавливается
// Н55: буквы темнеют так же быстро, как движется гиф (GIF_FOLLOW), а гаснут медленнее — остаётся мягкий след
const HL_RADIUS = 240 // px (локальные): подсветка спадает до нуля на этом расстоянии от гифа
const HL_FADE = 0.06 // k затухания буквы за кадр
const HL_WORD_REACH = 70 // px: слово «горит», если ближе этого расстояния от гифа
const HL_SETTLE = 0.004

// измеренные один раз центры букв / рамки слов (локальные координаты внутри textEl)
let toks: HTMLElement[] = []
let box: { l: number; t: number; r: number; b: number }[] = []
let level: number[] = []
let shown: number[] = []
let lit: boolean[] = []
let ro: ResizeObserver | null = null

function measure() {
  const el = textEl.value
  if (!el || !split.value) return
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
    lit = toks.map(() => false)
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
          pct === 0 ? '' : `color-mix(in srgb, var(--_hl) ${pct}%, var(--color-gray-500))`
      }
    }
  }
  return moving
}

function paintWords(on: boolean) {
  for (let i = 0; i < toks.length; i++) {
    const b = box[i]
    if (!b) continue
    const dx = Math.max(b.l - gx, 0, gx - b.r)
    const dy = Math.max(b.t - gy, 0, gy - b.b)
    const now = on && Math.hypot(dx, dy) < HL_WORD_REACH
    if (now !== lit[i]) {
      lit[i] = now
      toks[i]?.classList.toggle('hero-gif__tok--lit', now)
    }
  }
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
  el.style.setProperty('--hero-x', `${x}px`) // круг — без задержки
  el.style.setProperty('--hero-y', `${y}px`)
  el.style.setProperty('--gif-x', `${gx}px`)
  el.style.setProperty('--gif-y', `${gy}px`)
  let moving = false
  if (mode.value === 'letters') moving = paintLetters(active.value)
  else if (mode.value === 'words') paintWords(active.value)
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
  if (split.value) tick() // буквы плавно гаснут, слова — через CSS-transition
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
  // круг — как раньше, только без reduced motion; новые варианты работают и при нём, но без инерции (мгновенно)
  const on = mql.matches && (!rmql.matches || split.value)
  if (on && !enabled.value) {
    enabled.value = true
    bind(el)
    if (split.value) void nextTick(measure)
  } else if (!on && enabled.value) {
    enabled.value = false
    active.value = false
    unbind(el)
  }
}

onMounted(() => {
  const q = new URLSearchParams(window.location.search).get('hl') ?? ''
  if (q === 'letters' || q === 'blue') mode.value = 'letters'
  else if (q === 'words' || q === 'blue-words') mode.value = 'words'
  blue.value = q === 'blue' || q === 'blue-words'
  mql = window.matchMedia('(pointer: fine) and (min-width: 1024px)')
  rmql = window.matchMedia('(prefers-reduced-motion: reduce)')
  mql.addEventListener('change', sync)
  rmql.addEventListener('change', sync)
  sync()
  if (split.value && textEl.value) {
    ro = new ResizeObserver(() => measure())
    ro.observe(textEl.value)
    void document.fonts?.ready.then(measure)
  }
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
    <div ref="textEl" class="hero-gif__text" :class="{ 'hero-gif__text--blue': blue }">
      <h1 class="hero-gif__line" :aria-label="enabled && split ? t('home.hero') : undefined">
        <template v-if="enabled && split">
          <template v-for="(p, i) in parts" :key="i">
            <span v-if="p.w" class="hero-gif__tok" aria-hidden="true">{{ p.s }}</span>
            <template v-else>{{ p.s }}</template>
          </template>
        </template>
        <template v-else>{{ t('home.hero') }}</template>
      </h1>
      <template v-if="enabled">
        <div
          v-if="!split"
          class="hero-gif__line hero-gif__ink"
          :class="{ 'hero-gif__ink--on': active }"
          aria-hidden="true"
        >
          {{ t('home.hero') }}
        </div>
        <span
          v-if="!reduced || !split"
          class="hero-gif__gif"
          :class="{ 'hero-gif__gif--on': active }"
          aria-hidden="true"
        />
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
  --_hero-gif-offset: calc(
    8px / var(--site-zoom)
  ); /* Р48 — отступ, Н46: 8 px, не масштабируется; Н50: 8 px в окне при zoom */

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
  --_hl: var(--color-black); /* Н55: цвет подсветки букв/слов */

  position: relative;
  /* Н50 — владелец 24.11.2026: надпись hero без уменьшения (ширина блока в окне = как во фрейме) */
  width: calc(var(--_hero-text-width) / var(--site-zoom));
  max-width: 100%;
}

.hero-gif__text--blue {
  --_hl: var(--color-blue-500); /* Н55: вариант ?hl=blue */
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

/* Н55, words: слово загорается за 300 мс и медленно гаснет (~1,2 с) — остаётся «след» */
.hero-gif__tok {
  transition: color 1200ms ease-out;
}

.hero-gif__tok--lit {
  color: var(--_hl);
  transition-duration: 300ms;
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
  .hero-gif__gif,
  .hero-gif__tok {
    transition: none;
  }
}
</style>
