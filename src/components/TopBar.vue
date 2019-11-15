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
    </b-navbar>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'

@Component
export default class TopBar extends Vue {
  @Prop() private msg!: string
  public emitConfigure (): void {
    this.$emit('configure')
  }
}
</script>
