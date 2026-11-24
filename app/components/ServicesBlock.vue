<script setup lang="ts">
// ServicesBlock — Figma services-block 8:410 (State: Default / Opened · Type: Branding / Marketing / UX/UI /
// Design Support · Device: Desktop / Mobile). Один блок аккордеона направления услуг; список из 4 блоков
// собирает страница. «Компоненты» → «Главная: кейсы и услуги», ТЗ → «Главная» п. 4, «Общие правила» п. 7–9,
// «Интерактив»; Р5, Р8, Р32, Р46, Р56, Р70, Р74, Р75.
// Какой вариант на какой ширине: Desktop на ≥ 1024, Mobile на 768 и 380 — переключается медиазапросом на 1024.
// Состояние Default ⇄ Opened — клик по шапке (весь верх блока — кнопка внутри h3); панель и «Обсудить проект»
// кнопку-переключатель не нажимают, т.к. стоят вне неё. При загрузке блок всегда закрыт (Р5).
import Button from '~/components/Button.vue'
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
const localePath = useLocalePath()
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
// TODO(question): new Н59 — владелец 24.11.2026: раскрытый блок услуг помещается в окно на ≥ 1024.
// Высота содержимого панели (без полей) нужна CSS, чтобы посчитать минимальную высоту раскрытого блока. Берётся
// наибольшая среди соседних блоков и пишется в общий родитель (--_panel-content): закрытые блоки списка сжимаются
// одинаково, а не по своему числу пунктов.
const panelEl = ref<HTMLElement | null>(null)
let panelObserver: ResizeObserver | undefined
function measurePanel() {
  const root = rootEl.value
  const holder = root?.parentElement
  if (!root || !holder) return
  let max = 0
  for (const panel of holder.querySelectorAll<HTMLElement>(
    ':scope > .services-block > .services-block__panel',
  )) {
    const cs = getComputedStyle(panel)
    max = Math.max(
      max,
      panel.offsetHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom),
    )
  }
  if (Number.isFinite(max) && max > 0)
    holder.style.setProperty('--_panel-content', `${Math.ceil(max)}px`)
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
// ширинах и в обоих состояниях, кроме Marketing — у закрытого блока свой кадр (1880×1000, у раскрытого 1880×1237).
// Три размера под srcset вместо файлов на каждую из 6 ширин: исходник один, масштабирует object-fit.
const photos = import.meta.glob<string>('../assets/images/services-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
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
const closedPhoto = computed(() =>
  props.type === 'marketing' ? photoSet('services-marketing-closed') : null,
)
const photoSizes = '(min-width: 1920px) 1880px, 100vw'

// ---------- Переключение ----------
function toggle() {
  isOpen.value = !isOpen.value
}

// Р32: «Обсудить проект» — плавный скролл к #form на странице, иначе переход на /contacts#form (как в NavBar)
function scrollBehaviorValue(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}
function onDiscuss() {
  const form = document.getElementById('form')
  if (form) {
    form.scrollIntoView({ behavior: scrollBehaviorValue(), block: 'start' })
    return
  }
  navigateTo(`${localePath('/contacts')}#form`)
}
</script>

<template>
  <div ref="rootEl" class="services-block" :class="{ 'services-block--open': isOpen }">
    <!-- Фото-фон, alt="" (Р70); закрытое состояние — с затемнением Alpha/Black 50, раскрытое — без -->
    <div class="services-block__media" aria-hidden="true">
      <img
        v-if="closedPhoto"
        class="services-block__img services-block__img--closed"
        :srcset="closedPhoto.srcset"
        :sizes="photoSizes"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <img
        class="services-block__img services-block__img--opened"
        :class="{ 'services-block__img--always': !closedPhoto }"
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
      <!-- Только на ≥ 1280 (на 1024 и ниже и в мобильных вариантах кнопки нет; Р74). Вне кнопки-переключателя -->
      <span class="services-block__cta">
        <Button type="secondary" device="desktop" @click="onDiscuss">
          {{ t('cta.discuss') }}
        </Button>
      </span>
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
 * блока и шапки, затемнение гаснет, панель появляется (решение владельца 20.11.2026 (Н22): высота, затемнение и кнопка меняются плавно);
 * «Обсудить проект» появляется/исчезает плавно (opacity 300 мс)
 */
.services-block {
  /* Mobile, 380 */
  --_closed-h: 70px; /* Figma 35:2505 @380 */
  --_open-h: 480px; /* Figma 35:2504 @380 */
  /* Figma I35:2504;35:7352 @380, I2064:1577;35:7352 @768: py 24 + строка Heading 5 */
  --_extra: 0px; /* Н52: высота второй строки названия, задаёт скрипт */
  --_head-open-h: calc(48px + var(--lh-h5));
  --_head-pad-x: 16px; /* Figma 35:2505 / I35:2504;35:7352 @380 */
  --_radius: var(--radius-40); /* Radius/40 = 20 на 380, Figma 35:2504 */
  --_panel-pad: 16px; /* Figma I35:2504;35:7355 */
  --_panel-gap: 16px; /* Figma I35:2504;35:7355 */
  --_ease: 300ms ease-out;

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: calc(var(--_closed-eff, var(--_closed-h)) + var(--_extra));
  border-radius: var(--_radius);
  overflow: hidden;
  transition: height var(--_ease);
}

.services-block--open {
  height: calc(var(--_open-eff, var(--_open-h)) + var(--_extra));
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
  position: absolute;
  inset: 0;
  z-index: -1;
}

.services-block__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover; /* Figma: object-cover, центр */
  transition: opacity var(--_ease);
}

