<script setup lang="ts">
// ContactsCta — блок CTA с формой, Figma Contacts 23:3888 (Device: Desktop 8:769 / Mobile 23:3889 ·
// Local: Default (RU) / En 2092:6726 / 2092:6825); docs «Компоненты» → «Форма и CTA» → Contacts.
// Внизу главной, «Услуг» и кейса. Эталон — экраны (Р3): RU I35:2215 @1920, I2063:1400 @1440, I2063:1512 @1280,
// I2064:1470 @1024, I2064:1582 @768, I2074:2565 @380; EN — I2065:1535 @1440, I2065:1712 @1280, I2066:1786 @1024,
// I2066:1963 @768 (1920 и 380 — варианты компонента 2092:6726 / 2092:6825). CTA «Услуг» (I2057:1298 @1440,
// I2057:1419 @1280, I2058:1298 @1024) и кейса (I2068:2629 @1440) совпадают с главной (Р76).
// Вариант по ширине («Какой вариант на какой ширине»): Desktop (Form Default) на ≥ 1024, Mobile (Form Small) на 768 и 380.
// Local — язык страницы: тексты и фон из локали, форма сама знает локаль (EN без чекбоксов).
// Высоту блока задаёт форма: фон Diamond растянут на весь блок (в EN блок ниже, чем в RU — форма без чекбоксов).
// Шире 1920 — контент в контейнере 1920 по центру, фон тянется (Р24).
// Перекрытие с футером (Spacing/Overlap) блок сам не делает: страница ставит prop overlap — см. ниже.
// Якорь формы #form (Р6, ТЗ «Общие правила» п. 9) — на обёртке формы.
import ArrowIcon from '~/components/ArrowIcon.vue'
import { links } from '~~/config/links'

withDefaults(
  defineProps<{
    /**
     * Футер лежит поверх нижней части блока (docs «Токены» → «Эффекты», Spacing/Overlap): страница с футером
     * после блока ставит overlap — блок получает margin-bottom: var(--space-overlap), следующий за ним
     * футер (идёт позже в DOM) перекрывает нижний паддинг блока. Без prop блок самостоятельный (песочница).
     */
    overlap?: boolean
  }>(),
  { overlap: false },
)

const { locale } = useI18n()

// Размер Form по ширине — медиазапросом внутри Form (size=auto): Default на ≥ 1024, Small на 768 и 380 (Р72).
// Н17 — решение владельца 20.11.2026: scroll-margin якоря формы = высота навбара + отступ сверху и снизу.
</script>

<template>
  <section
    class="contacts-cta"
    :class="[
      locale === 'en' ? 'contacts-cta--en' : 'contacts-cta--ru',
      { 'contacts-cta--overlap': overlap },
    ]"
  >
    <div class="contacts-cta__inner">
      <!-- Р56: текст CTA — h2; последняя часть — Alpha/ExtraWhite 60 (Р26, Р57) -->
      <h2 class="contacts-cta__lead">
        {{ $t('cta.lead.main') }}{{ ' '
        }}<span class="contacts-cta__lead-muted">{{ $t('cta.lead.muted') }}</span>
      </h2>

      <div id="form" class="contacts-cta__form">
        <Form />
      </div>

      <div class="contacts-cta__mail">
        <!-- «Или напишите нам:» — обычный текст (Р56) -->
        <p class="contacts-cta__or">{{ $t('cta.or') }}</p>
        <a class="contacts-cta__link" :href="links.email.href">
          <span class="contacts-cta__email">{{ $t('email') }}</span>
          <ArrowIcon class="contacts-cta__arrow" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Значения — экраны главной RU/EN (Р3). Токены, где совпадают точно; остальное — локальные переменные с узлом.
 * Desktop (≥ 1024): паддинги Spacing/80 / 80 / 280 / 60, gap Spacing/80, радиус Radius/64 — на 1920 / 1440 / 1280 / 1024
 * совпадают с токенами своей ширины (80/64/60/52, 280/224/210/182, 60/48/45/39, радиус 64/51/48/42).
 * Mobile: 380 — 36 / 16 / 240 / 16, gap 24; 768 — 48 / 24 / 170 / 24, gap 32 (48 = Spacing/80 и 24 = Spacing/40 на 768; 170 и 32 — значения фрейма, точного токена нет).
 * Н13 — решение владельца 20.11.2026: собранные растры фона (растягиваются). Растры собраны из SVG-описания заливки
 * Figma (get_design_context), а не выгружены отдельным слоем; EN-матрица градиента получена нормировкой RU по высоте (проверено на 1920 EN 2092:6726).
 */
