<script setup lang="ts">
// Typing — перебивка главной «Помогаем бизнесу [слово] через бренд и цифровой продукт».
// Отдельного компонента в Figma нет: блок Section на экранах главной (Р3 — экран главнее кита).
// Экраны RU: Section 35:2204 / 2063:1389 / 2063:1501 / 2064:1459 / 2064:1571 / 35:2498 (1920…380),
// текст 35:2205 / 2063:1390 / 2063:1502 / 2064:1460 / 2064:1572 / 35:2499;
// EN: Section 51:13692 / 2065:1523 / 2065:1700 / 2066:1774 / 2066:1951 / 51:13738, текст 51:13693 / 2065:1524 /
// 2065:1701 / 2066:1775 / 2066:1952 / 51:13739. Геометрия RU и EN одна: отличаются только тексты.
// ТЗ → «Главная» п. 3; «Общие правила» п. 7 (reduced motion — последнее слово без анимации), п. 9 (обычный текст,
// не заголовок); Р10 (слова по кругу), Р47 (тайминги, каретка).
// Тексты — словарь: home.tagline.template (плейсхолдер {word}) и home.tagline.words.
// Н18 — решение оркестратора по поручению владельца 20.11.2026: читалка — фраза с последним словом; каретка мигает резко.
// Перенос перед «через бренд…» / «through branding…» — решение владельца 22.11.2026 по Н19 (как в Figma): часть после
// {word} — блочный span, словари и читалка без изменений. Остальные переносы — по ширине блока.
import type { MessageFunction, VueMessageType } from 'vue-i18n'

const { t, tm, rt, locale } = useI18n()

// Р47: тайминги тайпинга, мс.
const TYPE_MS = 80 // печать, на букву
const ERASE_MS = 40 // стирание, на букву
const HOLD_MS = 1500 // пауза на готовом слове
const GAP_MS = 300 // пауза перед следующим словом

// Маркер места слова в шаблоне: t() подставляет его вместо {word}, по нему шаблон режется на части.
const MARK = ''

const words = computed<string[]>(() => {
  void locale.value
  const raw = tm('home.tagline.words') as unknown as (
    MessageFunction<VueMessageType> | VueMessageType
  )[]
  return Array.isArray(raw) ? raw.map((w) => rt(w)) : []
})

// SSR, без JS и reduced motion: последнее слово («масштабироваться» / «scale»).
const lastWord = computed(() => words.value[words.value.length - 1] ?? '')

const parts = computed(() => {
  const [before = '', after = ''] = t('home.tagline.template', { word: MARK }).split(MARK)
  // Часть после слова — с новой строки (Н19, решение владельца 22.11.2026; так во всех 12 экранах Figma): без ведущего пробела
  return { before, after: after.trimStart() }
})

// Доступный текст: полная фраза с последним словом (Н18); анимация для читалки скрыта.
const plainText = computed(() => t('home.tagline.template', { word: lastWord.value }))

const root = ref<HTMLElement | null>(null)
const animating = ref(false)
const typed = ref('')
const shown = computed(() => (animating.value ? typed.value : lastWord.value))

let timer: ReturnType<typeof setTimeout> | undefined
let observer: IntersectionObserver | undefined
let started = false

function later(fn: () => void, ms: number) {
  timer = setTimeout(fn, ms)
}

function glyphs(i: number): string[] {
  return Array.from(words.value[i] ?? '')
}

function typeStep(i: number, n: number) {
  const g = glyphs(i)
  typed.value = g.slice(0, n).join('')
  if (n < g.length) later(() => typeStep(i, n + 1), TYPE_MS)
  else later(() => eraseStep(i, n - 1), HOLD_MS)
}

function eraseStep(i: number, n: number) {
  typed.value = glyphs(i).slice(0, n).join('')
  if (n > 0) later(() => eraseStep(i, n - 1), ERASE_MS)
  else later(() => typeStep((i + 1) % words.value.length, 1), GAP_MS)
}

function stop() {
  clearTimeout(timer)
  timer = undefined
  observer?.disconnect()
  observer = undefined
}

function begin() {
  if (started || !words.value.length) return
  started = true
  observer?.disconnect()
  observer = undefined
  animating.value = true
  typeStep(0, 0)
}

let mq: MediaQueryList | undefined

function sync() {
  if (!mq) return
  if (mq.matches) {
    // reduced motion: останавливаем и показываем последнее слово
    stop()
    animating.value = false
    started = false
    return
  }
  if (started || observer || !root.value) return
  observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) begin()
  })
  observer.observe(root.value)
}

onMounted(() => {
  mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', sync)
  sync()
})

onBeforeUnmount(() => {
  mq?.removeEventListener('change', sync)
  stop()
})
</script>

<template>
  <p ref="root" class="typing">
    <span class="visually-hidden">{{ plainText }}</span>
    <span aria-hidden="true">
      <span>{{ parts.before }}</span>
      <!-- Место под слово = самое широкое из слов (невидимые копии в одной ячейке сетки): строка не прыгает -->
      <span class="typing__word"
        ><span v-for="w in words" :key="w" class="typing__ghost">{{ w }}</span
        ><span class="typing__live">{{ shown }}<span v-if="animating" class="typing__caret" /></span
      ></span>
      <span class="typing__rest">{{ parts.after }}</span>
    </span>
  </p>
</template>

<style scoped>
.typing {
  position: relative; /* для visually-hidden (absolute) */
  box-sizing: border-box;
  max-width: var(--container-max-width);
  margin: 0 auto;
  /* Section на экранах: отступы слева/справа = Spacing/40 (40 @1920, 32 @1440, 30 @1280, 26 @1024, 24 @768, 10 @380),
     сверху/снизу = Spacing/200 (200 / 160 / 150 / 130 / 120 / 120) — Figma 35:2204 @1920, 2063:1389 @1440,
     2063:1501 @1280, 2064:1459 @1024, 2064:1571 @768, 35:2498 @380 */
  padding: var(--space-200) var(--space-40);
  color: var(--color-black);
  font-size: var(--fs-txt-1);
  line-height: var(--lh-txt-1);
  font-weight: var(--fw-regular);
}

.typing__word {
  display: inline-grid;
  color: var(--color-blue-500);
  white-space: nowrap;
}

/* Вторая часть («через бренд…») всегда с новой строки: блочный span, не <br> */
.typing__rest {
  display: block;
}

.typing__ghost,
.typing__live {
  grid-area: 1 / 1;
}

.typing__ghost {
  visibility: hidden;
}

.typing__live {
  position: relative; /* для каретки: она вне потока и не меняет высоту строки */
  justify-self: start;
}

/* Каретка Р47: 2 px, Blue 500, мигает раз в секунду; резко on/off, высота — кегль текста (Н18).
   Вне потока (absolute, по центру строки): не влияет ни на line box, ни на ширину слова */
.typing__caret {
  position: absolute;
  top: 50%;
  left: 100%;
  width: 2px; /* Р47 */
  height: 1em; /* кегль текста элемента (на ≥ 1024 --fs-txt-1, на главной < 1024 страница ставит --fs-h3) */
  transform: translateY(-50%);
  background: var(--color-blue-500);
  animation: typing-blink 1s steps(1, end) infinite;
}

@keyframes typing-blink {
  50% {
    opacity: 0;
  }
}
</style>
