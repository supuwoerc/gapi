import type component from '../../public/locales/zh/component.json'
import type feature from '../../public/locales/zh/feature.json'
import type global from '../../public/locales/zh/global.json'
import type route from '../../public/locales/zh/route.json'

export interface Resources {
  component: typeof component
  feature: typeof feature
  global: typeof global
  route: typeof route
}
