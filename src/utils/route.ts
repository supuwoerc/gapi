import { type ComponentProps, type ComponentType, createElement } from 'react'

export const loadComponent = <T extends ComponentType>(
  loadComponent: () => Promise<{ default: T }>,
  props?: ComponentProps<T>
) => {
  return () => {
    return loadComponent().then((m) => ({
      element: createElement(m.default, props),
    }))
  }
}
