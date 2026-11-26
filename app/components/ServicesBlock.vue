<script setup lang="ts">
// ServicesBlock — Figma services-block 8:410 (State: Default / Opened · Type: Branding / Marketing / UX/UI /
// Design Support · Device: Desktop / Mobile). Один блок аккордеона направления услуг; список из 4 блоков
// собирает страница. «Компоненты» → «Главная: кейсы и услуги», ТЗ → «Главная» п. 4, «Общие правила» п. 7–9,
// «Интерактив»; Р5, Р8, Р32, Р46, Р56, Р70, Р74, Р75.
// Какой вариант на какой ширине: Desktop на ≥ 1024, Mobile на 768 и 380 — переключается медиазапросом на 1024.
// Состояние Default ⇄ Opened — клик по шапке (весь верх блока — кнопка внутри h3); панель кнопку-переключатель
// не нажимает, т.к. стоит вне неё. При загрузке блок всегда закрыт (Р5).
// Н63 — владелец 24.11.2026: без кнопки «Обсудить проект» в блоках услуг (ключ cta.discuss остаётся в словарях).
import CaptionItem from '~/components/CaptionItem.vue'

export type ServicesBlockType = 'branding' | 'marketing' | 'interfaces' | 'support'

const props = withDefaults(
  defineProps<{
    /** Type в Figma: Branding / Marketing / UX/UI / Design Support. */
    type: ServicesBlockType
    /** Только песочница /__kit: блок раскрыт сразу (State=Opened). На сайте не передаётся — все блоки закрыты (Р5). */
    initialOpen?: boolean
  }>(),
  { initialOpen: false },
)

const { t } = useI18n()
const uid = useId()
const panelId = `${uid}-panel`

const isOpen = ref(props.initialOpen)

// Н52 — владелец 24.11.2026: длинное название переносится на вторую строку. Лишняя высота названия сверх одной
// строки (--_extra) измеряется и добавляется к высоте шапки и блока; при одной строке равна 0 — вид не меняется.
const rootEl = ref<HTMLElement | null>(null)
const toggleEl = ref<HTMLElement | null>(null)
let titleObserver: ResizeObserver | undefined
function measureTitle() {
  const root = rootEl.value
  const toggle = toggleEl.value
  if (!root || !toggle) return
  const lh = parseFloat(getComputedStyle(toggle).lineHeight)
  const extra = Number.isFinite(lh) ? Math.max(0, Math.round(toggle.offsetHeight - lh)) : 0
  root.style.setProperty('--_extra', `${extra}px`)
}
// TODO(question): new Н59 — владелец 24.11.2026: раскрытый блок целиком в окне, фото максимально большое;
// остальные блоки не сжимаются. CSS берёт высоту панели (--_panel-h) как нижнюю границу высоты раскрытого блока:
// фото получает всё, что остаётся после шапки и панели.
const panelEl = ref<HTMLElement | null>(null)
let panelObserver: ResizeObserver | undefined
function measurePanel() {
  const root = rootEl.value
  const panel = panelEl.value
  if (!root || !panel) return
  root.style.setProperty('--_panel-h', `${Math.ceil(panel.offsetHeight)}px`)
}
onMounted(() => {
  measureTitle()
  measurePanel()
  if (typeof ResizeObserver !== 'undefined') {
    if (toggleEl.value) {
      titleObserver = new ResizeObserver(measureTitle)
      titleObserver.observe(toggleEl.value)
    }
    if (panelEl.value) {
      panelObserver = new ResizeObserver(measurePanel)
      panelObserver.observe(panelEl.value)
    }
  }
})
onBeforeUnmount(() => {
  titleObserver?.disconnect()
  panelObserver?.disconnect()
  cancelAnimationFrame(scrollFrame)
})

// Пункты панели (ключи словаря home.services.blocks.<type>.items.<id>), порядок как в «Контенте»
const ITEMS: Record<ServicesBlockType, string[]> = {
  branding: ['branding', 'rebranding', 'logo', 'brandbook'],
  marketing: ['social', 'adCreatives', 'communicationStrategy'],
  interfaces: ['websites', 'mobileApps', 'platforms'],
  support: ['consultation', 'support'],
}
const items = computed(() => ITEMS[props.type])
const base = computed(() => `home.services.blocks.${props.type}`)

