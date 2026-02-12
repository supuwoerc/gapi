import type { Language } from '@/schema/language'
import { setSystemLanguage, useSystemConfigStore } from '@/store/system'
import i18n from 'i18next'
import backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { isDevEnv } from '@/utils/env'

const { language } = useSystemConfigStore.getState()

i18n
  .use(backend)
  .use(initReactI18next)
  .init({
    lng: language,
    fallbackLng: 'zh',
    debug: isDevEnv,
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

i18n.on('languageChanged', (lng: Language) => {
  setSystemLanguage(lng)
})

export default i18n
