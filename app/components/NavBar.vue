<script setup lang="ts">
// NavBar — Figma 35:5013 (Type: Desktop 1:1482 / Mobile 35:5014 / Mobile-op 38:10183), пункты — menuItem 1:1716.
// «Компоненты» → «Навигация», ТЗ → «Общие правила» п. 2, 8, 10; «Интерактив»; Р6, Р23, Р46, Р53, Р55, Р62, Р63, Р68; В28.
// Какой вариант на какой ширине: Desktop на ≥ 1024, Mobile на 768 и 380; Mobile-op — открытое меню
// на < 1024. Переключение — медиазапросом на 1024; в разметке один набор ссылок: на ≥ 1024 это
// строка внутри капсулы, на < 1024 — отдельная панель под капсулой. Скрытое не получает фокус
// (display: none / visibility: hidden).
// Языки RU/EN в навбаре не живут (Р23: на ≥ 1024 — полоса Menu, на < 1024 — футер).
import Logo from '~/components/Logo.vue'
import ArrowIcon from '~/components/ArrowIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Только песочница /__kit: не fixed, а в потоке (иначе варианты перекрывают друг друга). */
    staticPosition?: boolean
    /** Только песочница /__kit: меню открыто сразу (Figma Type=Mobile-op). */
    initialOpen?: boolean
  }>(),
  { staticPosition: false, initialOpen: false },
)

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const menuId = useId()

const root = ref<HTMLElement | null>(null)
const burger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const open = ref(props.initialOpen)
// Н48 — решение владельца 24.11.2026: при прокрутке вниз навбар уезжает, при прокрутке вверх возвращается (заменяет «всегда на экране»).
// Начальное состояние «виден» (SSR, пререндер, без JS).
const hidden = ref(false)

const homePath = computed(() => localePath('/'))
// Р68: на самой главной логотип прокручивает наверх, «Проекты» — к #projects.
const isHome = computed(() => route.path.replace(/\/$/, '') === homePath.value.replace(/\/$/, ''))
const projectsTo = computed(() => `${homePath.value}#projects`)
// Р6 / Р55: если на странице нет #form — переход на «Контакты» своей локали сразу к форме.
const formTo = computed(() => `${localePath('/contacts')}#form`)

const { scrollToTop, scrollToId, isModifiedClick } = useScrollTo()

function closeMenu() {
  open.value = false
}

// Р6, Р68: обычный <a href> (RouterLink сработал бы раньше нашего обработчика и перебил плавный скролл).
// Цель на текущей странице — плавный скролл, иначе — переход по href.
function onAnchor(event: MouseEvent, href: string, scrollToTarget: () => boolean) {
  if (isModifiedClick(event)) return
  event.preventDefault()
  closeMenu()
  if (!scrollToTarget()) navigateTo(href)
}

function onLogo(event: MouseEvent) {
  onAnchor(event, homePath.value, () => {
    if (!isHome.value) return false
    return scrollToTop()
  })
}

function onProjects(event: MouseEvent) {
  onAnchor(event, projectsTo.value, () => isHome.value && scrollToId('projects'))
}

function onDiscuss(event: MouseEvent) {
  onAnchor(event, formTo.value, () => scrollToId('form'))
}

// ---------- Бургер: Mobile ⇄ Mobile-op ----------
// Н14 — решение владельца 20.11.2026: доступное имя бургера nav.menu = «Меню» / «Menu»
function toggleMenu() {
  open.value = !open.value
}

