import type { Component } from 'vue'
import ArrowIconDemo from './demos/ArrowIconDemo.vue'
import Logo from '~/components/Logo.vue'
import Tag from '~/components/Tag.vue'
import LanguagesDemo from './demos/LanguagesDemo.vue'
import CaptionHeadingDemo from './demos/CaptionHeadingDemo.vue'
import ButtonDemo from './demos/ButtonDemo.vue'
import Checkbox from '~/components/Checkbox.vue'
import InputDemo from './demos/InputDemo.vue'
import CheckboxFieldDemo from './demos/CheckboxFieldDemo.vue'
import PageHeaderDemo from './demos/PageHeaderDemo.vue'
import Footer from '~/components/Footer.vue'
import NavBar from '~/components/NavBar.vue'
import FormDemo from './demos/FormDemo.vue'
import ContactsCta from '~/components/ContactsCta.vue'
import Typing from '~/components/Typing.vue'
import HeroGif from '~/components/HeroGif.vue'
import CaptionItemDemo from './demos/CaptionItemDemo.vue'
import ServicesBlock from '~/components/ServicesBlock.vue'
import CaseImageDemo from './demos/CaseImageDemo.vue'
import CaseCardDemo from './demos/CaseCardDemo.vue'
import ServiceCardDemo from './demos/ServiceCardDemo.vue'
import InfoCardDemo from './demos/InfoCardDemo.vue'
import CookieBanner from '~/components/CookieBanner.vue'
import DocumentPageDemo from './demos/DocumentPageDemo.vue'

// Реестр песочницы /__kit. component-builder добавляет запись, когда верстает компонент:
// все варианты из Figma, которые встречаются на сайте, с теми же именами свойств.
//
// Пример:
// {
//   name: 'Button',
//   figma: '1:1748',
//   component: Button, // import Button from '~/components/Button.vue'
//   variants: [
//     { label: 'Type=Primary, Device=Desktop', props: { type: 'primary' }, widths: [1920, 1440, 1280, 1024] },
//     { label: 'Type=Primary, Device=Mobile', props: { type: 'primary' }, widths: [768, 380] },
//   ],
// }

export interface KitVariant {
  /** Имя варианта как в Figma: «Type=Primary, Device=Desktop». */
  label: string
  props?: Record<string, unknown>
  /** Текст в слот по умолчанию, если компонент его принимает. */
  slot?: string
  /** Ширины, на которых вариант стоит на экранах («Компоненты» → «Какой вариант на какой ширине»); нет — все. */
  widths?: number[]
}

export interface KitEntry {
  /** Vue-имя компонента. */
  name: string
  /** node id компонента в Figma. */
  figma: string
  component: Component
  variants: KitVariant[]
}

