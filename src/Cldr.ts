interface CldrIdentity {
  version: {
    _number: string
    _cldrVersion: string
  }
  language: string
  territory?: string
}

interface CldrTerritoriesData {
    [territoryId: string]: string
}

interface CldrTerritories {
  main: {
    [localeId: string]: {
      identity: CldrIdentity
      localeDisplayNames: {
        territories: CldrTerritoriesData
      }
    }
  }
}

interface CldrTimeZoneNamesZone {
  [zoneId: string]: {
    [exemplarCityId: string]: {
      exemplarCity?: string
    }
  }
}

interface CldrTimeZoneNames {
    main: {
        [localeId: string]: {
          identity: CldrIdentity
          dates: {
            timeZoneNames: {
              // hourFormat, gmtFormat, gmtZeroFormat, regionFormat...
              zone: CldrTimeZoneNamesZone
              // metaZone
            }
          }
        }
    }
}

interface CldrData {
  territory: CldrTerritoriesData,
  zone: CldrTimeZoneNamesZone
}
function loadTranslation (locale: string): CldrData {
  const territories = <CldrTerritories>require(`./i18n/cldr/${locale}/territories.json`)
  const timeZoneNames = <CldrTimeZoneNames>require(`./i18n/cldr/${locale}/timeZoneNames.json`)
  return {
    territory: territories.main[locale].localeDisplayNames.territories,
    zone: timeZoneNames.main[locale].dates.timeZoneNames.zone
  }
}

const EN_US = loadTranslation('en-US')

const TRANSLATIONS = {
  'de-DE': loadTranslation('de-DE'),
  'fr-FR': loadTranslation('fr-FR'),
  'it-IT': loadTranslation('it-IT')
}

function getTerritoryId (nameInEnUs: string): string|undefined {
  return Object.keys(EN_US.territory).find((key: string): boolean => {
    return EN_US.territory[key] === nameInEnUs
  })
}

export function translateTerritory (nameInEnUs: string, toLocaleId: string): string {
  if (toLocaleId === 'en-US' || !(toLocaleId in TRANSLATIONS)) {
    return nameInEnUs
  }
  const territoryId = getTerritoryId(nameInEnUs)
  if (territoryId === undefined) {
    return nameInEnUs
  }
  const TRANSLATION: CldrData = (<any>TRANSLATIONS)[toLocaleId]
  if (!(territoryId in TRANSLATION.territory)) {
    return nameInEnUs
  }
  return TRANSLATION.territory[territoryId]
}

export function translateExemplarCity (id: string, toLocaleId: string): string {
  let data: CldrData
  let result: string = id.replace(/_/g, ' ')
  if (toLocaleId === 'en_US') {
    data = EN_US
  } else if (toLocaleId in TRANSLATIONS) {
    data = (<any>TRANSLATIONS)[toLocaleId]
  } else {
    return result
  }
  Object.keys(data.zone).some((zoneId: string): boolean => {
    if (!(id in data.zone[zoneId])) {
      return false
    }
    result = data.zone[zoneId][id].exemplarCity || result
    return true
  })
  return result
}
