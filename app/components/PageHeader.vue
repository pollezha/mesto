<script setup lang="ts">
// PageHeader — «Компоненты» → «Шапка внутренних страниц»; Figma: Page header 2046:979
// (Width: 1920 / 1440 / 1280 / 1024 / 768 / 380 · Locale: RU / EN). По Р15 эталон — сам компонент,
// не экраны. Градиент Diamond 2 — картинка на каждую ширину (app/assets/images/page-header-bg@<ширина>[@2x].webp),
// заголовок Heading 1 ExtraWhite у нижнего левого края, скругление снизу (--radius-header).
// Логотип (Р69) — ссылка на главную своего языка, Languages — справа; оба только на ≥ 1024.
// На 768 и 380 логотипа нет: сверху остаётся место под плавающий NavBar (верхний паддинг 124).
// Заголовок — h1 на «Услугах», «Контактах», документах и 404 (Р56): уровень задаёт prop.
// Диапазон ширин берёт значения нижней контрольной ширины (Р4); шире 1920 контейнер 1920 по центру,
// фон тянется (Р24).

defineProps<{
  /** Текст заголовка — со страницы, из словаря. */
  title: string
  /** Уровень заголовка (Р56): h1 по умолчанию, вид от уровня не зависит. */
  level?: 1 | 2 | 3 | 4 | 5 | 6
}>()

const { locale } = useI18n()
</script>

<template>
  <div class="page-header" :class="locale === 'en' ? 'page-header--en' : 'page-header--ru'">
    <div class="page-header__inner">
      <div class="page-header__menu">
        <NuxtLinkLocale to="/" class="page-header__logo">
          <Logo color="White" />
        </NuxtLinkLocale>
        <Languages mode="dark" class="page-header__languages" />
      </div>
      <component :is="`h${level ?? 1}`" class="page-header__title">{{ title }}</component>
    </div>
  </div>
</template>

<style scoped>
/*
 * Значения вариантов Width — компонент Page header, Figma 2046:979 (RU; EN отличается только шириной логотипа).
 * Верхний паддинг на ≥ 1024 = --space-40, правый = --space-60 (точное совпадение с токеном своей ширины);
 * остальное — локальные переменные с источником. Радиус снизу = --radius-header на всех ширинах.
 * TODO(question): new Н13 — растры фона собраны из SVG-описания заливки Figma, а не выгружены отдельным слоем.
 * TODO(question): new Н9 — Languages в шапке на 1440/1280/1024 масштабирован (не токены Caption 2);
 * до ответа — значения компонента Page header, заданы через публичные переменные Languages.
 */
