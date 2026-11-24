<script setup lang="ts">
// Главная — ТЗ → «Главная», «Общие правила» п. 3, 4, 9, «Интерактив», «SEO»; Р5, Р24, Р25, Р56, Р68; Н17, Н36.
// RU `/`, EN `/en`. Экраны (RU 1920 / 1440 / 1280 / 1024 / 768 / 380; EN в скобках):
// Header (hero) 35:2170 / 2063:1353 / 2063:1465 / 2064:1423 / 2064:1535 / 35:2469 (51:13656 / 2065:1487 / 2065:1664 / 2066:1738 / 2066:1915 / 51:13707);
// Menu (≥ 1024) 35:2171 / 2063:1354 / 2063:1466 / 2064:1424 (51:13657 / 2065:1488 / 2065:1665 / 2066:1739), на 768 слой hidden, на 380 нет;
// Projects 35:2175 / 2063:1358 / 2063:1470 / 2064:1428 / 2064:1540 / 35:2471 (51:13661 / 2065:1492 / 2065:1669 / 2066:1743 / 2066:1920 / 51:13709), Layout 35:2178 … 35:2474;
// Section (перебивка) 35:2204 / 2063:1389 / 2063:1501 / 2064:1459 / 2064:1571 / 35:2498 (51:13692 …);
// Services 35:2206 / 2063:1391 / 2063:1503 / 2064:1461 / 2064:1573 / 35:2500 (51:13694 / 2065:1525 / 2065:1702 / 2066:1776 / 2066:1953 / 51:13740), Layout 35:2209 … 35:2503;
// CTA + Footer 35:2214 / 2063:1399 / 2063:1511 / 2064:1469 / 2064:1581 / 35:2508 (52:15896 / 2065:1534 / 2065:1711 / 2066:1785 / 2066:1962 / 51:13748).
// Состав: NavBar, hero (h1, Р56), «Проекты» (h2 + 4 CaseCard), перебивка, «Услуги» (h2 + 4 ServicesBlock), CTA с формой, Footer.
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { scrollToTop, isModifiedClick } = useScrollTo()

usePageSeo({
  title: t('meta.home.title'),
  description: t('meta.home.description'),
  alternates: true,
})

// Н51 — решение владельца 24.11.2026: каждый раздел главной — один экран на всех ширинах (scroll snap по вертикали).
// Класс на html снимается при уходе с главной (useHead живёт, пока жива страница). TODO(question): new Н51
useHead({ htmlAttrs: { class: 'is-snap-home' } })

const homePath = computed(() => localePath('/'))
const isEn = computed(() => locale.value === 'en')

// Р68: на самой главной логотип в полосе Menu плавно прокручивает наверх (при reduced motion — без анимации).
// Без JS это обычная ссылка на главную своей локали.
function onLogo(event: MouseEvent) {
  if (isModifiedClick(event)) return
  event.preventDefault()
  scrollToTop()
}

const serviceTypes = ['branding', 'marketing', 'interfaces', 'support'] as const
</script>

<template>
  <div class="home">
    <NavBar />
    <main>
      <!-- Header: hero и полоса Menu поверх (≥ 1024, Р23) -->
      <div class="home__hero home__stop">
        <div class="home__menu">
          <a
            :href="homePath"
            class="home__menu-logo"
            :class="{ 'home__menu-logo--en': isEn }"
            @click="onLogo"
          >
            <Logo color="Blue" />
          </a>
          <Languages mode="light" />
        </div>
        <HeroGif />
      </div>

      <section id="projects" class="home__projects">
        <CaptionHeading>{{ $t('home.projects.title') }}</CaptionHeading>
        <div class="home__cases">
          <CaseCard
            v-for="n in [1, 2, 3, 4] as const"
            :key="n"
            :n="n"
            class="home__case home__stop"
            :class="`home__case--${n}`"
          />
        </div>
      </section>

      <Typing class="home__typing home__stop" />

      <section class="home__services home__stop">
        <CaptionHeading>{{ $t('home.services.title') }}</CaptionHeading>
        <div class="home__services-list">
          <ServicesBlock v-for="type in serviceTypes" :key="type" :type="type" />
        </div>
      </section>
    </main>
    <ContactsCta overlap class="home__cta home__stop" />
    <Footer class="home__footer" />
  </div>
</template>

<style scoped>
/*
 * Раскладка главной — значения по фреймам из шапки файла; 380 — база, дальше ступени (Р4).
 * Токен — там, где он равен значению фрейма своей ширины; иначе сырое значение с node id.
 * Н36: Layout «Услуг» по содержимому на всех ширинах и локалях (лишние 168 px EN 1024, 2066:1779, не воспроизводятся).
 */
