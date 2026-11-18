<script setup lang="ts">
// Footer — Figma 38:13044 (Local: RU / EN · Device: Desktop / Mobile · Languages вкл/выкл).
// Варианты: RU Desktop 38:13045, EN Desktop 8:771, RU Mobile 2043:1718, EN Mobile 2043:1719.
// Какой вариант на какой ширине («Компоненты» → «Форма и CTA»): Desktop на 1920–768 (на 768 с Languages),
// Mobile на 380. Локаль — из i18n, Desktop/Mobile и строка Languages (< 1024, Р23, Р43) — медиазапросами.
// Эталон вида — экраны Главная RU/EN: 1440 — 2063:1401 / 2065:1536, 1280 — 2063:1513 / 2065:1713,
// 1024 — 2064:1471 / 2066:1787, 768 — 2064:1583 / 2066:1964, 380 — 2046:1065 / 2046:1936, 1920 EN — 52:15898.
// Вордмарк внизу — декоративный вектор, не ссылка (Р69). Одинаков на всех страницах той же ширины (Р76).
import { links, footerLinks } from '~~/config/links'
import type { LinkKey } from '~~/config/links'

const props = withDefaults(
  defineProps<{
    /**
     * Только для песочницы: принудительно показать / скрыть «Настройки cookie».
     * По умолчанию — условие Р22 из runtimeConfig.
     */
    cookieSettings?: boolean
  }>(),
  // без default: undefined Vue приводит отсутствующий Boolean-prop к false
  { cookieSettings: undefined },
)

const emit = defineEmits<{ 'open-cookie-settings': [] }>()

const { locale, t } = useI18n()
const config = useRuntimeConfig()

const contactsId = useId()
const docsId = useId()

const isRu = computed(() => locale.value === 'ru')

// Р22 + ТЗ → «Аналитика»: «Настройки cookie» есть, только когда аналитика включена и задан хотя бы один ID.
const showCookieSettings = computed(
  () =>
    props.cookieSettings ??
    (Boolean(config.public.analyticsEnabled) && Boolean(config.public.gaId || config.public.ymId)),
)

interface ContactItem {
  key: LinkKey
  label: string
  href: string
  external: boolean
}

function toItem(key: LinkKey): ContactItem {
  if (key === 'email') {
    // Почта — mailto, в той же вкладке; подпись — из словаря.
    return { key, label: t('email'), href: links.email.href, external: false }
  }
  return { key, label: links[key].label, href: links[key].href, external: true }
}

// «Контент» → «Составы ссылок в футере». RU — один список; EN — два: Telegram, WhatsApp, почта | Behance, Medium, Instagram.
const contactLists = computed<ContactItem[][]>(() => {
  const keys = footerLinks[isRu.value ? 'ru' : 'en']
  const items = keys.map((key) => toItem(key))
  return isRu.value ? [items] : [items.slice(0, 3), items.slice(3)]
})

// «Документы»: RU — три документа, EN — Privacy Policy (ТЗ → «Маршруты»). В той же вкладке.
const documents = computed(() =>
  isRu.value
    ? [
        { to: '/privacy', label: t('footer.privacy') },
        { to: '/consent', label: t('footer.consent') },
        { to: '/newsletter-consent', label: t('footer.newsletter') },
      ]
    : [{ to: '/privacy', label: t('footer.privacy') }],
)
</script>

<template>
  <footer class="footer" :class="`footer--${isRu ? 'ru' : 'en'}`">
    <div class="footer__inner">
      <div class="footer__layout">
        <div class="footer__contacts" :class="{ 'footer__contacts--two': contactLists.length > 1 }">
          <p :id="contactsId" class="footer__title">{{ t('footer.contacts') }}</p>
          <ul
            v-for="(list, index) in contactLists"
            :key="index"
            class="footer__list"
            :class="index === 0 ? 'footer__list--first' : 'footer__list--second'"
            :aria-labelledby="index === 0 ? contactsId : undefined"
          >
            <li v-for="item in list" :key="item.key">
              <a
                class="footer__link"
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>

        <div class="footer__docs">
          <p v-if="isRu" :id="docsId" class="footer__title">{{ t('footer.docs') }}</p>
          <ul class="footer__list" :aria-labelledby="isRu ? docsId : undefined">
            <li v-for="doc in documents" :key="doc.to">
              <NuxtLinkLocale class="footer__link" :to="doc.to">{{ doc.label }}</NuxtLinkLocale>
            </li>
            <li v-if="showCookieSettings">
              <!-- Р59, Р61: последним пунктом колонки документов, снова открывает cookie-баннер -->
              <button
                type="button"
                class="footer__link footer__link--button"
                @click="emit('open-cookie-settings')"
              >
                {{ t('footer.cookies') }}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Р23, Р43: на < 1024 строка RU/EN под колонками -->
      <!-- TODO(question): В4 — место строки RU/EN в футере на < 1024 -->
      <div class="footer__languages">
        <Languages />
      </div>

      <div class="footer__mark" aria-hidden="true" />
    </div>
  </footer>
</template>

<style scoped>
.footer {
  /* 380: паддинг сверху/снизу 36 и gap между блоками 32 — нет в ките на этой ширине
     (Figma 2043:1689 @380: Layout padding 36 24, gap 32; space-36 = 24, space-32 = 20) */
  --_footer-py: 36px; /* Figma 2043:1689 @380 */
  --_footer-px: var(--space-36); /* 24 — Figma 2043:1689 @380 */
  --_footer-section-gap: 32px; /* Figma 2043:1689 @380 */

  width: 100%;
  overflow: hidden;
  background-color: var(--color-white); /* Achromatic/White */
  border-start-start-radius: var(--radius-64); /* 40 @380 … 64 @1920 */
  border-start-end-radius: var(--radius-64);
  font-size: var(--fs-caption-1);
  line-height: var(--lh-caption-1);
  font-weight: var(--fw-medium);
  color: var(--color-black);
}

