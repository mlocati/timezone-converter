import Vue from 'vue'
import VueI18n from 'vue-i18n'
import deDe from './i18n/de-DE'
import frFr from './i18n/fr-FR'
import itIt from './i18n/it-IT'
import { faWindowClose } from '@fortawesome/free-solid-svg-icons'

const FALLBACK_LOCALE = 'en-US'

Vue.use(VueI18n)

const messages = {
  'de-DE': deDe,
  'fr-FR': frFr,
  'it-IT': itIt
}
let userLanguage: string

if (navigator.languages && navigator.languages) {
  userLanguage = pickLocale(Object.keys(messages), navigator.languages)
} else if (typeof navigator.language === 'string') {
  userLanguage = pickLocale(Object.keys(messages), [navigator.language])
} else if (typeof (<any>navigator).userLanguage === 'string') {
  userLanguage = pickLocale(Object.keys(messages), [(<any>navigator).userLanguage])
} else {
  userLanguage = FALLBACK_LOCALE
}
const i18n = new VueI18n({
  locale: userLanguage,
  fallbackLocale: FALLBACK_LOCALE,
  formatFallbackMessages: true,
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  messages
})

export default i18n

function pickLocale (availableLocales: string[], userLocales: ReadonlyArray<string>): string {
  let result : string|undefined
  availableLocales.unshift(FALLBACK_LOCALE)
  userLocales.some((userLocale: string): boolean => {
    const matches = /^([a-z]{2,3})(?:[-_]([A-Z0-9]{2,3})\b)?/i.exec(userLocale)
    if (matches === null) {
      return false
    }
    const language = matches[1].toLowerCase()
    const territory = typeof matches[2] === 'string' ? matches[2].toUpperCase() : ''
    const locale = territory === '' ? language : `${language}-${territory}`
    if (availableLocales.indexOf(locale) >= 0) {
      result = locale
      return true
    }
    const prefix: string = `${language}-`
    availableLocales.some((availableLocale: string): boolean => {
      if (availableLocale === language || availableLocale.indexOf(prefix) === 0) {
        result = availableLocale
        return true
      }
      return false
    })
    return result !== undefined
  })
  return result === undefined ? FALLBACK_LOCALE : result
}
