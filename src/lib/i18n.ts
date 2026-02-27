import { z } from 'zod'

import type { Language } from '@/schema/language'
import { setSystemLanguage, useSystemConfigStore } from '@/store/system'
import i18n from 'i18next'
import backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import { en, zhCN } from 'zod/locales'

const { language } = useSystemConfigStore.getState()

i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    lng: language,
    fallbackLng: 'zh',
    ns: ['common', 'auth', 'error'],
    nsSeparator: '.',
    keySeparator: '.',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
    },
    preload: ['zh'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  })

i18n.on('languageChanged', async (lng: Language) => {
  setSystemLanguage(lng)
  z.config(lng === 'en' ? en() : zhCN())
})

export { i18n }