/* Р24: фон тянется на всю ширину окна, содержимое — в контейнере по центру */
.footer__inner {
  display: flex;
  flex-direction: column;
  gap: var(
    --space-72
  ); /* 48 @380, 43 @768 … 72 @1920 — Figma 2141:6422 @380, 2064:1583 @768, 2063:1401 @1440 */
  max-width: var(--container-max-width);
  margin-inline: auto;
}

.footer__layout {
  display: flex;
  flex-direction: column;
  gap: var(--_footer-section-gap);
  padding: var(--_footer-py) var(--_footer-px);
}

/* Колонка «Контакты»: заголовок + один (RU) или два (EN) списка */
.footer__contacts {
  display: grid;
  grid-template-columns: auto;
  row-gap: var(--space-20); /* 8 @380 — Figma 2043:1704 @380 */
}

.footer__contacts--two {
  grid-template-columns: auto auto;
  justify-content: space-between; /* 380: два списка по краям — Figma 2043:1706 @380 */
}

.footer__contacts .footer__title {
  grid-column: 1 / -1;
  grid-row: 1;
}

.footer__list--first {
  grid-column: 1;
  grid-row: 2;
}

.footer__list--second {
  grid-column: 2;
  grid-row: 2;
}

.footer__docs {
  display: flex;
  flex-direction: column;
  gap: var(--space-20);
}

.footer__title {
  margin: 0;
  color: var(--color-blue-500); /* Brand Blue/500 */
  white-space: nowrap;
}

.footer__list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-20); /* 20 @1920, 16 @1440, 15 @1280, 13 @1024, 12 @768, 8 @380 */
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer__contacts .footer__list {
  white-space: nowrap;
}

.footer__link {
  color: var(--color-black);
  text-decoration: none;
  transition: color 300ms ease-out; /* Р62 */
}

/* «Настройки cookie» — кнопка, вид как у ссылки (Р61) */
.footer__link--button {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  text-align: inherit;
  cursor: pointer;
}

/* Hover только с мышью (Р62) */
@media (pointer: fine) {
  .footer__link:hover {
    color: var(--color-blue-500);
  }
}

@media (prefers-reduced-motion: reduce) {
  .footer__link {
    transition: none;
  }
}

.footer__languages {
  padding-inline: var(--_footer-px);
}

/* Вордмарк (Р69) — вектор из Figma, Gray 100 внутри файла */
.footer__mark {
  position: relative;
  overflow: hidden;
}

.footer__mark::before {
  content: '';
  position: absolute;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/* RU Mobile — Figma 2043:1700 / 2043:1701 @380 */
.footer--ru .footer__mark {
  aspect-ratio: 380 / 87;
}

.footer--ru .footer__mark::before {
  inset: 4.34% -7.44% -13.43% -1.06%;
  background-image: url('~/assets/images/footer-wordmark-ru-mobile.svg');
}

/* EN Mobile — Figma 2043:1717 @380 */
.footer--en .footer__mark {
  aspect-ratio: 380 / 93;
}

.footer--en .footer__mark::before {
  inset: 0;
  background-image: url('~/assets/images/footer-wordmark-en-mobile.svg');
}

/* ≥ 768 — Desktop (на 768 с Languages) */
@media (min-width: 768px) {
  .footer {
    --_footer-py: var(--space-80); /* 48 @768 … 80 @1920 — Figma 2064:1583 @768 */
    --_footer-px: var(--space-60); /* 36 @768 … 60 @1920 */
    --_footer-section-gap: 0px; /* колонки впритык: Figma 2064:1583 @768 (36 + 348 = 384) */
  }

  .footer__layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .footer__contacts,
  .footer__docs {
    flex: 1 1 0;
    min-width: 0;
  }

  .footer__contacts--two {
    grid-template-columns: auto auto;
    justify-content: start;
    column-gap: var(--space-64); /* Figma 8:770 / 38:13131 @1920 … @768 */
    align-items: start;
  }

  /* EN: второй список без заголовка — с верхнего края, вровень с заголовком */
  .footer__list--second {
    grid-row: 1 / span 2;
  }

  .footer__contacts .footer__title {
    grid-column: 1;
  }

  /* EN: колонка документов выровнена вправо (Figma 8:659 @1920: items-end, text-right) */
  .footer--en .footer__docs {
    align-items: flex-end;
    text-align: right;
  }

  .footer--en .footer__docs .footer__list {
    align-items: flex-end;
  }

  .footer--ru .footer__mark {
    aspect-ratio: 1920 / 425; /* Figma 38:13057 */
  }

  .footer--ru .footer__mark::before {
    inset: 2.2% -2.58% -7.74% -1.01%;
    background-image: url('~/assets/images/footer-wordmark-ru-desktop.svg');
  }

  .footer--en .footer__mark {
    aspect-ratio: 1920 / 428.702; /* Figma 38:13334 */
  }

  .footer--en .footer__mark::before {
    background-image: url('~/assets/images/footer-wordmark-en-desktop.svg');
  }
}

/* ≥ 1024 — строка Languages уходит в полосу Menu (Р23) */
@media (min-width: 1024px) {
  .footer__languages {
    display: none;
  }
}
</style>
