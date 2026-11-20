<script setup lang="ts">
// CookieBanner — Figma 2151:353 (Device: Desktop / Mobile · Locale: RU / EN): Desktop RU 2151:325,
// Desktop EN 2151:332, Mobile RU 2151:339, Mobile EN 2151:346. Docs «Компоненты» → «Служебные»;
// ТЗ → «Аналитика»; Р22, Р40, Р58, Р59, Р66, Р73.
// Какой вариант на какой ширине (Р66): Desktop на ≥ 1024, Mobile на 768 и 380 — медиазапросом на 1024, без JS.
// Показ — useConsent().bannerOpen (Р22: аналитика включена; выбор в cookie; при пререндере баннера нет).
// Fixed поверх страницы — на раскладку не влияет. Кнопки — Button (цвета и состояния от Button),
// размеры переопределены публичными --button-* (Р73). Локаль — из i18n.
const props = withDefaults(
  defineProps<{
    /** Только для песочницы /__kit: показать баннер в потоке, независимо от cookie и конфига. На сайте не используется. */
    staticPosition?: boolean
  }>(),
  { staticPosition: false },
)

const { bannerOpen, accept, decline } = useConsent()

const visible = computed(() => props.staticPosition || bannerOpen.value)

// TODO(question): new Н30 — доступное имя области баннера и объявление его появления (в «Контенте» текста нет)
// TODO(question): new Н31 — слой баннера относительно навбара и открытого мобильного меню
// TODO(question): new Н32 — вид появления / исчезновения баннера (анимация не задана)
// TODO(question): new Н33 — размеры Desktop на 1024–1919: в Figma только вариант 1920 (1200)
</script>