.services-block__img--closed {
  opacity: 1;
}

.services-block__img--opened {
  opacity: 0;
}

.services-block__img--always,
.services-block--open .services-block__img--opened {
  opacity: 1;
}

.services-block--open .services-block__img--closed {
  opacity: 0;
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

/* ---------- Шапка ---------- */
.services-block__head {
  --_head-h: calc(var(--_closed-eff, var(--_closed-h)) + var(--_extra));

  position: relative;
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  height: var(--_head-h);
  padding-inline: var(--_head-pad-x);
  transition:
    height var(--_ease),
    padding var(--_ease);
}

.services-block--open .services-block__head {
  --_head-h: calc(var(--_head-open-eff, var(--_head-open-h)) + var(--_extra));
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

/* «Обсудить проект»: над растянутой областью кнопки-переключателя, только ≥ 1280 */
.services-block__cta {
  position: relative;
  display: none;
  flex: none;
  /* В Default кнопки нет: скрыта от глаз и от фокуса, при раскрытии появляется */
  visibility: hidden;
  opacity: 0;
  transition:
    opacity var(--_ease),
    visibility 0s linear 300ms;
}

.services-block--open .services-block__cta {
  visibility: visible;
  opacity: 1;
  transition:
    opacity var(--_ease),
    visibility 0s linear 0s;
}

/* ---------- Белая панель с пунктами ---------- */
.services-block__panel {
  display: flex;
  flex: none;
  flex-direction: column;
  gap: var(--_panel-gap);
  box-sizing: border-box;
  margin-top: auto;
  padding: var(--_panel-pad-eff, var(--_panel-pad));
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

/* ---------- Desktop ≥ 1024: шапка 176 с отступом 40, пункты панели делят её ширину поровну ---------- */
@media (min-width: 1024px) {
  .services-block {
    --_closed-h: 120px; /* Figma 2064:1466 @1024 (соседние блоки 121 из-за округления) */
    --_open-h: 1000px; /* Figma 2064:1465 @1024 */
    --_head-open-h: 176px; /* Figma I2064:1465;8:412 @1024 */
    --_head-pad-x: var(--space-40); /* 26 на 1024: Figma 2064:1466 */
    --_radius: var(
      --radius-40
    ); /* 26 / 30 / 32 / 40 — Figma 2064:1465, 2063:1507, 2063:1395, 8:411 */
    --_panel-pad: 40px; /* Figma I2064:1465;8:415 @1024, I2063:1507;8:415 @1280, I2063:1395;8:415 @1440, I8:411;8:415 @1920 */
    --_panel-gap: 16px; /* Figma I2064:1465;8:415 @1024, I2063:1507;8:415 @1280, I2063:1395;8:415 @1440, I8:411;8:415 @1920 */

    /* ---- Н59 — владелец 24.11.2026: раскрытый блок вместе с подписью и тремя закрытыми помещается в окно ----
       TODO(question): new Н59. Высота окна — --_hm-screen-h страницы (с учётом zoom, Н50); без неё (песочница) —
       без ограничения. Поля раздела и зазор списка повторяют сжатие страницы (clamp в index.vue). Порядок сжатия:
       1) высота раскрытого блока уменьшается от макета до минимума — отдаёт фото (фон cover, масштаб не меняется,
          кадрируется по высоте), 2) затем шапка и поля панели — не меньше --space-24, 3) затем закрытые блоки — не ниже
          2 × --space-24 + строка названия. Кегли не меняются. */
    --_screen: var(--_hm-screen-h, 10000px);
    --_sec-pad: clamp(8px, calc((var(--_screen) - 760px) * 0.5), var(--_hm-sv-pad-y, 0px));
    --_list-gap: clamp(6px, calc((var(--_screen) - 760px) * 0.3), var(--_hm-sv-gap, 0px));
    --_room: calc(
      var(--_screen) - 2 * var(--_sec-pad) - var(--_hm-cap-h, 0px) - var(--_hm-gap, 0px) - 3 *
        var(--_list-gap)
    );
    /* --_panel-content — высота пунктов панели, пишет measurePanel на родителя; до замера — 160px */
    --_head-content: var(--lh-h5); /* 1024: только название; кнопка — с 1280, см. ниже */
    --_head-min: calc(2 * var(--space-24) + var(--_head-content));
    --_panel-pad-nom: 40px; /* как --_panel-pad */
    --_open-min: calc(var(--_head-min) + var(--_panel-content, 160px) + 2 * var(--space-24));
    --_open-nom-min: calc(
      var(--_head-open-h) + var(--_panel-content, 160px) + 2 * var(--_panel-pad-nom)
    );
    --_closed-min: calc(2 * var(--space-24) + var(--lh-h5));
    --_closed-eff: min(
      var(--_closed-h),
      max(var(--_closed-min), calc((var(--_room) - var(--_open-min)) / 3))
    );
    --_open-eff: clamp(
      var(--_open-min),
      calc(var(--_room) - 3 * var(--_closed-eff)),
      var(--_open-h)
    );
    --_deficit: clamp(
      0px,
      calc(var(--_open-nom-min) - var(--_open-eff)),
      calc(var(--_open-nom-min) - var(--_open-min))
    );
    --_head-open-eff: clamp(
      var(--_head-min),
      calc(var(--_head-open-h) - var(--_deficit)),
      var(--_head-open-h)
    );
    --_panel-pad-eff: clamp(
      var(--space-24),
      calc(
        var(--_panel-pad-nom) - (var(--_deficit) - (var(--_head-open-h) - var(--_head-min))) / 2
      ),
      var(--_panel-pad-nom)
    );
  }

  .services-block--open .services-block__head {
    --_head-pad-x: 40px; /* Figma I2064:1465;8:412: p 40 на всех ширинах ≥ 1024 */
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
    --_head-content: 78px; /* высота Secondary: Figma I2063:1507;8:414 @1280 */
  }

  /* Secondary в шапке: на экранах 1440 и 1280 — 36/24, радиус 24 (Н10 снят: Р3, Р75), высота 80 / 78 */
  .services-block__cta {
    --button-pad-x: 36px; /* Figma I2063:1395;8:414 @1440, I2063:1507;8:414 @1280 */
    --button-pad-y: 24px;
    --button-radius: 24px;

    display: inline-flex;
  }
}

@media (min-width: 1440px) {
  .services-block {
    --_closed-h: 132px; /* Figma 2063:1396 @1440 */
    --_open-h: 1000px; /* Figma 2063:1395 @1440 */
    --_head-content: 80px; /* высота Secondary: Figma I2063:1395;8:414 @1440 */
  }
}

@media (min-width: 1920px) {
  .services-block {
    --_closed-h: 176px; /* Figma 35:2210 / 8:443 @1920 */
    --_open-h: 1000px; /* Figma 8:411 */
    --_head-content: 80px; /* высота Secondary на 1920 */
  }

  /* На 1920 — значения Button Desktop по умолчанию (токены 24 / 36 / 24) */
  .services-block__cta {
    --button-pad-x: var(--space-36);
    --button-pad-y: var(--space-24);
    --button-radius: var(--radius-24);
  }
}

/* prefers-reduced-motion: переходы обнуляет глобальное правило base.css (ТЗ → «Общие правила» п. 7) */
</style>
