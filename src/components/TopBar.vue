<style scoped>
img.locale-flag {
  width: auto;
  height: 20px;
}
span.locale-name {
  text-transform: capitalize;
}
</style>
<template>
  <div>
    <b-navbar
      toggleable="lg"
      type="dark"
      variant="info"
    >
      <b-navbar-brand href="https://github.com/mlocati/timezone-converter">
        {{ $t('Time Zone Converter') }}
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse
        id="nav-collapse"
        is-nav
      >
        <b-navbar-nav class="ml-auto">
          <b-nav-item-dropdown right>
            <template slot="button-content">
              <img
                class="locale-flag"
                :src="getIconSource(getSelectedLocale())"
              >
              <span class="locale-name">
                {{ getLanguageName(getSelectedLocale()) }}
              </span>
            </template>
            <b-dropdown-item
              v-for="locale in getOtherAvailableLocales()"
              :key="locale"
              @click.prevent="changeLocale(locale)"
            >
              <img
                class="locale-flag"
                :src="getIconSource(locale)"
              >
              <span class="locale-name">
                {{ getLanguageName(locale) }}
              </span>
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import { SOURCE_LOCALE, AVAILABLE_LOCALES, getActiveLocale, setActiveLocale } from '../Locale'
import { translateLanguageName } from '../Cldr'

@Component
export default class TopBar extends Vue {
  @Prop() private msg!: string
  private getOtherAvailableLocales (): ReadonlyArray<string> {
    const locale = getActiveLocale()
    if (locale === SOURCE_LOCALE) {
      return AVAILABLE_LOCALES
    }
    const result = [SOURCE_LOCALE].concat(AVAILABLE_LOCALES)
    const index = result.indexOf(locale)
    if (index < 0) {
      return result
    }
    result.splice(index, 1)
    return result
  }
  private getSelectedLocale (): string {
    return getActiveLocale()
  }
  private changeLocale (locale: string): void {
    setActiveLocale(locale)
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
