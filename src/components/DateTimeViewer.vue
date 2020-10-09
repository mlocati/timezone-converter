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
    <b-card-footer v-if="countdown">
      {{ countdownText }}
    </b-card-footer>
  </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
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
  @Prop()
  private countdown: boolean|undefined
  private countdownTimer: number|null = null
  private countdownText: string = ' '
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
  private configureCountdownTimer () : void {
    if (this.countdown) {
      this.updateCountdown()
      if (this.countdownTimer === null) {
        this.countdownTimer = setInterval(() => this.updateCountdown(), 200)
      }
    } else {
      if (this.countdownTimer !== null) {
        clearInterval(this.countdownTimer)
        this.countdownTimer = null
      }
    }
  }
  private updateCountdown () : void {
    this.countdownText = moment(this.timestamp * 1000).fromNow()
  }
  @Watch('countdown')
  private onShowCountdownChanged () : void {
    this.configureCountdownTimer()
  }
  private mounted () : void {
    this.configureCountdownTimer()
  }
  private destroyed () : void {
    if (this.countdownTimer !== null) {
      clearInterval(this.countdownTimer)
      this.countdownTimer = null
    }
  }
}
</script>

<style scoped type="text/scss">
.time-display {
  font-size: 150%;
  font-weight: bold;
}
</style>