<template>
  <div v-if="visible" class="cookie-banner" :class="{ 'cookie-banner--static': staticPosition }">
    <i18n-t keypath="cookie.text" tag="p" scope="global" class="cookie-banner__text">
      <template #privacy>
        <!-- Р40, ТЗ → «Интерактив»: ссылка на политику — в новой вкладке (чтобы не потерять баннер) -->
        <NuxtLinkLocale to="/privacy" class="cookie-banner__link" target="_blank" rel="noopener">{{
          $t('cookie.textLinks.privacy')
        }}</NuxtLinkLocale>
      </template>
    </i18n-t>
    <div class="cookie-banner__actions">
      <Button type="primary" device="auto" class="cookie-banner__button" @click="accept()">
        {{ $t('cookie.accept') }}
      </Button>
      <Button type="secondary" device="auto" class="cookie-banner__button" @click="decline()">
        {{ $t('cookie.decline') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
/*
 * Mobile (768 и 380, Р66) — Figma 2151:339 / 2151:346: 356, колонка, паддинги 20, gap 16, радиус 28;
 * кнопки 40 высотой (12/24, радиус 12), Caption 2 = 12/16. Токены на 768 и 380 разные, а вариант один,
 * поэтому значения фиксированные (как у Button Mobile).
 */
.cookie-banner {
  --_cb-width: 356px; /* Figma 2151:339 @380 */
  --_cb-max-gap: 24px; /* ширина экрана − 24 (Р66) */
  --_cb-pad-top: 20px; /* Figma 2151:339 */
  --_cb-pad-right: 20px; /* Figma 2151:339 */
  --_cb-pad-bottom: 20px; /* Figma 2151:339 */
  --_cb-pad-left: 20px; /* Figma 2151:339 */
  --_cb-gap: 16px; /* Figma 2151:339 */
  --_cb-radius: 28px; /* Figma 2151:339 */
  --_cb-fs: 12px; /* Figma 2151:339: font-size/caption 2 (Mobile) */
  --_cb-lh: 16px; /* Figma 2151:339: line-height/caption 2 (Mobile) */
  --_cb-bottom: 12px; /* ТЗ → «Аналитика»: отступ снизу 12 на < 1024 */
  --_cb-z: 90; /* ниже навбара (z-index 100) и открытого мобильного меню в нём, выше страницы — Н31 */

  position: fixed;
  inset-inline: 0; /* контейнер — вьюпорт без полосы прокрутки */
  bottom: var(--_cb-bottom);
  z-index: var(--_cb-z);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--_cb-gap);
  width: min(var(--_cb-width), 100% - var(--_cb-max-gap));
  margin-inline: auto;
  padding: var(--_cb-pad-top) var(--_cb-pad-right) var(--_cb-pad-bottom) var(--_cb-pad-left);
  border-radius: var(--_cb-radius);
  /* Стекло как у навбара: Alpha/White 90, blur 15, тень («Токены» → «Эффекты», Н4) */
  background-color: var(--color-white-a90);
  -webkit-backdrop-filter: blur(var(--blur-glass));
  backdrop-filter: blur(var(--blur-glass));
  box-shadow: var(--shadow-glass);
  color: var(--color-black);
  font-size: var(--_cb-fs);
  line-height: var(--_cb-lh);
  font-weight: var(--fw-medium);

  /* Размеры Button (Р73) — цвета и состояния остаются от Button */
  --button-pad-y: 12px; /* Figma 2151:342 @380 */
  --button-pad-x: 24px; /* Figma 2151:342 @380 */
  --button-radius: var(--radius-12); /* Radius/12 — 12 */
  --button-fs: var(--_cb-fs);
  --button-lh: var(--_cb-lh);
}

/* Песочница: в потоке, без fixed */
.cookie-banner--static {
  position: relative;
  inset-inline: auto;
  bottom: auto;
  z-index: auto;
}

.cookie-banner__text {
  margin: 0;
  width: 100%;
}

.cookie-banner__link {
  color: var(--color-blue-500); /* Brand Blue/500 */
  text-decoration: underline;
  text-underline-position: from-font;
  transition: color 300ms ease-out; /* Р62 */
}

.cookie-banner__actions {
  display: flex;
  align-items: flex-start;
  gap: 12px; /* Figma 2151:341 @380 (Mobile) */
  width: 100%;
}

/* Mobile: кнопки на всю ширину поровну (Figma 2151:342 / 2151:344) */
.cookie-banner__button {
  flex: 1 1 0;
  min-width: 0;
}

/* Hover — только с мышью (Р62); ссылка → Blue 600 (docs «Компоненты» → Cookie banner) */
@media (pointer: fine) {
  .cookie-banner__link:hover {
    color: var(--color-blue-600);
  }
}

/*
 * ≥ 1024 — Desktop (Figma 2151:325 / 2151:332): 1200, но не шире экрана − 80 (Р66); паддинги 20/20/20/40,
 * gap 40, радиус 40; кнопки справа, не сжимаются; высота кнопки 64 = 16 + 32 + 16, паддинги 16/32, радиус 20,
 * Caption 2 (Р73). Значения — токены своей ширины (на 1920 точно равны Figma) — Н33.
 */
@media (min-width: 1024px) {
  .cookie-banner {
    --_cb-width: 1200px; /* Figma 2151:325 @1920 */
    --_cb-max-gap: 80px; /* ширина экрана − 80 (Р66) */
    --_cb-pad-top: var(--space-20); /* 20 @1920 — Figma 2151:325 */
    --_cb-pad-right: var(--space-20);
    --_cb-pad-bottom: var(--space-20);
    --_cb-pad-left: var(--space-40); /* 40 @1920 — Figma 2151:325 */
    --_cb-gap: var(--space-40); /* 40 @1920 — Figma 2151:325 */
    --_cb-radius: var(--radius-40); /* 40 @1920 — Figma 2151:325 */
    --_cb-fs: var(--fs-caption-2);
    --_cb-lh: var(--lh-caption-2);
    --_cb-bottom: 24px; /* ТЗ → «Аналитика»: отступ снизу 24 на ≥ 1024 */

    flex-direction: row;
    align-items: center;

    --button-pad-y: var(--space-16); /* 16 @1920 — Figma 2151:328 */
    --button-pad-x: var(--space-32); /* 32 @1920 — Figma 2151:328 */
    --button-radius: var(--radius-20); /* 20 @1920 — Figma 2151:328 */
  }

  .cookie-banner--static {
    align-items: center;
  }

  .cookie-banner__text {
    flex: 1 1 0;
    width: auto;
    min-width: 0;
  }

  .cookie-banner__actions {
    flex: none;
    width: auto;
    gap: var(--space-12); /* 12 @1920 — Figma 2151:327 (190 − 178), Н33 */
  }

  .cookie-banner__button {
    flex: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cookie-banner__link {
    transition: none;
  }
}
</style>