.home {
  --_hm-pad-y: var(--space-24); /* 12 — Figma 35:2471 @380; ≥ 768 — --space-60 */
  --_hm-pad-x: var(--space-24); /* 12 — Figma 35:2471 @380; ≥ 768 — --space-20 */
  --_hm-gap: var(--space-48); /* 10 / 29 / 31 / 36 / 38 / 48 — Figma 35:2471 @380 … 35:2175 @1920 */
  --_hm-cases-gap: var(--space-32); /* 20 — Figma 35:2474 @380; ≥ 768 — --space-48 */
  --_hm-sv-pad-y: 36px; /* Figma 35:2500 @380 (токена 36 на 380 нет); ≥ 768 — --space-60 */
  --_hm-sv-pad-x: var(
    --space-20
  ); /* 8 / 12 / 13 / 15 / 16 / 20 — Figma 35:2500 @380 … 35:2206 @1920 */
  --_hm-sv-gap: var(--space-20); /* Figma 35:2503 @380 … 35:2209 @1920 */
  --_hm-scroll-margin: 88px; /* 12 + 64 + 12: NavBar 35:2546 @380, Н17 (как у #form); Н50 — высота навбара 80 → 64 */

  min-width: 0;
}

/* ---------- Header: полоса Menu поверх hero (в потоке не участвует) ---------- */
.home__hero {
  position: relative;
}

.home__menu {
  display: none; /* на 768 слой hidden (2064:1536), на 380 нет */
}

.home__menu-logo {
  display: block;
  flex-shrink: 0;
}

/* ---------- Секции ---------- */
.home__projects,
.home__services {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--_hm-gap);
  width: 100%;
  max-width: var(--container-max-width); /* Р24 */
  min-width: 0;
  margin-inline: auto;
}

.home__projects {
  padding: var(--_hm-pad-y) var(--_hm-pad-x);
  scroll-margin-top: var(--_hm-scroll-margin); /* ТЗ «Общие правила» п. 9, Н17 */
}

.home__services {
  padding: var(--_hm-sv-pad-y) var(--_hm-sv-pad-x);
}

.home__cases {
  display: flex;
  flex-direction: column;
  gap: var(--_hm-cases-gap);
}

.home__services-list {
  display: flex;
  flex-direction: column;
  gap: var(--_hm-sv-gap);
}

@media (min-width: 768px) {
  .home {
    --_hm-pad-y: var(--space-60); /* 36 — Figma 2064:1540 @768 */
    --_hm-pad-x: var(--space-20); /* 12 — Figma 2064:1540 @768 */
    --_hm-cases-gap: var(--space-48); /* 29 — Figma 2064:1543 @768 */
    --_hm-sv-pad-y: var(--space-60); /* 36 — Figma 2064:1573 @768 */
    --_hm-scroll-margin: 96px; /* 16 + 64 + 16: NavBar 2064:1584 @768, Н17 */
  }
}

@media (min-width: 1024px) {
  .home {
    --_hm-scroll-margin: 94px; /* 13 + 68 + 13: NavBar 2064:1472 @1024, Н17 */
    --_hm-menu-height: 93px; /* Figma 2064:1424 @1024: фиксированная, содержимое по центру */
    --_hm-logo-w: 151.191px; /* Figma 2064:1425 @1024 (RU) */
    --_hm-logo-w-en: 152.6px; /* Figma 2066:1740 @1024 (EN) */
  }

  .home__menu {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--_hm-menu-height);
    max-width: var(--container-max-width); /* Р24 */
    margin-inline: auto;
    padding-inline: var(--space-60); /* 39 / 45 / 48 / 60 — Figma 2064:1424 … 35:2171 */
  }

  .home__menu-logo {
    width: var(--_hm-logo-w);
  }

  .home__menu-logo--en {
    width: var(--_hm-logo-w-en);
  }
}

@media (min-width: 1280px) {
  .home {
    --_hm-scroll-margin: 116px; /* 19 + 78 + 19: NavBar 2063:1514 @1280, Н17 */
    --_hm-menu-height: 116px; /* Figma 2063:1466 @1280 */
    --_hm-logo-w: 172.79px; /* Figma 2063:1467 @1280 (RU) */
    --_hm-logo-w-en: 174.4px; /* Figma 2065:1666 @1280 (EN) */
  }
}