// ---------- Фото ----------
// Исходники из Figma (8:411 … 8:452): ширина исходника 1880 (у Branding 1672); один и тот же кадр на всех
// ширинах и в обоих состояниях. Н59 (мнение дизайнера 24.11.2026): у Marketing в Figma закрытый кадр (1880×1000) — другое
// кадрирование, чем раскрытый (1880×1237); при раскрытии фото «прыгало» — теперь один кадр (раскрытый) в обоих состояниях;
// services-marketing-closed@* остаются в assets, не используются.
// Три размера под srcset вместо файлов на каждую из 6 ширин: исходник один, масштабирует object-fit.
const photos = import.meta.glob<string>(
  ['../assets/images/services-*.webp', '!../assets/images/services-*-closed@*.webp'],
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
)
function photoSet(name: string): { srcset: string } {
  const widths: [string, number][] = [
    ['760', 760],
    ['1250', 1250],
    ['1880', name === 'services-branding' ? 1672 : 1880],
  ]
  return {
    srcset: widths
      .map(([key, w]) => `${photos[`../assets/images/${name}@${key}.webp`]} ${w}w`)
      .join(', '),
  }
}
const openedPhoto = computed(() => photoSet(`services-${props.type}`))
const photoSizes = '(min-width: 1920px) 1880px, 100vw'

