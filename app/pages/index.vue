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

// Н51 — решение владельца 24.11.2026, правка 27.11 (предложение дизайнера): на ≥ 1024 мягкая доводка (scroll-snap proximity)
// только hero → Проекты → перебивка → Услуги → футер; кейсы 2–4 и форма без остановок. На < 1024 разделы по содержимому.
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
        <CaptionHeading class="home__caption-m" :num="$t('home.projects.num')">{{
          $t('home.projects.title')
        }}</CaptionHeading>
        <!-- Н64: на < 1024 кейсы — столбик по Figma 35:2474 @380 / 2064:1543 @768 (карусель Н56 снята) -->
        <div class="home__cases">
          <ul class="home__list">
            <li
              v-for="n in [1, 2, 3, 4] as const"
              :key="n"
              class="home__case-item"
              :class="n === 1 && 'home__stop'"
            >
              <!-- Н60: на ≥ 1024 подпись и кейс 1 — один экран (обёртка), на < 1024 обёртка не участвует в раскладке;
                   подпись для десктопа — второй экземпляр (скрыт на < 1024), верхний — для мобильной раскладки -->
              <div class="home__first">
                <CaptionHeading
                  v-if="n === 1"
                  class="home__caption-d"
                  :num="$t('home.projects.num')"
                  >{{ $t('home.projects.title') }}</CaptionHeading
                >
                <CaseCard
                  :n="n"
                  class="home__case"
                  :class="`home__case--${n}`"
                />
              </div>
            </li>
          </ul>
        </div>
      </section>

      <!-- Н65: перебивка между «Проектами» и «Услугами» на всех ширинах; на < 1024 — крупнее и с воздухом
           (владелец 24.11.2026, см. стили ниже). TODO(question): new Н65 -->
      <Typing class="home__typing home__typing-d home__stop" />

      <section class="home__services home__stop">
        <CaptionHeading :num="$t('home.services.num')">{{
          $t('home.services.title')
        }}</CaptionHeading>
        <div class="home__services-list">
          <ServicesBlock v-for="type in serviceTypes" :key="type" :type="type" />
        </div>
      </section>
    </main>
    <ContactsCta overlap class="home__cta" />
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
  --_hm-cases-gap: var(--space-32); /* 20 — Figma 35:2474 @380; ≥ 768 — --space-48 */
  --_hm-sv-pad-y: 36px; /* Figma 35:2500 @380 (токена 36 на 380 нет); ≥ 768 — --space-60 */
  --_hm-sv-gap: var(--space-20); /* Figma 35:2503 @380 … 35:2209 @1920 */
  --_hm-scroll-margin: 88px; /* 12 + 64 + 12: NavBar 35:2546 @380, Н17 (как у #form); Н50 — высота навбара 80 → 64 */

  --_hm-pad-top: var(
    --_hm-pad-y
  ); /* поле раздела сверху (Н51: подпись «Проекты» — верх остановки) */
  --_hm-cap-h: var(
    --lh-h3
  ); /* высота подписи «Проекты» = её line-height (CaptionHeading: < 768 h3, ≥ 768 h5) */

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
  /* Н51 (≥ 1024) — владелец 24.11.2026: подпись «Проекты» в одном экране с кейсом 1. Остановка (и якорь #projects, ТЗ
     «Общие правила» п. 9) — верх раздела, scroll-margin нет, чтобы остановки не сдвигались; кейс 1 ниже на этот резерв
     (см. --cc-avail-h-1 в CaseCard). На < 1024 (Н56) якорь #projects — сам раздел со scroll-margin под навбар (Н17).
     TODO(question): new Н51 */
  --cc-top-reserve: calc(var(--_hm-pad-top) + var(--_hm-cap-h) + var(--_hm-gap));
}

.home__services-list {
  display: flex;
  flex-direction: column;
  gap: var(--_hm-sv-gap);
}