@media (min-width: 1440px) {
  .home {
    --_hm-scroll-margin: 132px; /* 24 + 84 + 24: NavBar 2063:1402 @1440, Н17 */
    --_hm-menu-height: 131px; /* Figma 2063:1354 @1440 */
    --_hm-logo-w: 183.589px; /* Figma 2063:1355 @1440 (RU) */
    --_hm-logo-w-en: 185.3px; /* Figma 2065:1489 @1440 (EN) */
  }
}

@media (min-width: 1920px) {
  .home {
    --_hm-scroll-margin: 176px; /* 36 + 104 + 36: NavBar 35:2217 @1920, Н17 */
    --_hm-menu-height: 174.42px; /* Figma 35:2171 @1920 */
    --_hm-logo-w: 215.987px; /* Figma 35:2172 @1920 (RU) */
    --_hm-logo-w-en: 218px; /* Figma 51:13658 @1920 (EN) */
  }
}
/* ---------- Н51 — владелец 24.11.2026: каждый раздел главной — один экран, на всех ширинах ----------
   Остановки scroll snap — разделы (.home__stop); высота экрана = высота окна, с учётом zoom на ≥ 1024 (Н50).
   Раздел выше окна (раскрытый блок услуг, CTA в низком окне) не запирает прокрутку: snap area больше окна — внутри
   прокручивается свободно. Футер — остановка по низу страницы. TODO(question): new Н51 */
.home {
  --_hm-screen-h: 100vh; /* Н51: экран = окно */
}

@supports (height: 100svh) {
  .home {
    --_hm-screen-h: 100svh;
  }
}

.home__stop {
  scroll-snap-align: start;
}

.home__footer {
  scroll-snap-align: end;
}

/* hero: на < 1024 высота по окну (на ≥ 1024 уже по окну и не ниже содержимого, Н47) */
.home .home__hero :deep(.hero-gif) {
  min-height: var(--_hm-screen-h);
}

.home__services {
  justify-content: center; /* Н51: «Услуги» — экран, содержимое по центру; раскрытый блок может сделать раздел выше окна */
  min-height: var(--_hm-screen-h);
}

/* форма — экран: футер перекрывает низ CTA на --space-overlap, поэтому высота CTA = экран + перекрытие */
.home__cta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(var(--_hm-screen-h) - var(--space-overlap));
}

.home__cta :deep(.contacts-cta__inner) {
  width: 100%;
}

.home__typing {
  display: flex;
  flex-direction: column;
  justify-content: center; /* Н51: перебивка — экран, текст по центру */
  min-height: var(--_hm-screen-h);
}

/* кейс 1: остановка с отступом сверху как зазор между карточками (см. --cc-avail-h в CaseCard) */
.home__cases {
  gap: 0; /* кейсы — экраны со своими вертикальными полями (CaseCard) */
}

.home__case--1 {
  margin-bottom: var(--space-24); /* как поле кейса 1 сверху и снизу, Н51 */
  scroll-margin-top: var(--space-24);
}

@media (prefers-reduced-motion: reduce) {
  html.is-snap-home {
    scroll-behavior: auto; /* snap остаётся, плавности нет */
  }
}

@media (min-width: 1024px) {
  .home .home__hero :deep(.hero-gif) {
    min-height: min-content;
  }

  /* Раздел не помещается в низкое окно — поля и промежутки внутри раздела сжимаются от высоты окна (не кегли и не поля формы):
     значение фрейма, если окно высокое, до 8 / 6 / 12 px в самом низком. Н51 */
  .home__services {
    padding-block: clamp(8px, calc((var(--_hm-screen-h) - 760px) * 0.5), var(--_hm-sv-pad-y));
  }

  .home__services-list {
    gap: clamp(6px, calc((var(--_hm-screen-h) - 760px) * 0.3), var(--_hm-sv-gap));
  }

  .home .home__cta {
    --_cta-pad-top: clamp(12px, calc((var(--_hm-screen-h) - 700px) * 0.3), var(--space-80));
  }

  .home {
    --_hm-screen-h: calc(100vh / var(--site-zoom)); /* Н50 */
  }

  @supports (height: 100svh) {
    .home {
      --_hm-screen-h: calc(100svh / var(--site-zoom));
    }
  }

  .home__case--1 {
    margin-bottom: var(--space-48);
    scroll-margin-top: var(--space-48);
  }
}
</style>

<style>
/* Н51: scroll snap — на корне прокрутки главной (класс ставит страница, useHead); на других страницах класса нет */
html.is-snap-home {
  scroll-snap-type: y mandatory;
}
</style>
