<script setup lang="ts">
// DocumentPage — шаблон документов и 404 (в Figma отдельного компонента нет; «Служебные страницы»:
// RU Document 2151:3340 @1920 / 2151:3422 @380, RU 404 2151:3491 / 2151:3575, EN Document 2151:6664 / 2151:6759,
// EN 404 2151:6826 / 2151:6923). Промежуточных фреймов нет: ТЗ → «Документы и 404».
// Состав: NavBar, Page header (h1 — Р56), тело (Text 3 Black, до 806 px), опциональная кнопка, Footer.
// Страница передаёт только title и содержимое:
//   <DocumentPage :title="$t('footer.privacy')" />                       — текст «Документ готовится» (Р19)
//   <DocumentPage :title="$t('notFound.title')" :button-text="$t('notFound.button')" button-to="/">
//     {{ $t('notFound.text') }}
//   </DocumentPage>
// Слот по умолчанию — тело, слот action — своя кнопка вместо buttonText/buttonTo.
// Текст и кнопка: на 1920 и 380 — как во фреймах (x = 60 и x = 10), на 1440…768 — по левому краю заголовка
// Page header (42/40/34/32) — ТЗ → «Документы и 404».
// Вертикальные отступы — px как на фрейме 1920 для ≥ 1024 и как на 380 для < 1024.
// TODO(question): В25 — оба шаблона ждут проверки дизайнером; пока как во фреймах Figma.

defineProps<{
  /** Заголовок Page header (h1). */
  title: string
  /** Текст кнопки Primary (404). */
  buttonText?: string
  /** Ссылка кнопки (локализуется). */
  buttonTo?: string
  /** Только песочница /__kit: NavBar в потоке, а не fixed. */
  staticNav?: boolean
}>()
</script>

<template>
  <div class="document-page">
    <NavBar :static-position="staticNav" />
    <main class="document-page__main">
      <PageHeader :title="title" />
      <section class="document-page__body">
        <div class="document-page__text">
          <slot>{{ $t('document.placeholder') }}</slot>
        </div>
        <div v-if="$slots.action || (buttonText && buttonTo)" class="document-page__action">
          <slot name="action">
            <Button type="primary" device="auto" :to="buttonTo">{{ buttonText }}</Button>
          </slot>
        </div>
      </section>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
/*
 * Отступы секции Body — Figma 2151:3420 (Document) / 2151:3571 (404) @1920 и 2151:3489 / 2151:3642 @380.
 * Верх: 80 → 36; текст → кнопка: 36 → 20; низ: 200 → 120 (Section 316 − 80 − 36 = 200; 176 − 36 − 20 = 120).
 * Левый паддинг: 10 @380 и 60 @1920 — фреймы; 768…1440 — левый паддинг Page header своей ширины.
 */
.document-page {
  --_dp-top: 36px; /* Figma 2151:3421 @380 */
  --_dp-gap: 20px; /* Figma 2151:3644 @380 */
  --_dp-bottom: 120px; /* Figma 2151:3489 @380 */
  --_dp-left: 10px; /* Figma 2151:3490 @380: x=10 */
  --_dp-right: 30px; /* Figma 2151:3490 @380: 380 − 10 − 340 = 30 (текст шириной 340) */

  min-width: 0;
}

.document-page__body {
  box-sizing: border-box;
  max-width: var(--container-max-width); /* Р24 */
  margin-inline: auto;
  padding: var(--_dp-top) var(--_dp-right) var(--_dp-bottom) var(--_dp-left);
}

.document-page__text {
  max-width: 806px; /* Figma 2151:3421 @1920 */
  color: var(--color-black);
  font-size: var(--fs-txt-3);
  line-height: var(--lh-txt-3);
  font-weight: var(--fw-regular);
}

.document-page__action {
  margin-top: var(--_dp-gap);
  display: flex;
}

@media (min-width: 768px) {
  .document-page {
    --_dp-left: 32px; /* Figma 2141:277 @768 */
    --_dp-right: 32px;
  }
}

@media (min-width: 1024px) {
  .document-page {
    --_dp-top: 80px; /* Figma 2151:3421 @1920 */
    --_dp-gap: 36px; /* Figma 2151:3573 @1920 */
    --_dp-bottom: 200px; /* Figma 2151:3342 @1920 */
    --_dp-left: 34px; /* Figma 2141:247 @1024 */
    --_dp-right: var(
      --space-60
    ); /* Figma 2151:3420 @1920: текст x=60, правого поля нет — симметрично левому */
  }
}

@media (min-width: 1280px) {
  .document-page {
    --_dp-left: 40px; /* Figma 2141:257 @1280 */
  }
}

@media (min-width: 1440px) {
  .document-page {
    --_dp-left: 42px; /* Figma 2141:267 @1440 */
  }
}

@media (min-width: 1920px) {
  .document-page {
    --_dp-left: var(--space-60); /* Figma 2151:3421 @1920: x=60 */
  }
}
</style>
