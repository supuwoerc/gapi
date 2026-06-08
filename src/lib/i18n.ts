import { z } from 'zod'

import type { Language } from '@/types/language'
import i18n from 'i18next'
import backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import { en, zhCN } from 'zod/locales'

let onLanguageChangedCallback: ((lng: Language) => void) | null = null

export function onI18nLanguageChanged(callback: (lng: Language) => void) {
  onLanguageChangedCallback = callback
}

export function initI18n(language: Language) {
  i18n
    .use(backend)
    .use(initReactI18next)
    .init({
      lng: language,
      fallbackLng: 'zh',
      ns: ['global', 'route'],
      nsSeparator: ':',
      keySeparator: '.',
      partialBundledLanguages: true,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: true,
      },
      preload: ['zh', 'en'],
      backend: {
        loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
      },
    })

  i18n.on('languageChanged', async (lng: Language) => {
    onLanguageChangedCallback?.(lng)
    z.config(lng === 'en' ? en() : zhCN())
  })
}

export { i18n }