.contacts-cta {
  /* ---- Mobile, 380 (Figma I2074:2565 @380) ---- */
  --_cta-pad-top: 36px; /* Figma I2074:2565 @380 */
  --_cta-pad-x: 16px; /* Figma I2074:2565 @380 */
  --_cta-pad-bottom: var(--space-280); /* 240 — Figma I2074:2565 @380 */
  --_cta-gap: 24px; /* Figma I2074:2565 @380 */
  --_cta-radius: var(--radius-64); /* 40 — Figma I2074:2565 @380 */
  --_cta-mail-pad-y: 16px; /* Figma I2074:2565;23:3894 @380 */
  --_cta-line: 3.424px; /* Figma 8:621 (линия под почтой, на всех ширинах) */
  --_cta-form-max: 806px; /* Figma 2073:156 (max-width формы, Desktop) */
  --_cta-lead-min: 460px; /* Figma 8:766 (min-width текстовой колонки, Desktop) */
  /* scroll-margin якоря: высота навбара + его отступ сверху + такой же снизу (NavBar 35:2546 @380: 80 → 64 по Н50, top 12) */
  --_cta-scroll-margin: 88px; /* 12 + 64 + 12, Н17; Н50 — высота навбара 80 → 64 */

  box-sizing: border-box;
  width: 100%;
  border-radius: var(--_cta-radius) var(--_cta-radius) 0 0;
  background-color: var(
    --color-black
  ); /* страховка до загрузки картинки: самый тёмный край Diamond (32,32,32) */
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/* Фон Diamond — картинка на каждую ширину и локаль (app/assets/images/contacts-cta-bg[-en]@<ширина>[@2x].webp) */
.contacts-cta--ru {
  background-image: image-set(
    url('~/assets/images/contacts-cta-bg@380.webp') 1x,
    url('~/assets/images/contacts-cta-bg@380@2x.webp') 2x
  );
}

.contacts-cta--en {
  background-image: image-set(
    url('~/assets/images/contacts-cta-bg-en@380.webp') 1x,
    url('~/assets/images/contacts-cta-bg-en@380@2x.webp') 2x
  );
}

.contacts-cta--overlap {
  margin-bottom: var(
    --space-overlap
  ); /* Spacing/Overlap: -160 / -128 / -120 / -104 / -96 / -160 по ширинам */
}

.contacts-cta__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: var(--_cta-gap);
  box-sizing: border-box;
  max-width: var(--container-max-width); /* Р24 */
  margin-inline: auto;
  padding: var(--_cta-pad-top) var(--_cta-pad-x) var(--_cta-pad-bottom);
}

/* Mobile: порядок текст → форма → «Или напишите нам:» с почтой (порядок в DOM) */
.contacts-cta__lead {
  margin: 0;
  min-width: 0;
  color: var(--color-extra-white); /* Achromatic/ExtraWhite */
  font-size: var(--fs-txt-1);
  line-height: var(--lh-txt-1);
  font-weight: var(--fw-regular); /* Text 1 */
}

.contacts-cta__lead-muted {
  color: var(--color-extra-white-a60); /* Alpha/ExtraWhite 60, Р26 */
}

.contacts-cta__form {
  min-width: 0;
  scroll-margin-top: var(--_cta-scroll-margin);
}

.contacts-cta__mail {
  min-width: 0;
}

.contacts-cta__or {
  margin: 0;
  color: var(--color-extra-white-a60); /* Alpha/ExtraWhite 60 */
  font-size: var(--fs-txt-1);
  line-height: var(--lh-txt-1);
  font-weight: var(--fw-regular); /* Text 1 */
}

/* Ссылка = вся mail-box: текст, иконка и линия под ними (Р62: при hover — прозрачность 60%) */
.contacts-cta__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding-block: var(--_cta-mail-pad-y);
  border-bottom: var(--_cta-line) solid var(--color-extra-white); /* Achromatic/ExtraWhite */
  color: var(--color-white); /* Achromatic/White */
  font-size: var(--fs-h3); /* Heading 3; ↗ равна кеглю (1em) */
  line-height: var(--lh-h3);
  font-weight: var(--fw-medium);
  text-decoration: none;
  transition: opacity 300ms ease-out;
}

.contacts-cta__email {
  min-width: 0;
  white-space: nowrap;
}

/* Иконка прижата к верху строки текста (Figma 8:623: Arrow h-full, иконка items-start) */
.contacts-cta__arrow {
  align-self: flex-start;
}

@media (pointer: fine) {
  .contacts-cta__link:hover {
    opacity: 0.6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .contacts-cta__link {
    transition: none;
  }
}

/* ---------- 768: Mobile, паддинги и gap по Figma I2064:1582 @768 ---------- */
@media (min-width: 768px) {
  .contacts-cta {
    --_cta-pad-top: 48px; /* Figma I2064:1582 @768 */
    --_cta-pad-x: 24px; /* Figma I2064:1582 @768 */
    --_cta-pad-bottom: 170px; /* Figma I2064:1582 @768 */
    --_cta-gap: 32px; /* Figma I2064:1582 @768 */
    --_cta-radius: 40px; /* Figma I2064:1582 @768 (Radius/64 на 768 = 38, не привязан) */
    --_cta-mail-pad-y: var(--space-16); /* 10 — Figma I2064:1582;23:3894 @768 */
    --_cta-scroll-margin: 96px; /* 16 + 64 + 16: NavBar 2064:1584 @768, Н17 */
  }

  .contacts-cta--ru {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg@768.webp') 1x,
      url('~/assets/images/contacts-cta-bg@768@2x.webp') 2x
    );
  }

  .contacts-cta--en {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg-en@768.webp') 1x,
      url('~/assets/images/contacts-cta-bg-en@768@2x.webp') 2x
    );
  }
}