// ---------- Переключение ----------
// Н59 — владелец 24.11.2026: при раскрытии страница плавно (300 мс ease-out; reduced motion — мгновенно) прокручивается
// так, чтобы раскрытый блок оказался целиком в окне (верх блока у верха окна с полем --_vmargin), если он не помещается
// в текущей позиции. Ждём конца роста блока (иначе соседний закрывающийся блок сдвигает его верх). При закрытии — без прокрутки.
let scrollFrame = 0
function reduced(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
function revealOpened() {
  const root = rootEl.value
  if (!root || !isOpen.value) return
  const rect = root.getBoundingClientRect()
  if (rect.top >= 0 && rect.bottom <= window.innerHeight) return
  const y0 = window.scrollY
  // целевая позиция браузера с учётом scroll-margin-top и zoom (Н50): примерить мгновенно и вернуть в том же кадре
  root.scrollIntoView({ block: 'start', behavior: 'instant' })
  const y1 = window.scrollY
  window.scrollTo({ top: y0, behavior: 'instant' })
  if (Math.abs(y1 - y0) < 1) return
  if (reduced()) {
    window.scrollTo({ top: y1, behavior: 'instant' })
    return
  }
  const start = performance.now()
  const step = (now: number) => {
    const k = Math.min(1, (now - start) / 300)
    const eased = 1 - (1 - k) ** 3 // ease-out
    window.scrollTo({ top: y0 + (y1 - y0) * eased, behavior: 'instant' })
    scrollFrame = k < 1 ? requestAnimationFrame(step) : 0
  }
  cancelAnimationFrame(scrollFrame)
  scrollFrame = requestAnimationFrame(step)
}
function toggle() {
  const root = rootEl.value
  if (!isOpen.value && root) {
    // Навбар показан (пришли снизу) — раскрытый блок отступает от верха на его зону; скрыт — зоны нет.
    // Класс навбара читаем напрямую: управлять им из блока нельзя (Н48 — окно тишины после клика не меняет его состояние).
    const nav = document.querySelector('.navbar')
    const shown = !!nav && !nav.classList.contains('navbar--hidden')
    root.style.setProperty('--_nav', shown ? 'var(--_hm-scroll-margin, 0px)' : '0px')
  }
  isOpen.value = !isOpen.value
  if (!isOpen.value) return
  if (!root) return
  if (reduced()) {
    nextTick(revealOpened)
    return
  }
  let done = false
  const finish = () => {
    if (done) return
    done = true
    root.removeEventListener('transitionend', onEnd)
    revealOpened()
  }
  const onEnd = (event: TransitionEvent) => {
    if (event.target === root && event.propertyName === 'height') finish()
  }
  root.addEventListener('transitionend', onEnd)
  setTimeout(finish, 450)
}
</script>

<template>
  <div ref="rootEl" class="services-block" :class="{ 'services-block--open': isOpen }">
    <!-- Фото-фон, alt="" (Р70); закрытое состояние — с затемнением Alpha/Black 50, раскрытое — без -->
    <div class="services-block__media" aria-hidden="true">
      <img
        class="services-block__img"
        :srcset="openedPhoto.srcset"
        :sizes="photoSizes"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <span class="services-block__shade" />
    </div>

    <div class="services-block__head">
      <h3 class="services-block__title">
        <!-- Вся верхняя полоса — кнопка: ::after растянут на шапку -->
        <button
          ref="toggleEl"
          type="button"
          class="services-block__toggle"
          :aria-expanded="isOpen ? 'true' : 'false'"
          :aria-controls="panelId"
          @click="toggle"
        >
          {{ t(`${base}.title`) }}
        </button>
      </h3>
    </div>

    <div :id="panelId" ref="panelEl" class="services-block__panel">
      <CaptionItem
        v-for="id in items"
        :key="id"
        class="services-block__item"
        :title="t(`${base}.items.${id}.title`)"
        :text="t(`${base}.items.${id}.text`)"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * Значения по ширинам — из экранов главной RU (эталон — экран, Р3), EN — та же геометрия (Р75):
 * 1920 35:2210 (+ мастер 8:443 / 8:411), 1440 2063:1396 / 2063:1395, 1280 2063:1508 / 2063:1507,
 * 1024 2064:1466 / 2064:1465, 768 2064:1578 / 2064:1577, 380 35:2505 / 35:2504.
 * База — 380; ступени 768, 1024, 1280, 1440, 1920. Анимация раскрытия — 300 мс ease-out, меняется высота
 * блока, затемнение гаснет, панель появляется (решение владельца 20.11.2026 (Н22)).
 */
.services-block {
  /* Mobile, 380 */
  --_closed-h: 70px; /* Figma 35:2505 @380 */
  --_open-h: 480px; /* Figma 35:2504 @380 */
  --_extra: 0px; /* Н52: высота второй строки названия, задаёт скрипт */
  --_panel-h: 160px; /* высота белой панели с пунктами, задаёт скрипт (measurePanel) */
  --_head-pad-x: 16px; /* Figma 35:2505 / I35:2504;35:7352 @380 */
  --_radius: var(--radius-40); /* Radius/40 = 20 на 380, Figma 35:2504 */
  --_panel-pad: 16px; /* Figma I35:2504;35:7355 */
  --_panel-gap: 16px; /* Figma I35:2504;35:7355 */
  --_ease: 300ms ease-out;

  /* Н59 — владелец 24.11.2026: раскрытый блок целиком в окне, фото максимально большое; остальные блоки не сжимаются.
     Высота раскрытого блока = min(высота по макету, окно − поля сверху и снизу), но не меньше шапки + панели;
     фото (фон на весь блок) занимает всё, что остаётся над панелью. Высота окна — с учётом zoom (Н50). */
  --_vmargin: var(--space-24); /* поле сверху/снизу окна */
  /* Зона показанного навбара (поле + капсула + поле, как scroll-margin у #form, Н17): страница задаёт --_hm-scroll-margin.
     Ненулевая только если навбар в момент раскрытия показан (пришли снизу) — тогда название не под навбаром (toggle). */
  --_nav: 0px;
  --_win: calc(100vh / var(--site-zoom, 1));
  --_open-eff: max(
    calc(var(--_closed-h) + var(--_panel-h)),
    min(var(--_open-h), calc(var(--_win) - 2 * var(--_vmargin) - var(--_nav)))
  );

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: calc(var(--_closed-h) + var(--_extra));
  border-radius: var(--_radius);
  overflow: hidden;
  scroll-margin-top: calc(
    var(--_vmargin) + var(--_nav)
  ); /* верх раскрытого блока у верха окна с полем и зоной показанного навбара (revealOpened) */
  transition: height var(--_ease);
}

@supports (height: 100svh) {
  .services-block {
    --_win: calc(100svh / var(--site-zoom, 1));
  }
}

.services-block--open {
  height: calc(var(--_open-eff) + var(--_extra));
}

/* Обводка фокуса на весь блок (ТЗ → «Общие правила» п. 8: у блоков услуг есть обводка, Р46) */
.services-block:has(.services-block__toggle:focus-visible) {
  outline: 2px solid var(--color-blue-500);
  outline-offset: 2px;
}

/* Запасной вариант без :has — обводка на самой кнопке-переключателе, 2 px Blue 500 с отступом 2 px */
@supports not selector(:has(*)) {
  .services-block__toggle:focus-visible {
    outline: 2px solid var(--color-blue-500);
    outline-offset: 2px;
  }
}

/* ---------- Фото и затемнение ---------- */
.services-block__media {
  /* Н59 — мнение дизайнера 24.11.2026: фото при раскрытии не увеличивается и не сдвигается. Оно всегда размером
     раскрытого блока (cover под итоговую высоту), прижато к верху; блок (overflow: hidden) растёт как шторка и
     открывает его, закрытый блок показывает верхнюю полосу. Один кадр в обоих состояниях (кросс-фейд закрытого Marketing по Н22 не используется, Н59). */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(var(--_open-eff) + var(--_extra));
  z-index: -1;
  /* Н59: фото на своём слое — Safari не перерисовывает его при росте высоты блока (мерцание) */
  transform: translateZ(0);
  backface-visibility: hidden;
}

.services-block__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover; /* Figma: object-cover, центр */
}

.services-block__shade {
  position: absolute;
  inset: 0;
  background-color: var(--color-black-a50); /* Alpha/Black 50, только в Default */
  transition: opacity var(--_ease);
}

.services-block--open .services-block__shade {
  opacity: 0;
}