function focusables(): HTMLElement[] {
  if (!root.value) return []
  return Array.from(root.value.querySelectorAll<HTMLElement>('a[href], button')).filter(
    (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden',
  )
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
    burger.value?.focus()
    return
  }
  // Фокус остаётся в навбаре, пока меню открыто («Интерактив»: фокус в панели)
  if (event.key === 'Tab') {
    const items = focusables()
    const first = items[0]
    const last = items[items.length - 1]
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

// TODO(question): new Н67
// Н67 — владелец 24.11.2026: при открытом меню страница прокручивается, меню закрывается после прокрутки
// (отменяет ТЗ «Интерактив»: фон не скроллится). overflow у html меню не трогает.
const CLOSE_SCROLL_PX = 48 // прокрутка пользователя от позиции открытия, после которой меню закрывается (= --space-48)
const INTENT_MS = 1500 // сколько после wheel / touch / клавиши прокрутку считаем пользовательской (инерция тача)
let openY = 0
watch(
  open,
  (value) => {
    if (!import.meta.client) return
    if (value) {
      openY = window.scrollY
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
    }
  },
  { flush: 'sync' },
)

// Фокус — в панель, когда она уже в DOM с классом open (flush: post); visibility при открытии
// переключается без задержки, запасная попытка — если первая не удалась.
watch(
  open,
  (value) => {
    if (!value || !import.meta.client) return
    const focusFirst = () => {
      const first = panel.value?.querySelector<HTMLElement>('a[href]')
      first?.focus()
      return Boolean(first && panel.value?.contains(document.activeElement))
    }
    if (!focusFirst()) setTimeout(focusFirst, 50)
  },
  { flush: 'post' },
)

watch(() => route.fullPath, closeMenu)

// ---------- Н48: скрытие при прокрутке ----------
const UP_THRESHOLD = 1 // px прокрутки вверх, после которых навбар возвращается
let lastY = 0
let accDown = 0
let accUp = 0
let frame = 0
// Н48 — владелец 24.11.2026: навбар не появляется от клика и раскрытия блоков. Клик или смена высоты контента
// (аккордеон, картинки) запускают подстройку scroll snap / ограничение прокрутки браузером — это сдвиг scrollY вверх
// без участия пользователя. Пока «окно тишины» открыто, сдвиги не считаются прокруткой; wheel / touch / клавиши
// прокрутки закрывают окно сразу (пользователь снова ведёт прокрутку сам).
const QUIET_MS = 700
let quietUntil = 0
let lastIntentAt = 0
let lastIntentDir = 0 // -1 вверх, 1 вниз, 0 неизвестно (touch)
let resizeObserver: ResizeObserver | null = null
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'])

function openQuiet() {
  quietUntil = performance.now() + QUIET_MS
}
function onUserScrollIntent(dir = 0) {
  quietUntil = 0
  lastIntentAt = performance.now()
  lastIntentDir = dir
}
function onWheel(event: WheelEvent) {
  onUserScrollIntent(Math.sign(event.deltaY))
}
function onTouch() {
  onUserScrollIntent()
}
function onScrollKey(event: KeyboardEvent) {
  if (SCROLL_KEYS.has(event.key)) {
    onUserScrollIntent(['ArrowUp', 'PageUp', 'Home'].includes(event.key) ? -1 : 1)
  }
}

function zoneHeight(): number {
  if (!root.value) return 0
  // Н50: top и offsetHeight — локальные (до zoom), scrollY — в пикселях окна
  return ((Number.parseFloat(getComputedStyle(root.value).top) || 0) + root.value.offsetHeight) * siteZoom()
}

function update() {
  frame = 0
  if (props.staticPosition || open.value) {
    // Н67: только пользовательская прокрутка (wheel / touch / клавиши), не авто-подстройки браузера
    if (
      open.value &&
      performance.now() - lastIntentAt < INTENT_MS &&
      Math.abs(window.scrollY - openY) > CLOSE_SCROLL_PX
    ) {
      closeMenu()
    }
    hidden.value = false
    lastY = window.scrollY
    return
  }
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  const y = Math.min(Math.max(window.scrollY, 0), max) // «резиновая» прокрутка iOS игнорируется
  const delta = y - lastY
  lastY = y
  const zone = zoneHeight()
  if (y <= zone) {
    hidden.value = false
    accDown = 0
    accUp = 0
  } else if (performance.now() < quietUntil) {
    // сдвиг не от пользователя: положение запоминаем, состояние навбара не меняем
    accDown = 0
    accUp = 0
  } else if (delta > 0 && lastIntentDir < 0 && performance.now() - lastIntentAt < 1500) {
    // пользователь только что крутил вверх, а страница идёт вниз — это snap возвращает раздел на остановку: навбар не прячем
  } else if (delta > 0) {
    accUp = 0
    accDown += delta
    if (accDown > zone) hidden.value = true
  } else if (delta < 0) {
    accDown = 0
    accUp -= delta
    if (accUp > UP_THRESHOLD) hidden.value = false
  }
}

function onScroll() {
  if (!frame) frame = requestAnimationFrame(update)
}

// Фокус с клавиатуры (Tab, Р46) в спрятанном навбаре — показать сразу
function onFocusin(event: FocusEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches(':focus-visible')) {
    hidden.value = false
    accDown = 0
  }
}

let desktopQuery: MediaQueryList | null = null
function onDesktopChange(event: MediaQueryListEvent) {
  if (event.matches) closeMenu()
}

onMounted(() => {
  // На ≥ 1024 мобильного меню нет — закрыть
  desktopQuery = window.matchMedia('(min-width: 1024px)')
  desktopQuery.addEventListener('change', onDesktopChange)
  if (open.value && !props.staticPosition) {
    openY = window.scrollY
    document.addEventListener('keydown', onKeydown)
  }
  if (!props.staticPosition) {
    lastY = window.scrollY
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('click', openQuiet, true)
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    window.addEventListener('keydown', onScrollKey)
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(openQuiet)
      resizeObserver.observe(document.body)
    }
    update()
  }
})

