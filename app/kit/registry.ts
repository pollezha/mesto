import type { Component } from 'vue'

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

export const kit: KitEntry[] = []
