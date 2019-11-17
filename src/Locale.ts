import Vue from 'vue'
import VueI18n from 'vue-i18n'
import moment from 'moment-timezone'

export const SOURCE_LOCALE = 'en-US'

export const AVAILABLE_LOCALES: ReadonlyArray<string> = [
  'de-DE',
  'el-GR',
  'fr-FR',
  'it-IT'
]

let browserLocale: string = detectBrowserLocale()
let activeLocale: string = getInitialActiveLocale()

const vueI18nMessages : VueI18n.LocaleMessages = {}

AVAILABLE_LOCALES.forEach((locale: string): void => {
  vueI18nMessages[locale] = require(`./i18n/${locale}.json`)
})

Vue.use(VueI18n)

export const vueI18n = new VueI18n({
  locale: activeLocale,
  fallbackLocale: SOURCE_LOCALE,
  formatFallbackMessages: true,
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  messages: vueI18nMessages
})

export function getActiveLocale (): string {
  return activeLocale
}

export function setActiveLocale (newLocale: string): void {
  if (newLocale !== SOURCE_LOCALE && AVAILABLE_LOCALES.indexOf(newLocale) < 0) {
    throw new Error(`Invalid new locale identifier: ${newLocale}`)
  }
  activeLocale = newLocale
  vueI18n.locale = newLocale
  moment.locale(newLocale)
  window.document.documentElement.lang = activeLocale
}

function detectBrowserLocale (): string {
  if (navigator.languages && navigator.languages.length) {
    return pickBrowserLocale(navigator.languages)
  }
  if (typeof navigator.language === 'string' && navigator.language !== '') {
    return pickBrowserLocale([navigator.language])
  }
  if (typeof (<any>navigator).userLanguage === 'string' && (<any>navigator).userLanguage !== '') {
    return pickBrowserLocale([(<any>navigator).userLanguage])
  }
  return SOURCE_LOCALE
}

function pickBrowserLocale (browserLocales: ReadonlyArray<string>): string {
  let result : string|undefined
  const allAvailableLocales : string[] = [SOURCE_LOCALE].concat(AVAILABLE_LOCALES)
  browserLocales.some((rawBrowserLocale: string): boolean => {
    const matches = /^([a-z]{2,3})(?:[-_]([A-Z0-9]{2,3})\b)?/i.exec(rawBrowserLocale)
    if (matches === null) {
      return false
    }
    const browserLanguage = matches[1].toLowerCase()
    const browserTerritory = typeof matches[2] === 'string' ? matches[2].toUpperCase() : ''
    const browserLocale = browserTerritory === '' ? browserLanguage : `${browserLanguage}-${browserTerritory}`
    if (allAvailableLocales.indexOf(browserLocale) >= 0) {
      result = browserLocale
      return true
    }
    const browserLocalePrefix: string = `${browserLanguage}-`
    allAvailableLocales.some((availableLocale: string): boolean => {
      if (availableLocale === browserLocale || availableLocale.indexOf(browserLocalePrefix) === 0) {
        result = availableLocale
        return true
      }
      return false
    })
    return result !== undefined
  })
  return result === undefined ? SOURCE_LOCALE : result
}

function getInitialActiveLocale (): string {
  return browserLocale
}

setActiveLocale(activeLocale)
