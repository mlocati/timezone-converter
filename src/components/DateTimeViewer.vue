<template>
  <b-card
    class="text-center"
    no-body
  >
    <b-card-header>
      <h4>
        {{ title }}
      </h4>
    </b-card-header>
    <b-card-body>
      <b-card-text>
        <b-badge
          variant="primary"
        >
          {{ timezoneDisplay }}
        </b-badge>
        <div class="time-display">
          {{ timeDisplay }}
        </div>
        <div class="date-display">
          {{ dateDisplay }}
        </div>
      </b-card-text>
    </b-card-body>
    <b-card-footer v-if="showFooter">
      <slot name="action" />
    </b-card-footer>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
import * as Timezone from '../Timezone'
import moment from 'moment-timezone'

@Component
export default class DateTimeViewer extends Vue {
  @Prop()
  private title!: string
  @Prop()
  private timezone!: string
  @Prop()
  private timestamp!: number
  get timezoneDisplay () {
    const timezone = Timezone.getByID(this.timezone)
    return timezone === null ? '' : timezone.displayName
  }
  get moment () : moment.Moment {
    return moment.tz(this.timestamp * 1000, this.timezone)
  }
  get timeDisplay () : string {
    return this.moment.format('LT')
  }
  get dateDisplay () : string {
    return this.moment.format('LL')
  }
  get showFooter () : boolean {
    return !!this.$slots.action
  }
}
</script>

<style scoped type="text/scss">
.time-display {
  font-size: 150%;
  font-weight: bold;
}
</style>