/* ---------- Шапка ----------
   Н63 — владелец 24.11.2026: «название качает при открытии». TODO(question): new Н63 (кнопка удалена, шапка неподвижна). Шапка одной высоты и с одними полями в Default и Opened
   (как в Default по Figma): название стоит неподвижно, фото раскрытого блока просто продолжается под шапкой. */
.services-block__head {
  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: calc(var(--_closed-h) + var(--_extra));
  padding-inline: var(--_head-pad-x);
}

.services-block__title {
  margin: 0;
  min-width: 0;
  font-size: var(--fs-h5);
  line-height: var(--lh-h5);
  font-weight: var(--fw-medium);
}

.services-block__toggle {
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-white);
  font: inherit;
  display: block;
  text-align: left;
  /* Н52 — владелец 24.11.2026: длинное название переносится на вторую строку */
  white-space: normal;
  cursor: pointer;
  /* Н59 — владелец 24.11.2026: без подсветки тапа и мерцания при раскрытии на телефоне */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}

.services-block__head,
.services-block__toggle::after {
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}

.services-block__toggle:focus:not(:focus-visible) {
  outline: none; /* фокус от тапа/мыши не рисуется; клавиатурный :focus-visible остаётся заметным */
}

.services-block__toggle::after {
  content: '';
  position: absolute;
  inset: 0;
}

@supports selector(:has(*)) {
  .services-block__toggle:focus-visible {
    outline: none; /* обводка — на весь блок, см. :has выше */
  }
}

/* ---------- Белая панель с пунктами ---------- */
.services-block__panel {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: var(--_panel-gap);
  box-sizing: border-box;
  margin-top: auto;
  padding: var(--_panel-pad);
  background-color: var(--color-white);
  /* Закрытая панель недоступна ни для фокуса, ни для читалки — после анимации закрытия; содержимое проявляется
     вместе с ростом высоты блока (Н59), а не выскакивает под шапкой */
  visibility: hidden;
  opacity: 0;
  transition:
    opacity var(--_ease),
    visibility 0s linear 300ms;
}

.services-block--open .services-block__panel {
  visibility: visible;
  opacity: 1;
  transition:
    opacity var(--_ease),
    visibility 0s linear 0s;
}

.services-block__item {
  width: 100%;
}

/* ---------- 768 (Mobile) ---------- */
@media (min-width: 768px) {
  .services-block {
    --_closed-h: 70px; /* Figma 2064:1578 @768 */
    --_open-h: 692px; /* Figma 2064:1577 @768 */
    --_radius: 20px; /* Figma 2064:1578 @768 (Radius/40 на 768 = 24, не совпадает) */
  }
}

/* ---------- Desktop ≥ 1024: поля шапки 40, пункты панели делят её ширину поровну ---------- */
@media (min-width: 1024px) {
  .services-block {
    --_closed-h: 120px; /* Figma 2064:1466 @1024 (соседние блоки 121 из-за округления) */
    --_open-h: 1000px; /* Figma 2064:1465 @1024 */
    --_head-pad-x: var(--space-40); /* 26 на 1024: Figma 2064:1466 */
    --_radius: var(
      --radius-40
    ); /* 26 / 30 / 32 / 40 — Figma 2064:1465, 2063:1507, 2063:1395, 8:411 */
    --_panel-pad: 40px; /* Figma I2064:1465;8:415 @1024, I2063:1507;8:415 @1280, I2063:1395;8:415 @1440, I8:411;8:415 @1920 */
    --_panel-gap: 16px; /* Figma I2064:1465;8:415 @1024, I2063:1507;8:415 @1280, I2063:1395;8:415 @1440, I8:411;8:415 @1920 */
  }

  .services-block__panel {
    flex-direction: row;
    align-items: flex-start;
  }

  .services-block__item {
    flex: 1 0 0; /* колонки делят панель поровну на число пунктов (Figma I2063:1395;8:415 @1440 …) */
    width: auto;
  }
}

@media (min-width: 1280px) {
  .services-block {
    --_closed-h: 176px; /* Figma 2063:1508 @1280 */
    --_open-h: 796px; /* Figma 2063:1507 @1280 */
  }
}

@media (min-width: 1440px) {
  .services-block {
    --_closed-h: 132px; /* Figma 2063:1396 @1440 */
    --_open-h: 1000px; /* Figma 2063:1395 @1440 */
  }
}

@media (min-width: 1920px) {
  .services-block {
    --_closed-h: 176px; /* Figma 35:2210 / 8:443 @1920 */
    --_open-h: 1000px; /* Figma 8:411 */
  }
}

/* prefers-reduced-motion: переходы обнуляет глобальное правило base.css (ТЗ → «Общие правила» п. 7) */
</style>