@media (min-width: 768px) {
  .home {
    --_hm-pad-y: var(--space-60); /* 36 — Figma 2064:1540 @768 */
    --_hm-cases-gap: var(--space-48); /* 29 — Figma 2064:1543 @768 */
    --_hm-sv-pad-y: var(--space-60); /* 36 — Figma 2064:1573 @768 */
    --_hm-scroll-margin: 96px; /* 16 + 64 + 16: NavBar 2064:1584 @768, Н17 */
    --_hm-cap-h: var(--lh-h5);
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
/* ---------- Н64 (снимает карусель Н56) — владелец 24.11.2026: на < 1024 «Проекты» — кейсы друг за другом, как в Figma
   35:2474 @380 / 2064:1543 @768: кейс 1 Mobile Featured, кейсы 2–4 Stacked, промежуток --_hm-cases-gap. Разделы по содержимому,
   без scroll snap и высоты окна (Н56). Н51 остаётся для ≥ 1024 (блок ниже). Это база; на ≥ 1024 правила переопределяются. */
.home__projects {
  scroll-margin-top: var(--_hm-scroll-margin); /* ТЗ «Общие правила» п. 9, Н17 */
}

.home__list {
  display: flex;
  flex-direction: column;
  gap: var(--_hm-cases-gap); /* 20 / 29 — Figma 35:2474 @380 / 2064:1543 @768 */
  margin: 0;
  padding: 0;
  list-style: none;
}

.home__first {
  display: contents; /* Н60: обёртка «подпись + кейс 1» — только для ≥ 1024 */
}

.home .home__caption-d {
  display: none;
}

/* ---------- Н61 — владелец 24.11.2026: единый ритм мобильной главной («Единый ритм без фонов»), только < 1024.
   Один фон (Gray 100) до формы; одинаковые боковые поля у всех разделов (как у формы: 16 @380 / 24 @768 — Figma I2074:2565 @380,
   I2064:1582 @768) и один вертикальный интервал между разделами (hero → Проекты → перебивка → Услуги → форма) — --space-72
   (48 @380 / 43 @768). Hero — по содержимому, верхнее поле под навбар. Подписи разделов — «номер — линия — название».
   Нужно подтверждение дизайнера. TODO(question): new Н61 — владелец 24.11.2026: единый ритм мобильной главной */
.home {
  --_hm-m-x: var(--space-28); /* 16 — Figma I2074:2565 @380 */
  --_hm-rhythm: var(--space-72); /* 48 @380 / 43 @768 — один интервал между разделами */
  --_hm-pad-x: var(--_hm-m-x);
  --_hm-sv-pad-x: var(--_hm-m-x);
  --_hm-gap: var(--space-36); /* подпись → содержимое, 24 @380 / 22 @768 */
}

.home main {
  display: flex;
  flex-direction: column;
  gap: var(--_hm-rhythm);
  padding-bottom: var(--_hm-rhythm); /* до формы тот же интервал */
}

/* Н64: hero — первый экран: ~60 % высоты окна (Figma 35:2469 даёт 598 @380 / 720 @768 с пустотой ≈ 400 px под надписью —
   оценка по виду, нужно подтверждение дизайнера), надпись по центру под навбаром (зона навбара — --_hm-scroll-margin, Н17);
   боковое поле — как у разделов */
.home__hero {
  padding: var(--_hm-scroll-margin) var(--_hm-m-x) 0;
}

.home .home__hero :deep(.hero-gif) {
  min-height: 60svh;
}

.home .home__hero :deep(.hero-gif__text) {
  width: 100%; /* край надписи — поле раздела, как у остальных блоков (Figma: 353 из 380, 680 из 768) */
}

.home__projects,
.home__services {
  padding: 0 var(--_hm-m-x);
}

/* Н65 — владелец 24.11.2026: перебивка — отдельно между «Проектами» и «Услугами», крупно и с воздухом.
   Кегль — --fs-h3 / --lh-h3 (как надпись hero), поля по сетке --_hm-m-x (16 / 24), вертикальный воздух до соседних
   разделов = --space-280 (380: 240, 768: 168) — следующая ступень токена после --space-200 (владелец 24.11.2026:
   больше воздуха), симметрично сверху и снизу; из него вычтен зазор ритма. Высота не прыгает: слово резервируется в Typing.
   TODO(question): new Н65 */
.home .home__typing-d {
  box-sizing: border-box;
  width: 100%;
  padding: calc(var(--space-280) - var(--_hm-rhythm)) var(--_hm-m-x);
  font-size: var(--fs-h3);
  line-height: var(--lh-h3);
  overflow-wrap: anywhere; /* страховка на 360: слово nowrap не вылезает за поле */
}

@media (min-width: 768px) {
  .home {
    --_hm-m-x: var(--space-40); /* 24 — Figma I2064:1582 @768 */
  }
}

/* ---------- Н51 — владелец 24.11.2026: на ≥ 1024 каждый раздел главной — один экран (scroll snap по вертикали) ----------
   Правка 27.11 (предложение дизайнера, владелец): доводка (proximity) только до точек .home__stop — hero, экран «Проекты»
   (подпись + кейс 1, верх раздела = якорь #projects), перебивка, «Услуги» — и до футера. Кейсы 2–4 и форма — без
   остановок, прокручиваются свободно. Высота экрана = высота окна с учётом zoom (Н50) — только у точек доводки.
   TODO(question): new Н51 */
@media (prefers-reduced-motion: reduce) {
  html.is-snap-home {
    scroll-behavior: auto; /* snap остаётся, плавности нет */
  }
}

@media (min-width: 1024px) {
  .home {
    --_hm-screen-h: calc(100vh / var(--site-zoom)); /* Н50 */
  }

  @supports (height: 100svh) {
    .home {
      --_hm-screen-h: calc(100svh / var(--site-zoom));
    }
  }

  /* Возврат значений ≥ 1024 после мобильной базы выше (Н61, Н64, Н65): как во фреймах 1024 … 1920 */
  .home {
    --_hm-pad-x: var(--space-20); /* 12 — Figma 2064:1540 @768 … 35:2175 @1920 */
    --_hm-sv-pad-x: var(--space-20);
    --_hm-gap: var(--space-48);
  }

  .home main {
    display: block;
    padding-bottom: 0;
  }

  .home__hero {
    padding: 0;
  }

  .home .home__hero :deep(.hero-gif__text) {
    width: calc(var(--_hero-text-width) / var(--site-zoom)); /* как в HeroGif (Н50) */
  }

  .home__projects {
    scroll-margin-top: 0; /* Н51: остановка — верх раздела, якорь #projects без поля */
    padding: 0 var(--_hm-pad-x) var(--_hm-pad-y); /* верх раздела = верх экрана Проекты (якорь #projects) */
  }

  .home__services {
    padding: var(--_hm-sv-pad-y) var(--_hm-sv-pad-x);
  }

  .home .home__caption-d {
    display: block;
  }

  .home .home__typing-d {
    padding: var(--space-200) var(--space-40); /* как в Typing */
    font-size: var(--fs-txt-1);
    line-height: var(--lh-txt-1);
    overflow-wrap: normal;
  }

  .home__stop {
    scroll-snap-align: start;
  }

  /* Футер — остановка по верху: заголовки колонок видны, а выше окна (низкое окно) прокручивается свободно до конца
     страницы; ниже окна — позиция упирается в конец страницы. */
  .home__footer {
    scroll-snap-align: start;
  }

  /* Раздел «Проекты» целиком не остановка: он выше окна (4 кейса), его snap area покрывает окно и браузер разрешает любую
     позицию внутри. Точка доводки «Проекты» — экран «подпись + кейс 1» (li кейса 1, он же верх раздела; .home__stop). */
  /* Н60/Н82 — владелец 27.11.2026: без экрана во всю высоту — промежуток до кейса 2 как в Figma. Остановка — верх блока
     «подпись + кейс 1» (li кейса 1, он же верх раздела); блок не растягивается на окно и не центрируется: подпись и кейс 1
     сверху с полем --_hm-pad-top, кейс 2 — через обычный --_hm-cases-gap. Низкое окно — кейс 1 по Н47. TODO(question): new Н60, Н82 */

  /* кейсы на десктопе — колонка карточек (Н51), список и элементы в раскладке не участвуют */
  .home__list,
  .home__case-item {
    display: contents;
  }

  .home__case-item.home__stop {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    padding-block: var(--_hm-pad-top) 0; /* верх — поле под показанный навбар; низ без поля — промежуток до кейса 2 даёт --_hm-cases-gap */
  }

  .home__first {
    display: flex;
    flex-direction: column;
    gap: var(--_hm-gap);
  }

  .home .home__caption-m {
    display: none;
  }

  .home__cases {
    display: flex;
    flex-direction: column;
    gap: var(--_hm-cases-gap); /* Н51 (27.11): кейсы 2–4 — как во фрейме, промежуток 29 @768 (2064:1543), на ≥ 1024 тот же шаг --space-48 */
  }

  .home__services {
    justify-content: flex-start; /* Н51/Н59: «Услуги» — экран; от верха, чтобы раскрытие блока не двигало подпись и блоки */
    min-height: var(--_hm-screen-h);
  }

  .home__typing {
    display: flex;
    flex-direction: column;
    justify-content: center; /* Н51: перебивка — экран, текст по центру */
    min-height: var(--_hm-screen-h);
  }

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
}
</style>

<style>
/* Н51: scroll snap — на корне прокрутки главной (класс ставит страница, useHead); на других страницах класса нет.
   Н56: только на ≥ 1024, на < 1024 разделы по содержимому. Правка 27.11: proximity — доводка только у точек (hero, Проекты,
   перебивка, Услуги, футер), между ними прокрутка свободная */
@media (min-width: 1024px) {
  html.is-snap-home {
    scroll-snap-type: y proximity;
  }
}
</style>