export const kit: KitEntry[] = [
  {
    // Вариантов в Figma нет; демо показывает иконку внутри текста двух кеглей («размер = кегль»).
    name: 'ArrowIcon',
    figma: '2043:1774',
    component: ArrowIconDemo,
    variants: [
      { label: 'Icon/Arrow Up Right · Caption 2', props: { text: 'caption-2' } },
      { label: 'Icon/Arrow Up Right · Heading 5', props: { text: 'h5' } },
    ],
  },
  {
    // Logo тянется по ширине контейнера; в песочнице ширина — размер символа варианта в Figma
    // (5:373 / 30:2909 — 215.987, 38:12695 — 218, 38:12676 — 218.04). White рисуется светлым
    // на светлом фоне песочницы. White стоит только в полосе Menu кейса и в Page header (≥ 1024).
    // Подпись (aria-label) — по языку страницы: EN-варианты проверяются на /en/__kit.
    name: 'Logo',
    figma: '30:2908',
    component: Logo,
    variants: [
      {
        label: 'Color=Blue, Local=RU',
        props: { color: 'Blue', local: 'RU', style: { width: '215.987px' } },
      },
      {
        label: 'Color=White, Local=RU',
        props: { color: 'White', local: 'RU', style: { width: '215.987px' } },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Color=Blue, Local=EN',
        props: { color: 'Blue', local: 'EN', style: { width: '218px' } },
      },
      {
        label: 'Color=White, Local=EN',
        props: { color: 'White', local: 'EN', style: { width: '218.04px' } },
        widths: [1920, 1440, 1280, 1024],
      },
    ],
  },
  {
    // Свойство Figma Language = текущая локаль: /__kit — Russian, /en/__kit — English.
    // Light — полоса Menu (≥ 1024) и строка в футере (< 1024, Р23); Dark — полоса Menu кейса (Figma 52:17768) и Page header.
    // Dark в песочнице — на тёмной подложке демо, иначе белый текст не виден.
    name: 'Languages',
    figma: '4:323',
    component: LanguagesDemo,
    variants: [
      { label: 'Mode=Light', props: { mode: 'light' } },
      { label: 'Mode=Dark', props: { mode: 'dark' }, widths: [1920, 1440, 1280, 1024] },
    ],
  },
  {
    // Вариант передаёт место использования (CaseCard), Tag по ширине не переключается.
    // Ширины — «Компоненты» → «Какой вариант на какой ширине» (с 04.11 Small и на 1024/768, А17).
    name: 'Tag',
    figma: '2044:1012',
    component: Tag,
    variants: [
      { label: 'Size=Default', props: { size: 'default' }, widths: [1920, 1440, 1280] },
      { label: 'Size=Small', props: { size: 'small' }, widths: [1024, 768, 380] },
    ],
  },
  {
    // Heading (подпись раздела) — вариантов в Figma нет; два места на главной, текст из словаря
    // текущей локали. Стоит на всех 6 ширинах (Projects 35:2176 …, Services 35:2207 …).
    name: 'CaptionHeading',
    figma: '14:1471',
    component: CaptionHeadingDemo,
    variants: [
      { label: 'Heading · home.projects.title', props: { text: 'projects' } },
      { label: 'Heading · home.services.title', props: { text: 'services' } },
    ],
  },
  {
    // State (Default / Hover / Pressed) — :hover / :active, в песочнице видно наведением и нажатием.
    // Device выбирает место использования: Desktop на ≥ 1024, Mobile на 768 и 380 («Какой вариант на какой ширине»).
    // With Icon на экранах сайта не стоит («Компоненты» → Icon/Arrow Up Right) — в реестре нет, в Button.vue сверстан.
    // Secondary без переопределений стоит только в блоке услуг ≥ 1280 (на 1440/1280 размеры по RU-экрану задаёт
    // ServicesBlock, Р3, Р75); на 1024 и ниже Secondary есть только в cookie-баннере с размерами Р73 — его показывает CookieBanner.
    name: 'Button',
    figma: '1:1748',
    component: ButtonDemo,
    variants: [
      {
        label: 'Type=Primary, Device=Desktop',
        props: { type: 'primary', device: 'desktop', text: 'cta.discuss' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Type=Primary, Device=Mobile',
        props: { type: 'primary', device: 'mobile', text: 'cta.discuss' },
        widths: [768, 380],
      },
      {
        label: 'Type=Primary, Device=Desktop · notFound.button',
        props: { type: 'primary', device: 'desktop', text: 'notFound.button' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Type=Primary, Device=Mobile · notFound.button',
        props: { type: 'primary', device: 'mobile', text: 'notFound.button' },
        widths: [768, 380],
      },
      {
        label: 'Type=Secondary, Device=Desktop',
        props: { type: 'secondary', device: 'desktop', text: 'cta.discuss' },
        widths: [1920, 1440, 1280],
      },
    ],
  },
  {
    // Только квадрат (Type=Checkbox); с подписью (Type=Checkbox Field) — CheckboxField.
    // Size выбирает место использования: Default на ≥ 1024, Small на 768 и 380 («Какой вариант на какой ширине»).
    // Filled — modelValue: true; Error — error: true (на отмеченном не показывается: варианта Filled + Error нет).
    // В песочнице без v-model: клик переключает нативный input, вид следует за :checked.
    name: 'Checkbox',
    figma: '8:758',
    component: Checkbox,
    variants: [
      {
        label: 'State=Empty, Size=Default, Type=Checkbox',
        props: { size: 'default' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'State=Filled, Size=Default, Type=Checkbox',
        props: { size: 'default', modelValue: true },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'State=Error, Size=Default, Type=Checkbox',
        props: { size: 'default', error: true },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'State=Empty, Size=Small, Type=Checkbox',
        props: { size: 'small' },
        widths: [768, 380],
      },
      {
        label: 'State=Filled, Size=Small, Type=Checkbox',
        props: { size: 'small', modelValue: true },
        widths: [768, 380],
      },
      {
        label: 'State=Error, Size=Small, Type=Checkbox',
        props: { size: 'small', error: true },
        widths: [768, 380],
      },
    ],
  },
  {
    // Size выбирает место использования (Form): Default на ≥ 1024, Small на 768 и 380 (Р72).
    // Ширина образца — ширина варианта в Figma (Default 710, Small 316), подпись и ошибка — из словаря.
    // Focus и Typing — состояние фокуса: ревьюер фокусирует поле (Focus — пустое, Typing — с текстом).
    // Значения Typing / Filled — пример ввода из вариантов Figma (2044:892 / 2044:897, 2044:917 / 2044:922).
    // Textarea в Error на сайте не используется («Компоненты» → Input) — в реестре нет, в Input.vue работает.
    name: 'Input',
    figma: '2044:984',
    component: InputDemo,
    variants: inputVariants(),
  },
  {
    // Чекбокс с подписью (Type=Checkbox Field); подпись и ссылки собирает компонент по kind из словаря (Р52).
    // Только RU-форма: на /en/__kit демо показывает служебную пометку. Size — место использования (Form):
    // Default на ≥ 1024, Small на 768 и 380 (Р72). Ширина образца — ширина варианта в Figma (Default 710, Small 316).
    // Filled — modelValue: true; Error — error: true, снимается отметкой (как в форме, ТЗ → «Форма» п. 2).
    name: 'CheckboxField',
    figma: '8:758',
    component: CheckboxFieldDemo,
    variants: checkboxFieldVariants(),
  },
  {
    // Variant Width выбирает ширина экрана (нижняя контрольная, Р4); Locale — язык страницы
    // (/__kit — RU, /en/__kit — EN). Короткий заголовок — «Услуги» (nav.services), длинный — название
    // документа (footer.consent на RU, footer.privacy на EN). Логотип и Languages — только ≥ 1024.
    name: 'PageHeader',
    figma: '2046:979',
    component: PageHeaderDemo,
    variants: [
      { label: 'Width=1920 … 380 · title nav.services', props: { text: 'short' } },
      { label: 'Width=1920 … 380 · long title (document name)', props: { text: 'long' } },
    ],
  },
  {
    // Local — язык страницы (/__kit — RU, /en/__kit — EN). Desktop на 1920–768 (на 768 с Languages,
    // она видна только < 1024), Mobile на 380. «Настройки cookie» — пункт при условии Р22:
    // в песочнице включается prop'ом cookieSettings.
    name: 'Footer',
    figma: '38:13044',
    component: Footer,
    variants: [
      {
        label: 'Local=RU / EN, Device=Desktop',
        props: { cookieSettings: false },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      { label: 'Local=RU / EN, Device=Mobile', props: { cookieSettings: false }, widths: [380] },
      {
        label: 'Local=RU / EN, Device=Desktop · Настройки cookie (Р22)',
        props: { cookieSettings: true },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      {
        label: 'Local=RU / EN, Device=Mobile · Настройки cookie (Р22)',
        props: { cookieSettings: true },
        widths: [380],
      },
    ],
  },
  {
    // Cookie banner fixed → в песочнице staticPosition (в потоке, не зависит от cookie и конфига).
    // Какой вариант на какой ширине (Р66): Desktop на ≥ 1024, Mobile на 768 и 380; Locale — язык страницы.
    name: 'CookieBanner',
    figma: '2151:353',
    component: CookieBanner,
    variants: [
      {
        label: 'Device=Desktop, Locale=RU / EN',
        props: { staticPosition: true },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Device=Mobile, Locale=RU / EN',
        props: { staticPosition: true },
        widths: [768, 380],
      },
    ],
  },
  {
    // NavBar fixed → в песочнице staticPosition (в потоке). Какой вариант на какой ширине:
    // Desktop на ≥ 1024, Mobile на 768 и 380; Mobile-op — открытое меню на < 1024 (Р53, В28).
    // Вид выбирает медиазапрос на 1024, поэтому ширина страницы = ширина экрана.
    name: 'NavBar',
    figma: '35:5013',
    component: NavBar,
    variants: [
      {
        label: 'Type=Desktop',
        props: { staticPosition: true },
        widths: [1920, 1440, 1280, 1024],
      },
      { label: 'Type=Mobile', props: { staticPosition: true }, widths: [768, 380] },
      {
        label: 'Type=Mobile-op',
        props: { staticPosition: true, initialOpen: true },
        widths: [768, 380],
      },
    ],
  },
  {
    // Locale — язык страницы: RU на /__kit (поля, два чекбокса), EN на /en/__kit (три поля, многострочное ниже).
    // Size выбирает место использования: Default на ≥ 1024, Small на 768 и 380 (Р72). Ширина образца — ширина
    // компонента в Figma (Default 806, Small 348). Состояния «пустая отправка», «отправка», «успех» и
    // «ошибка отправки» демо вызывает само (заполняет поля, жмёт кнопку, ответ /api/lead подменён) — demos/FormDemo.vue.
    name: 'Form',
    figma: '2045:959',
    component: FormDemo,
    variants: [
      {
        label: 'Locale=RU|EN, Size=Default',
        props: { size: 'default' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Locale=RU|EN, Size=Small',
        props: { size: 'small' },
        widths: [768, 380],
      },
      {
        label: 'Locale=RU|EN, Size=Default · пустая отправка (Error полей и согласия)',
        props: { size: 'default', state: 'errors' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Locale=RU|EN, Size=Small · пустая отправка (Error полей и согласия)',
        props: { size: 'small', state: 'errors' },
        widths: [768, 380],
      },
      {
        label: 'Locale=RU|EN, Size=Default · отправка (поля Disabled, кнопка aria-busy)',
        props: { size: 'default', state: 'sending' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Locale=RU|EN, Size=Small · отправка (поля Disabled, кнопка aria-busy)',
        props: { size: 'small', state: 'sending' },
        widths: [768, 380],
      },
      {
        label: 'Locale=RU|EN, Size=Default · успех (Р67)',
        props: { size: 'default', state: 'success' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Locale=RU|EN, Size=Small · успех (Р67)',
        props: { size: 'small', state: 'success' },
        widths: [768, 380],
      },
      {
        label: 'Locale=RU|EN, Size=Default · успех, фокус по клику (ТЗ → «Форма» п. 4)',
        props: { size: 'default', state: 'success-click' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Locale=RU|EN, Size=Small · успех, фокус по клику (ТЗ → «Форма» п. 4)',
        props: { size: 'small', state: 'success-click' },
        widths: [768, 380],
      },
      {
        label: 'Locale=RU|EN, Size=Default · ошибка отправки (В26)',
        props: { size: 'default', state: 'error' },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Locale=RU|EN, Size=Small · ошибка отправки (В26)',
        props: { size: 'small', state: 'error' },
        widths: [768, 380],
      },
    ],
  },
  {
    // Device выбирает ширина экрана: Desktop на ≥ 1024 (Form Default), Mobile на 768 и 380 (Form Small);
    // Local — язык страницы (/__kit — Default (RU), /en/__kit — En). Перекрытия с футером в песочнице нет (prop overlap).
    name: 'ContactsCta',
    figma: '23:3888',
    component: ContactsCta,
    variants: [
      {
        label: 'Device=Desktop, Local=Default (RU) / En',
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Device=Mobile, Local=Default (RU) / En',
        widths: [768, 380],
      },
    ],
  },
  {
    // services-block: 4 блока × Default / Opened × Desktop / Mobile; Opened — initialOpen (только песочница).
    name: 'ServicesBlock',
    figma: '8:410',
    component: ServicesBlock,
    variants: servicesBlockVariants(),
  },
  {
    // Вариантов в Figma нет. Демо — белая панель раскрытого блока с двумя пунктами блока из словаря
    // текущей локали (Р8). ≥ 1024 линия 4 / отступ 20 / gap 8, на 768 и 380 — 2 / 8 / 4.
    // Самые длинные EN: communicationStrategy, websites; RU: communicationStrategy.
    name: 'CaptionItem',
    figma: '8:523',
    component: CaptionItemDemo,
    variants: [
      {
        label: 'captionItem · Branding',
        props: { block: 'branding', items: ['branding', 'brandbook'] },
      },
      {
        label: 'captionItem · Marketing',
        props: { block: 'marketing', items: ['social', 'communicationStrategy'] },
      },
      {
        label: 'captionItem · UX/UI',
        props: { block: 'interfaces', items: ['websites', 'mobileApps'] },
      },
      {
        label: 'captionItem · Design Support',
        props: { block: 'support', items: ['consultation', 'support'] },
      },
    ],
  },
  {
    // Отдельного компонента в Figma нет: блок Section на экранах главной (35:2204 @1920 … 35:2498 @380; EN 51:13692 … 51:13738).
    // Вариантов нет, вид одинаков на всех 6 ширинах; язык — по странице (/__kit — RU, /en/__kit — EN).
    // Анимация стартует, когда блок в окне; reduced motion — статичное последнее слово (эмулируется в браузере).
    name: 'Typing',
    figma: '35:2204',
    component: Typing,
    variants: [{ label: 'Section · перебивка (RU / EN по локали страницы)' }],
  },
  {
    // Hero-надпись главной (Header 35:2170 @1920 … 35:2469 @380; EN 51:13656 … 51:13707) + эффект курсора.
    // Вариантов нет; на < 1024 — только надпись. Эффект (круг 240 + гиф) — наведением мыши на ≥ 1024.
    name: 'HeroGif',
    figma: '2092:3801',
    component: HeroGif,
    variants: [{ label: 'Hero-надпись + gif (RU / EN по локали страницы)' }],
  },
  {
    // state=Default / Hover: Hover — наведением на фото (+6%, 300 мс ease-out, pointer: fine, Р1).
    // Кейсы 1–4 главной (по месту в Case card); рамка по фрейму каждой ширины (радиус/пропорции в CaseImage.vue).
    name: 'CaseImage',
    figma: '14:1481',
    component: CaseImageDemo,
    variants: [
      { label: 'Кейс 1 (Featured)', props: { n: 1 } },
      { label: 'Кейс 2', props: { n: 2 } },
      { label: 'Кейс 3', props: { n: 3 } },
      { label: 'Кейс 4', props: { n: 4 } },
    ],
  },
  {
    // Case card 2046:1064. Тип по Figma выбирается номером кейса и шириной (CSS): Featured (кейс 1) на 1920–768,
    // Mobile Featured на 380; Media Left / Right / Wide (кейсы 2–4) на 1920–1024; Mobile Stacked (на 768 — та же
    // раскладка с тегом под фото) на 768 и 380. State=Hover — наведение на фото (Р1), отдельного prop нет.
    name: 'CaseCard',
    figma: '2046:1064',
    component: CaseCardDemo,
    variants: [
      {
        label: 'Type=Featured, State=Default',
        props: { n: 1 },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      { label: 'Type=Mobile Featured, State=Default', props: { n: 1 }, widths: [380] },
      {
        label: 'Type=Media Left, State=Default',
        props: { n: 2 },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Type=Media Right, State=Default',
        props: { n: 3 },
        widths: [1920, 1440, 1280, 1024],
      },
      {
        label: 'Type=Media Wide, State=Default',
        props: { n: 4 },
        widths: [1920, 1440, 1280, 1024],
      },
      { label: 'Type=Mobile Stacked, State=Default · кейс 2', props: { n: 2 }, widths: [768, 380] },
      { label: 'Type=Mobile Stacked, State=Default · кейс 3', props: { n: 3 }, widths: [768, 380] },
      { label: 'Type=Mobile Stacked, State=Default · кейс 4', props: { n: 4 }, widths: [768, 380] },
    ],
  },
  {
    // Locale (RU / EN) — язык страницы: /__kit и /en/__kit. Size: Default на 1920–768, Small на 380 (по экранам
    // «Контактов», Р16). Высота Mail в песочнице — min-height ступени; в ряду страницы почта тянется до соседней.
    name: 'InfoCard',
    figma: '2045:997',
    component: InfoCardDemo,
    variants: [
      {
        label: 'Type=Socials, Size=Default',
        props: { type: 'socials', size: 'default' },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      {
        label: 'Type=Mail, Size=Default',
        props: { type: 'mail', size: 'default' },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      {
        label: 'Type=Socials, Size=Small',
        props: { type: 'socials', size: 'small' },
        widths: [380],
      },
      { label: 'Type=Mail, Size=Small', props: { type: 'mail', size: 'small' }, widths: [380] },
    ],
  },
  {
    // Size: Default на 1920–768, Small на 380 («Какой вариант на какой ширине»). Текст — из словаря
    // (короткий: «Логотип»; длинный: «Сайты, лендинги, интернет-магазины»), язык — /__kit и /en/__kit.
    name: 'ServiceCard',
    figma: '2045:972',
    component: ServiceCardDemo,
    variants: [
      {
        label: 'Size=Default · короткий текст',
        props: { size: 'default', item: 'short' },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      {
        label: 'Size=Default · длинный текст',
        props: { size: 'default', item: 'long' },
        widths: [1920, 1440, 1280, 1024, 768],
      },
      {
        label: 'Size=Small · короткий текст',
        props: { size: 'small', item: 'short' },
        widths: [380],
      },
      {
        label: 'Size=Small · длинный текст',
        props: { size: 'small', item: 'long' },
        widths: [380],
      },
    ],
  },
  {
    // Шаблон документов и 404; в Figma отдельного компонента нет (фреймы 2151:3340 … 2151:6923, только 1920 и 380).
    // RU/EN — по локали песочницы. Document — «Документ готовится» (Р19), длинный заголовок — проверка переноса.
    name: 'DocumentPage',
    figma: '2151:3340',
    component: DocumentPageDemo,
    variants: [
      { label: 'Document', props: { kind: 'document' } },
      { label: 'Document · long title', props: { kind: 'document-long' } },
      { label: '404', props: { kind: 'not-found' } },
    ],
  },
]

// services-block 8:410: State × Type × Device. Desktop на ≥ 1024, Mobile на 768 и 380. Opened — через
// initialOpen (только песочница; на сайте все блоки при загрузке закрыты, Р5). Тексты — из словаря локали (Р8).
function servicesBlockVariants(): KitVariant[] {
  const types = [
    { type: 'branding', label: 'Branding' },
    { type: 'marketing', label: 'Marketing' },
    { type: 'interfaces', label: 'UX/UI' },
    { type: 'support', label: 'Design Support' },
  ] as const
  const devices = [
    { label: 'Desktop', widths: [1920, 1440, 1280, 1024] },
    { label: 'Mobile', widths: [768, 380] },
  ] as const
  return (['Default', 'Opened'] as const).flatMap((state) =>
    types.flatMap((t) =>
      devices.map((d) => ({
        label: `State=${state}, Type=${t.label}, Device=${d.label}`,
        props: { type: t.type, initialOpen: state === 'Opened' },
        widths: [...d.widths],
      })),
    ),
  )
}

function checkboxFieldVariants(): KitVariant[] {
  const sizes = [
    { size: 'default', label: 'Default', width: '710px', widths: [1920, 1440, 1280, 1024] },
    { size: 'small', label: 'Small', width: '316px', widths: [768, 380] },
  ] as const
  const kinds = [
    { kind: 'consent', text: 'form.consent' },
    { kind: 'newsletter', text: 'form.newsletter' },
  ] as const
  const states = [
    { label: 'Empty', modelValue: false, error: false },
    { label: 'Filled', modelValue: true, error: false },
    { label: 'Error', modelValue: false, error: true },
  ] as const

  return kinds.flatMap((k) =>
    sizes.flatMap((s) =>
      states.map((st) => ({
        label: `State=${st.label}, Size=${s.label}, Type=Checkbox Field · ${k.text}`,
        props: {
          kind: k.kind,
          size: s.size,
          modelValue: st.modelValue,
          error: st.error,
          style: { width: s.width },
        },
        widths: [...s.widths],
      })),
    ),
  )
}

function inputVariants(): KitVariant[] {
  const sizes = [
    { size: 'default', label: 'Default', width: '710px', widths: [1920, 1440, 1280, 1024] },
    { size: 'small', label: 'Small', width: '316px', widths: [768, 380] },
  ] as const
  const types = [
    { type: 'field', label: 'Field', text: 'form.name', value: 'Мария' },
    {
      type: 'textarea',
      label: 'Textarea',
      text: 'form.message',
      value: 'Нужен ребрендинг сети кофеен',
    },
  ] as const
  const states = [
    { label: 'Default', filled: false, error: false, disabled: false },
    { label: 'Focus', filled: false, error: false, disabled: false },
    { label: 'Typing', filled: true, error: false, disabled: false },
    { label: 'Filled', filled: true, error: false, disabled: false },
    { label: 'Error', filled: false, error: true, disabled: false },
    { label: 'Disabled', filled: false, error: false, disabled: true },
  ] as const

  return sizes.flatMap((s) =>
    types.flatMap((t) =>
      states
        .filter((st) => !(t.type === 'textarea' && st.label === 'Error'))
        .map((st) => ({
          label: `Type=${t.label}, State=${st.label}, Size=${s.label}`,
          props: {
            type: t.type,
            size: s.size,
            text: t.text,
            value: st.filled ? t.value : '',
            error: st.error,
            disabled: st.disabled,
            style: { width: s.width },
          },
          widths: [...s.widths],
        })),
    ),
  )
}
