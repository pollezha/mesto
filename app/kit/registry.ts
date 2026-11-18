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
]

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
