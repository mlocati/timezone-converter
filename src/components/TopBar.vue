<style scoped>
img.locale-flag {
  width: auto;
  height: 20px;
}
img.locale-flag-current {
  height: 16px;
}
span.locale-name {
  text-transform: capitalize;
}
</style>
<template>
  <div>
    <b-navbar
      type="dark"
      variant="info"
    >
      <b-navbar-brand href="https://github.com/mlocati/timezone-converter">
        {{ $t('Time Zone Converter') }}
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown
          right
          no-caret
        >
          <template slot="button-content">
            <img
              class="locale-flag locale-flag-current"
              :src="getIconSource(getSelectedLocale())"
            >
            <span class="locale-name d-none d-sm-inline">
              {{ getLanguageName(getSelectedLocale()) }}
            </span>
          </template>
          <b-dropdown-item
            v-for="item in getOtherAvailableLocales()"
            :key="item.localeId"
            @click.prevent="changeLocale(item.localeId)"
          >
            <img
              class="locale-flag"
              :src="getIconSource(item.localeId)"
            >
            <span class="locale-name">
              {{ item.localeName }}
            </span>
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SOURCE_LOCALE, AVAILABLE_LOCALES, getActiveLocale, setActiveLocale } from '../Locale'
import { translateLanguageName } from '../Cldr'
import EventBus from '../EventBus'

@Component
export default class TopBar extends Vue {
  private getAllAvailableLanguages (): ReadonlyArray<{localeId: string, localeName: string}> {
    const list: {localeId: string, localeName: string}[] = []
    const allLocaleIds: string[] = [SOURCE_LOCALE].concat(AVAILABLE_LOCALES)
    allLocaleIds.forEach((localeId: string): void => {
      list.push({
        localeId,
        localeName: translateLanguageName(localeId)
      })
    })
    list.sort((a, b): number => {
      return a.localeName.localeCompare(b.localeName, 'en', { sensitivity: 'base' })
    })
    return list
  }

  private getOtherAvailableLocales (): ReadonlyArray<{localeId: string, localeName: string}> {
    const activeLocaleId = getActiveLocale()
    return this.getAllAvailableLanguages().filter((item): Boolean => {
      return item.localeId !== activeLocaleId
    })
  }

  private getSelectedLocale (): string {
    return getActiveLocale()
  }

  private changeLocale (locale: string): void {
    setActiveLocale(locale)
    EventBus.$emit('localeChanged')
  }

  public emitConfigure (): void {
    this.$emit('configure')
  }

  private getLanguageName (locale: string) : string {
    return translateLanguageName(locale)
  }

  private getIconSource (locale: string): string {
    const chunks = locale.split('-')
    return `images/flags/${chunks[1]}.svg`
  }
}
</script>