onBeforeUnmount(() => {
  desktopQuery?.removeEventListener('change', onDesktopChange)
  if (import.meta.client) {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('click', openQuiet, true)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('touchstart', onTouch)
    window.removeEventListener('touchmove', onTouch)
    window.removeEventListener('keydown', onScrollKey)
    resizeObserver?.disconnect()
    if (frame) cancelAnimationFrame(frame)
  }
  if (import.meta.client) {
    document.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <div
    ref="root"
    class="navbar"
    :class="{
      'navbar--open': open,
      'navbar--static': staticPosition,
      'navbar--hidden': hidden && !open && !staticPosition,
    }"
    @focusin="onFocusin"
  >
    <!-- Капсула Mobile (< 1024): Logo Blue слева, бургер справа -->
    <div class="navbar__bar">
      <a :href="homePath" class="navbar__logo" @click="onLogo">
        <Logo color="Blue" />
      </a>
      <button
        ref="burger"
        type="button"
        class="navbar__burger"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="menuId"
        :aria-label="t('nav.menu')"
        @click="toggleMenu"
      >
        <span class="navbar__burger-icon" aria-hidden="true" />
      </button>
    </div>

    <!-- Desktop: строка в капсуле; Mobile-op: панель под капсулой -->
    <nav :id="menuId" ref="panel" class="navbar__panel">
      <ul class="navbar__list">
        <li>
          <a :href="projectsTo" class="navbar__item" @click="onProjects">
            {{ t('nav.projects') }}
          </a>
        </li>
        <li>
          <NuxtLinkLocale to="/services" class="navbar__item" @click="closeMenu">
            {{ t('nav.services') }}
          </NuxtLinkLocale>
        </li>
        <li>
          <NuxtLinkLocale to="/contacts" class="navbar__item" @click="closeMenu">
            {{ t('nav.contacts') }}
          </NuxtLinkLocale>
        </li>
      </ul>
      <!-- Фрейм Link, не инстанс Button (Figma I1:1487) -->
      <a :href="formTo" class="navbar__cta" @click="onDiscuss">
        <span class="navbar__cta-label">{{ t('cta.discuss') }}</span>
        <ArrowIcon />
      </a>
    </nav>
  </div>
</template>

<style scoped>
/*
 * Значения по ширинам — из экранов главной RU/EN (таблица «Экраны» во вкладке «Figma»), эталон — экран (Р3).
 * База — 380; ступени: 768 (Mobile), 1024 / 1280 / 1440 / 1920 (Desktop). Токены там, где совпадают
 * точно, остальное — локальные переменные с узлом Figma.
 */
.navbar {
  /* ---- Mobile, 380 (Figma 35:2546 @380; Mobile-op 38:10183) ---- */
  --_nav-top: 12px; /* Figma 35:2546 @380: y = 12 */
  --_nav-side: 12px; /* Figma 35:2546 @380: x = 12, ширина 356 */
  /* Н50 — владелец 24.11.2026: мобильный навбар на < 768 меньше макета ×0.8 (высота капсулы 80 → 64),
     вместе с открытым меню. Значения ниже — «Figma-значение × --_nav-k»; на 768 коэффициент 1 (макет). */
  --_nav-k: 0.8;
  --_nav-bar-pad-y: calc(20px * var(--_nav-k)); /* Figma 35:2546 @380: 20; Н50 */
  --_nav-bar-pad-x: calc(28px * var(--_nav-k)); /* Figma 35:2546 @380: 28; Н50 */
  --_nav-bar-radius: calc(40px * var(--_nav-k)); /* Figma 35:2546 @380: 40 (Radius/40 на 380 = 20, не привязан); Н50 */
  --_nav-logo-width: calc(132px * var(--_nav-k)); /* Figma I35:2546;35:5026 @380: 132 × 30.532, I2064:1584;35:5026 @768: 132; Н50 */
  --_nav-burger-size: calc(40px * var(--_nav-k)); /* Figma I35:2546;35:5035 @380: 40; Н50 */

  /* Mobile-op: панель (Figma 38:9976 @380, I2162:332;38:9976 @768 — на обеих ширинах одинаково, Р53) */
  --_nav-panel-gap: calc(16px * var(--_nav-k)); /* между капсулой и панелью, Figma 38:10183: 16; Н50 */
  --_nav-panel-pad-y: calc(32px * var(--_nav-k)); /* Figma 38:9976: 32; Н50 */
  --_nav-panel-pad-x: calc(28px * var(--_nav-k)); /* Figma 38:9976: 28; Н50 */
  --_nav-panel-radius: calc(40px * var(--_nav-k)); /* Figma 38:9976: 40; Н50 */
  --_nav-op-gap: calc(32px * var(--_nav-k)); /* между пунктами и кнопкой, Figma 38:9977: 32; Н50 */
  --_nav-op-fs: calc(24px * var(--_nav-k)); /* Figma I38:9978;1:1717 @380: 24 (= Text 2); Н50 */
  --_nav-op-lh: calc(32px * var(--_nav-k)); /* Figma I38:9978;1:1717 @380: 32; Н50 */
  --_nav-op-cta-height: calc(72px * var(--_nav-k)); /* Figma 38:9981: 72; Н50 */
  --_nav-op-cta-pad-y: calc(16px * var(--_nav-k)); /* Figma 38:9981: 16; Н50 */
  --_nav-op-cta-pad-x: calc(24px * var(--_nav-k)); /* Figma 38:9981: 24; Н50 */
  --_nav-op-cta-radius: calc(24px * var(--_nav-k)); /* Figma 38:9981: 24; Н50 */
  --_nav-op-cta-gap: calc(14px * var(--_nav-k)); /* Figma 38:9981: 14; Н50 */
  /* Н15 — решение владельца 20.11.2026: кегль уменьшен до 23, чтобы текст влез в одну строку
     (замер: наибольший целый кегль, при котором «Обсудить проект ↗» / «Discuss a project ↗» в одну строку
     в кнопке во всю ширину панели на 380 и 360, RU и EN: 380 — 25/26, 360 — 23/24). Межстрочный = кегль, иконка = 1em. */
  --_nav-op-cta-fs: calc(23px * var(--_nav-k)); /* Н50: 23 × 0.8 */
  --_nav-op-cta-lh: calc(23px * var(--_nav-k));
  /* Вынос тени вниз = смещение + размытие из --shadow-glass (0 7px 37px, tokens.css, «Токены» → «Эффекты»); Н48 */
  --_nav-shadow-reach: calc(7px + 37px);
  --_nav-z: 100; /* слой поверх контента (ТЗ → «Общие правила» п. 2), не из Figma */

  position: fixed;
  top: var(--_nav-top);
  right: var(--_nav-side);
  left: var(--_nav-side);
  z-index: var(--_nav-z);
  transition: transform 300ms ease-out; /* Н48, ТЗ → «Общие правила» п. 7 */
}

/* Н48: уезжает вверх на высоту зоны навбара (отступ сверху + капсула). Клик мышью фокус-кольцо не даёт,
   поэтому :has(:focus-visible) — только навигация с клавиатуры (Р46). */
.navbar--hidden:not(:has(:focus-visible)) {
  transform: translateY(calc(-100% - var(--_nav-top) - var(--_nav-shadow-reach)));
}

/* Песочница: в потоке. Открытая панель — под капсулой, закрытая не занимает места. */
.navbar--static {
  position: relative;
  top: auto;
  right: auto;
  left: auto;
  margin-inline: var(--_nav-side);
}

/* ---------- Капсула и панель < 1024: фон непрозрачный, тень («Токены» → «Эффекты») ----------
 * TODO(question): new Н66
 * Н66 — владелец 24.11.2026: непрозрачное мобильное меню, текст кнопки по центру.
 * Было: Alpha/White 90 + blur (Н4), сквозь капсулу и панель читался текст позади. На ≥ 1024 капсула прежняя (стекло, ниже). */
.navbar__bar,
.navbar__panel {
  background-color: var(--color-white);
  box-shadow: var(--shadow-glass);
}

/* ---------- Капсула Mobile ---------- */
.navbar__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: var(--_nav-bar-pad-y) var(--_nav-bar-pad-x);
  border-radius: var(--_nav-bar-radius);
}

.navbar__logo {
  display: block;
  width: var(--_nav-logo-width);
  flex-shrink: 0;
}

.navbar__burger {
  display: block;
  width: var(--_nav-burger-size);
  height: var(--_nav-burger-size);
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

/* Иконки dehaze / close — экспорт Figma I35:2546;35:5035 и 38:10195, цвет — токен Blue 500 */
.navbar__burger-icon {
  display: block;
  width: 100%;
  height: 100%;
  background-color: var(--color-blue-500);
  -webkit-mask: url('~/assets/images/nav-burger.svg') center / 100% 100% no-repeat;
  mask: url('~/assets/images/nav-burger.svg') center / 100% 100% no-repeat;
}

.navbar--open .navbar__burger-icon {
  -webkit-mask-image: url('~/assets/images/nav-close.svg');
  mask-image: url('~/assets/images/nav-close.svg');
}

/* ---------- Панель Mobile-op (< 1024): открытие и закрытие — только opacity, 300 мс ease-out ----------
 * решение владельца 20.11.2026 (Н16): панель плавно проявляется, opacity 300 мс */
.navbar__panel {
  position: absolute;
  top: calc(100% + var(--_nav-panel-gap));
  right: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--_nav-op-gap);
  padding: var(--_nav-panel-pad-y) var(--_nav-panel-pad-x);
  border-radius: var(--_nav-panel-radius);
  visibility: hidden;
  opacity: 0;
  transition:
    opacity 300ms ease-out,
    visibility 0s linear 300ms;
}

.navbar--open .navbar__panel {
  visibility: visible;
  opacity: 1;
  transition:
    opacity 300ms ease-out,
    visibility 0s linear 0s;
}

.navbar--static .navbar__panel {
  position: static;
  margin-top: var(--_nav-panel-gap);
}

.navbar--static:not(.navbar--open) .navbar__panel {
  display: none;
}

.navbar__list {
  display: flex;
  flex-direction: column;
  gap: var(--_nav-op-gap);
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Пункт menuItem (Figma 1:1716): Mobile-op — Text 2, Black (Р62: hover Blue 500) */
.navbar__item {
  display: block;
  color: var(--color-black);
  font-size: var(--_nav-op-fs);
  line-height: var(--_nav-op-lh);
  font-weight: var(--fw-regular);
  text-decoration: none;
  white-space: nowrap;
  transition: color 300ms ease-out;
}

/* Ссылка-кнопка «Обсудить проект» (Figma Link 38:9981). Во всю ширину панели (Р53, В28).
 * Н15 — решение владельца 20.11.2026: кегль уменьшен до 23 (см. --_nav-op-cta-fs), текст в одну строку. */
.navbar__cta {
  display: flex;
  align-items: center;
  justify-content: center; /* Н66: текст + стрелка группой по центру */
  box-sizing: border-box;
  width: 100%;
  min-height: var(--_nav-op-cta-height);
  gap: var(--_nav-op-cta-gap);
  padding: var(--_nav-op-cta-pad-y) var(--_nav-op-cta-pad-x);
  border-radius: var(--_nav-op-cta-radius);
  background-color: var(--color-blue-500);
  color: var(--color-white);
  font-size: var(--_nav-op-cta-fs);
  line-height: var(--_nav-op-cta-lh);
  font-weight: var(--fw-medium);
  text-decoration: none;
  transition: background-color 300ms ease-out;
}

/* Состояния кнопки — как у Button: Blue 600 / Blue 700 */
@media (pointer: fine) {
  .navbar__cta:hover {
    background-color: var(--color-blue-600);
  }

  .navbar__item:hover {
    color: var(--color-blue-500); /* Р62 */
  }
}

.navbar__cta:active {
  background-color: var(--color-blue-700);
}

/* ---------- 768: капсула 736×64 (Figma 2064:1584 @768) ---------- */
@media (min-width: 768px) {
  .navbar {
    --_nav-k: 1; /* Н50: на 768 навбар как в макете */
    --_nav-top: 16px; /* Figma 2064:1584 @768 */
    --_nav-side: 16px; /* Figma 2064:1584 @768, ширина 736 */
    --_nav-bar-pad-y: 12px; /* Figma 2064:1584 @768 */
    --_nav-bar-radius: 24px; /* Figma 2064:1584 @768 (Radius/24 на 768 = 14, не привязан) */
    /* TODO(question): В28 — открытое меню 768 «как в кадре» 2162:331 */
    --_nav-op-fs: 24px; /* Figma I2162:332;38:9978 @768 (токен Text 2 на 768 — 26) */
    --_nav-op-lh: 32px; /* Figma I2162:332;38:9978 @768 */
    --_nav-op-cta-fs: 28px; /* Figma I2162:332;38:9982 @768 (токен Heading 4 на 768 — 30) */
    --_nav-op-cta-lh: 28px; /* Figma I2162:332;38:9982 @768 */
  }
}

/* ---------- Desktop (≥ 1024): капсула с пунктами и ссылкой-кнопкой ----------
 * 1920 — 844×104 (Figma 35:2217 / 1:1482), 1440 — 665×84 (2063:1402), 1280 — 611×78 (2063:1514),
 * 1024 — 545×68 (2064:1472). Ширина — по содержимому, по центру. */
@media (min-width: 1024px) {
  .navbar {
    --_nav-top: 13px; /* Figma 2064:1472 @1024: y = 13 */
    --_nav-cta-gap: 9px; /* Figma I2064:1472;1:1487 @1024 */

    top: var(--_nav-top);
    right: auto;
    left: 50%;
    width: max-content;
    box-sizing: border-box;
    /* Паддинги 20/20/20/40 на 1920: Spacing/20 и Spacing/40 совпадают на 1920–1024 */
    padding: var(--space-20) var(--space-20) var(--space-20) var(--space-40);
    border-radius: var(--radius-40); /* Radius/40: 40 / 32 / 30 / 26 */
    background-color: var(--color-white-a90);
    -webkit-backdrop-filter: blur(var(--blur-glass));
    backdrop-filter: blur(var(--blur-glass));
    box-shadow: var(--shadow-glass);
    transform: translateX(-50%);
  }

  .navbar--hidden:not(:has(:focus-visible)) {
    transform: translate(-50%, calc(-100% - var(--_nav-top) - var(--_nav-shadow-reach)));
  }

  .navbar--static {
    top: auto;
    left: auto;
    margin-inline: auto;
    transform: none;
  }

  .navbar__bar {
    display: none;
  }

  .navbar__panel {
    position: static;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--space-40);
    padding: 0;
    border-radius: 0;
    background: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
    visibility: visible;
    opacity: 1;
    transition: none;
  }

  .navbar--static .navbar__panel {
    margin-top: 0;
  }

  .navbar--static:not(.navbar--open) .navbar__panel {
    display: flex;
  }

  .navbar__list {
    flex-direction: row;
    gap: var(--space-40);
  }

  .navbar__item {
    font-size: var(--fs-caption-2);
    line-height: var(--lh-caption-2);
    font-weight: var(--fw-medium); /* Caption 2 */
  }

  /* Link: паддинги 16/24, радиус 24, gap 14 на 1920; текст Caption 2 White, иконка = кегль */
  .navbar__cta {
    width: auto;
    min-height: 0;
    gap: var(--_nav-cta-gap);
    padding: var(--space-16) var(--space-24);
    border-radius: var(--radius-24);
    font-size: var(--fs-caption-2);
    line-height: var(--lh-caption-2);
  }

  .navbar__cta-label {
    white-space: nowrap;
  }
}

@media (min-width: 1280px) {
  .navbar {
    --_nav-top: 19px; /* Figma 2063:1514 @1280: y = 19 */
    --_nav-cta-gap: 11px; /* Figma I2063:1514;1:1487 @1280 */
  }
}

@media (min-width: 1440px) {
  .navbar {
    --_nav-top: 24px; /* Figma 2063:1402 @1440: y = 24 */
    --_nav-cta-gap: 11px; /* Figma I2063:1402;1:1487 @1440 */
  }
}

@media (min-width: 1920px) {
  .navbar {
    --_nav-top: 36px; /* Figma 35:2217 @1920: y = 36 */
    --_nav-cta-gap: 14px; /* Figma I1:1482;1:1487 @1920 */
  }
}

/* prefers-reduced-motion: переходы обнуляет глобальное правило base.css; здесь явно — Н48 */
@media (prefers-reduced-motion: reduce) {
  .navbar {
    transition: none;
  }
}
</style>
