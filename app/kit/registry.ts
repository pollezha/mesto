import type { Component } from 'vue'
import ArrowIconDemo from './demos/ArrowIconDemo.vue'
import Logo from '~/components/Logo.vue'
import Tag from '~/components/Tag.vue'
import LanguagesDemo from './demos/LanguagesDemo.vue'
import CaptionHeadingDemo from './demos/CaptionHeadingDemo.vue'
import ButtonDemo from './demos/ButtonDemo.vue'

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
    // Light — полоса Menu (≥ 1024) и строка в футере (< 1024, Р23); Dark — только полоса Menu кейса (Figma 52:17768).
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
]