/* ---------- 1024: Desktop — две колонки (Figma I2064:1470 @1024) ---------- */
@media (min-width: 1024px) {
  .contacts-cta {
    --_cta-pad-top: var(--space-80); /* 52 */
    --_cta-pad-right: var(--space-80); /* 52 */
    --_cta-pad-bottom: var(--space-280); /* 182 */
    --_cta-pad-left: var(--space-60); /* 39 */
    --_cta-gap: var(--space-80); /* 52 */
    --_cta-radius: var(--radius-64); /* 42 */
    --_cta-form-pad: var(--space-48); /* паддинг формы Default: Figma 2045:887 */
    --_cta-mail-pad-y: var(--space-16); /* 10 */
    --_cta-scroll-margin: 94px; /* 13 + 68 + 13: NavBar 2064:1472 @1024, Н17 */
    /* Н12 закрыт: в CTA gap чекбоксов Form Default — по экрану (I2064:1470;2073:156;2045:900 @1024) */
    --checkbox-field-gap: 20px; /* Figma I2064:1470;2073:156;2045:900 @1024; Services I2058:1298 */
  }

  .contacts-cta--ru {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg@1024.webp') 1x,
      url('~/assets/images/contacts-cta-bg@1024@2x.webp') 2x
    );
  }

  .contacts-cta--en {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg-en@1024.webp') 1x,
      url('~/assets/images/contacts-cta-bg-en@1024@2x.webp') 2x
    );
  }

  /*
   * Колонки: форма и текст делят свободное место поровну без паддингов формы (Figma: Content и Form «fill»,
   * ширина Form = ширина Content + 2 × паддинг): 1440 — 594 / 670, 1280 EN — 521.5 / 593.5. Форма не шире
   * 806 (1920: 894 / 806); текст не уже 460 (1024: 460 / 421).
   */
  .contacts-cta__inner {
    grid-template-columns:
      minmax(var(--_cta-lead-min), 1fr)
      minmax(
        0,
        min(var(--_cta-form-max), calc((100% - var(--_cta-gap) + 2 * var(--_cta-form-pad)) / 2))
      );
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'lead form'
      'mail form';
    column-gap: var(--_cta-gap);
    row-gap: 0;
    padding: var(--_cta-pad-top) var(--_cta-pad-right) var(--_cta-pad-bottom) var(--_cta-pad-left);
  }

  .contacts-cta__lead {
    grid-area: lead;
  }

  .contacts-cta__form {
    grid-area: form;
    align-self: start;
  }

  .contacts-cta__mail {
    grid-area: mail;
    align-self: end;
  }
}

/* ---------- 1280 (Figma I2063:1512 @1280) ---------- */
@media (min-width: 1280px) {
  .contacts-cta {
    --_cta-scroll-margin: 116px; /* 19 + 78 + 19: NavBar 2063:1514 @1280, Н17 */
    --checkbox-field-gap: 23px; /* Figma I2063:1512;2073:156;2045:900 @1280; Services I2057:1419 */
  }

  .contacts-cta--ru {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg@1280.webp') 1x,
      url('~/assets/images/contacts-cta-bg@1280@2x.webp') 2x
    );
  }

  .contacts-cta--en {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg-en@1280.webp') 1x,
      url('~/assets/images/contacts-cta-bg-en@1280@2x.webp') 2x
    );
  }
}

/* ---------- 1440 (Figma I2063:1400 @1440) ---------- */
@media (min-width: 1440px) {
  .contacts-cta {
    --_cta-scroll-margin: 132px; /* 24 + 84 + 24: NavBar 2063:1402 @1440, Н17 */
    --checkbox-field-gap: 24px; /* Figma I2063:1400;2073:156;2045:900 @1440; Services I2057:1298, Case I2068:2629 */
  }

  .contacts-cta--ru {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg@1440.webp') 1x,
      url('~/assets/images/contacts-cta-bg@1440@2x.webp') 2x
    );
  }

  .contacts-cta--en {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg-en@1440.webp') 1x,
      url('~/assets/images/contacts-cta-bg-en@1440@2x.webp') 2x
    );
  }
}

/* ---------- 1920 (Figma I35:2215 @1920) ---------- */
@media (min-width: 1920px) {
  .contacts-cta {
    --_cta-scroll-margin: 176px; /* 36 + 104 + 36: NavBar 35:2217 @1920, Н17 */
    --checkbox-field-gap: 30px; /* Figma I35:2215;2073:156;2045:900 @1920 — как по умолчанию в CheckboxField */
  }

  .contacts-cta--ru {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg@1920.webp') 1x,
      url('~/assets/images/contacts-cta-bg@1920@2x.webp') 2x
    );
  }

  .contacts-cta--en {
    background-image: image-set(
      url('~/assets/images/contacts-cta-bg-en@1920.webp') 1x,
      url('~/assets/images/contacts-cta-bg-en@1920@2x.webp') 2x
    );
  }
}
</style>