.page-header {
  min-width: 0; /* не расширяться в grid/flex-родителе */
  /* 380 — Figma 2046:973 @380 */
  --_ph-min-height: 510px; /* Figma 2046:973 @380 */
  --_ph-pad-top: 124px; /* Figma 2046:973 @380 (место под NavBar) */
  --_ph-pad-right: 28px; /* Figma 2046:973 @380 */
  --_ph-pad-bottom: 21px; /* Figma 2046:973 @380 */
  --_ph-pad-left: 28px; /* Figma 2046:973 @380 */

  min-height: var(--_ph-min-height);
  border-radius: 0 0 var(--radius-header) var(--radius-header);
  background-image: image-set(
    url('~/assets/images/page-header-bg@380.webp') 1x,
    url('~/assets/images/page-header-bg@380@2x.webp') 2x
  );
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.page-header__inner {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  max-width: var(--container-max-width); /* Р24 */
  min-width: 0;
  min-height: var(--_ph-min-height);
  margin-inline: auto;
  padding: var(--_ph-pad-top) var(--_ph-pad-right) var(--_ph-pad-bottom) var(--_ph-pad-left);
}

/* Логотип и Languages — только ≥ 1024 */
.page-header__menu {
  display: none;
}

.page-header__title {
  margin: 0;
  margin-top: auto; /* нижний край текста на месте при любом числе строк */
  color: var(--color-extra-white);
  font-size: var(--fs-h1);
  line-height: var(--lh-h1);
  font-weight: var(--fw-medium);
  min-width: 0;
  overflow-wrap: anywhere; /* длинное слово не растягивает шапку в grid/flex */
}

@media (min-width: 768px) {
  .page-header {
    --_ph-pad-right: 32px; /* Figma 2141:277 @768 */
    --_ph-pad-bottom: 37px; /* Figma 2141:277 @768 */
    --_ph-pad-left: 32px; /* Figma 2141:277 @768 */

    background-image: image-set(
      url('~/assets/images/page-header-bg@768.webp') 1x,
      url('~/assets/images/page-header-bg@768@2x.webp') 2x
    );
  }
}

@media (min-width: 1024px) {
  .page-header {
    --_ph-min-height: 510px; /* Figma 2141:247 @1024 */
    --_ph-pad-top: var(--space-40); /* 26 — Figma 2141:247 @1024 */
    --_ph-pad-right: var(--space-60); /* 39 — Figma 2141:247 @1024 */
    --_ph-pad-bottom: 40px; /* Figma 2141:247 @1024 */
    --_ph-pad-left: 34px; /* Figma 2141:247 @1024 */
    --_ph-menu-inset: 5px; /* Figma 2141:248 @1024 (лого на 39 = правому паддингу) */
    --_ph-logo-ru: 150.991px; /* Figma 2141:249 @1024 */
    --_ph-logo-en: 152.426px; /* Figma 2141:282 @1024 */
    --_ph-lang-fs: 11.676px; /* Figma 2141:250 @1024, Н9 */
    --_ph-lang-lh: 14.27px; /* Figma 2141:250 @1024, Н9 */
    --_ph-lang-gap: 20.757px; /* Figma 2141:250 @1024, Н9 */
    --_ph-lang-pad-y: 20.108px; /* Figma 2141:250 @1024, Н9 */

    background-image: image-set(
      url('~/assets/images/page-header-bg@1024.webp') 1x,
      url('~/assets/images/page-header-bg@1024@2x.webp') 2x
    );
  }

  .page-header__menu {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline-start: var(--_ph-menu-inset);
  }

  .page-header__logo {
    display: block;
    width: var(--_ph-logo-ru);
  }

  .page-header--en .page-header__logo {
    width: var(--_ph-logo-en);
  }

  .page-header__languages {
    --languages-font-size: var(--_ph-lang-fs);
    --languages-line-height: var(--_ph-lang-lh);
    --languages-gap: var(--_ph-lang-gap);
    --languages-pad-y: var(--_ph-lang-pad-y);
  }
}

@media (min-width: 1280px) {
  .page-header {
    --_ph-min-height: 554px; /* Figma 2141:257 @1280 */
    --_ph-pad-bottom: 46px; /* Figma 2141:257 @1280 */
    --_ph-pad-left: 40px; /* Figma 2141:257 @1280 */
    --_ph-logo-ru: 172.99px; /* Figma 2141:259 @1280 */
    --_ph-logo-en: 174.634px; /* Figma 2141:308 @1280 */
    --_ph-lang-fs: 14.414px; /* Figma 2141:260 @1280, Н9 */
    --_ph-lang-lh: 17.297px; /* Figma 2141:260 @1280, Н9 */
    --_ph-lang-gap: 23.063px; /* Figma 2141:260 @1280, Н9 */
    --_ph-lang-pad-y: 22.342px; /* Figma 2141:260 @1280, Н9 */

    background-image: image-set(
      url('~/assets/images/page-header-bg@1280.webp') 1x,
      url('~/assets/images/page-header-bg@1280@2x.webp') 2x
    );
  }
}

@media (min-width: 1440px) {
  .page-header {
    --_ph-min-height: 623px; /* Figma 2141:267 @1440 */
    --_ph-pad-bottom: 49px; /* Figma 2141:267 @1440 */
    --_ph-pad-left: 42px; /* Figma 2141:267 @1440 */
    --_ph-menu-inset: 6px; /* Figma 2141:268 @1440 */
    --_ph-logo-ru: 183.989px; /* Figma 2141:269 @1440 */
    --_ph-logo-en: 185.738px; /* Figma 2141:334 @1440 */
    --_ph-lang-fs: 17.243px; /* Figma 2141:270 @1440, Н9 */
    --_ph-lang-lh: 20.378px; /* Figma 2141:270 @1440, Н9 */
    --_ph-lang-gap: 25.081px; /* Figma 2141:270 @1440, Н9 */
    --_ph-lang-pad-y: 24.297px; /* Figma 2141:270 @1440, Н9 */

    background-image: image-set(
      url('~/assets/images/page-header-bg@1440.webp') 1x,
      url('~/assets/images/page-header-bg@1440@2x.webp') 2x
    );
  }
}

@media (min-width: 1920px) {
  .page-header {
    --_ph-min-height: 831px; /* Figma 2046:937 @1920 */
    --_ph-pad-bottom: 61px; /* Figma 2046:937 @1920 */
    --_ph-pad-left: 53px; /* Figma 2046:937 @1920 */
    --_ph-menu-inset: 7px; /* Figma 2046:938 @1920 */
    --_ph-logo-ru: 215.987px; /* Figma 2046:939 @1920 */
    --_ph-logo-en: 218.04px; /* Figma 2046:949 @1920 */
    /* Languages на 1920 — значения по умолчанию (Figma 2046:941), без масштабирования */
    --_ph-lang-fs: var(--fs-caption-2);
    --_ph-lang-lh: var(--lh-caption-2);
    --_ph-lang-gap: var(--space-32);
    --_ph-lang-pad-y: 31px; /* Figma 2046:941 @1920 */

    background-image: image-set(
      url('~/assets/images/page-header-bg@1920.webp') 1x,
      url('~/assets/images/page-header-bg@1920@2x.webp') 2x
    );
  }
}
</style>
