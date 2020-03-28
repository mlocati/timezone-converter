<template>
  <b-modal
    id="modal-set-source-datetime"
    :title="$t('Set source date/time')"
    :ok-title="$t('OK')"
    :cancel-title="$t('Cancel')"
    centered
    no-fade
    @ok="emitResult"
    @hidden="emitDone"
    :ok-disabled="!dataIsGood"
  >
    <div class="container">
      <div class="row">
        <b-input-group>
          <b-input-group-prepend>
            <b-input-group-text>
              <font-awesome-icon icon="globe" />
            </b-input-group-text>
          </b-input-group-prepend>
          <b-input-group-prepend>
            <b-form-select
              v-model="selectedTimezoneGroup"
              :options="groupOptions"
            />
          </b-input-group-prepend>
          <b-form-select
            v-model="selectedTimezone"
            :options="timezoneOptions"
          />
          <b-input-group-append>
            <b-button
              variant="info"
              @click.prevent="setMyTimezone"
            >
              <font-awesome-icon icon="crosshairs" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <div class="row mt-3">
        <b-input-group>
          <b-input-group-prepend>
            <b-input-group-text>
              <font-awesome-icon icon="calendar-day" />
            </b-input-group-text>
          </b-input-group-prepend>
          <b-input
            type="date"
            v-model="selectedDate"
            required
          />
          <b-input-group-append>
            <b-button
              variant="info"
              @click.prevent="setMyDate"
            >
              <font-awesome-icon icon="crosshairs" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
      <div class="row mt-3">
        <b-input-group>
          <b-input-group-prepend>
            <b-input-group-text>
              <font-awesome-icon icon="clock" />
            </b-input-group-text>
          </b-input-group-prepend>
          <b-input
            type="time"
            v-model="selectedTime"
            required
          />
          <b-input-group-append>
            <b-button
              variant="info"
              @click.prevent="setMyTime"
            >
              <font-awesome-icon icon="crosshairs" />
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
    </div>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import * as Timezone from '../Timezone'
import moment from 'moment-timezone'
import { faGlobe, faCrosshairs, faCalendarDay, faClock } from '@fortawesome/free-solid-svg-icons'

export class Result {
  public timezone: string = ''
  public timestamp: number = Number.MIN_VALUE
}

interface ISelectItem {
  value: string
  text: string
}

@Component
export default class Configurer extends Vue {
  @Prop()
  private visible!: boolean

  @Prop()
  private timezone!: string

  @Prop()
  private timestamp!: number

  selectedTimezoneGroup: string = (Timezone.getByID(Timezone.MY_TIMEZONE) as Timezone.Timezone).group

  selectedTimezone: string = Timezone.MY_TIMEZONE

  selectedDate: string = ''

  selectedTime: string = ''

  get NO_GROUP_TEXT (): string {
    return this.$i18n.t('- others -') as string
  }

  get groupOptions (): ISelectItem[] {
    const result : ISelectItem[] = []
    let hasOthers: boolean = false
    Timezone.getGroups().forEach((group: string): void => {
      if (group === '') {
        hasOthers = true
      } else {
        result.push({ value: group, text: group })
      }
    })
    if (hasOthers) {
      result.push({ value: 'others', text: this.NO_GROUP_TEXT })
    }
    return result
  }

  get timezoneOptions (): ISelectItem[] {
    const result: ISelectItem[] = []
    const grouped = Timezone.getGroupedTimezones()
    if (grouped.hasOwnProperty(this.selectedTimezoneGroup)) {
      grouped[this.selectedTimezoneGroup].forEach((timezone: Timezone.Timezone) => {
        result.push({ value: timezone.id, text: timezone.locality })
      })
    }
    return result
  }

  get selectedTimestamp (): number {
    if (/^\d\d\d\d-\d\d-\d\d$/.test(this.selectedDate) && /^\d\d(:\d\d)+/.test(this.selectedTime)) {
      return parseInt(moment.tz(this.selectedDate + ' ' + this.selectedTime, this.selectedTimezone || this.timezone).format('X'), 10)
    }
    return this.timestamp
  }

  get dataIsGood (): boolean {
    let good: boolean = true
    let vars: string[] = [this.selectedTimezone, this.selectedDate, this.selectedTime]
    vars.some((value: string): boolean => {
      if (typeof value !== 'string' || value === '') {
        good = false
      }
      return !good
    })
    return good
  }

  mounted () {
    this.onVisibleChanged(this.visible)
    this.onTimezoneChanged(this.timezone)
    this.onTimestampChanged(this.timestamp)
  }

  @Watch('visible')
  onVisibleChanged (value: boolean) {
    if (value) {
      this.$bvModal.show('modal-set-source-datetime')
    } else {
      this.$bvModal.hide('modal-set-source-datetime')
    }
  }

  @Watch('timezone')
  onTimezoneChanged (value: string) {
    this.selectedTimezone = value
    const timezone = Timezone.getByID(value)
    if (timezone === null) {
      this.selectedTimezoneGroup = ''
    } else {
      this.selectedTimezoneGroup = timezone.group
    }
  }

  @Watch('timestamp')
  onTimestampChanged (value: number) {
    const datetime = moment.tz(value * 1000, this.timezone)
    this.selectedDate = datetime.format('YYYY-MM-DD')
    this.selectedTime = datetime.format('HH:mm')
  }

  setMyTimezone (): void {
    const timezone = Timezone.getByID(Timezone.MY_TIMEZONE)
    this.selectedTimezoneGroup = (timezone as Timezone.Timezone).group
    this.selectedTimezone = Timezone.MY_TIMEZONE
  }

  setMyDate (): void {
    const date = new Date()
    this.selectedDate = [
      date.getFullYear().toString(),
      ('0' + (date.getMonth() + 1).toString()).substr(-2),
      ('0' + date.getDate().toString()).substr(-2)
    ].join('-')
  }

  setMyTime (): void {
    const date = new Date()
    this.selectedTime = [
      ('0' + date.getHours().toString()).substr(-2),
      ('0' + date.getMinutes().toString()).substr(-2)
    ].join(':')
  }

  emitResult (): void {
    const result = new Result()
    result.timezone = this.selectedTimezone
    result.timestamp = this.selectedTimestamp
    this.$emit('configured', result)
  }

  emitDone (): void {
    this.$emit('configurationCompleted')
  }
}
</script>
