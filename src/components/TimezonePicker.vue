<template>
  <b-modal
    id="modal-pick-time-zone"
    :title="$t('Choose a time zone')"
    :ok-title="$t('OK')"
    :cancel-title="$t('Cancel')"
    centered
    no-fade
    @ok="emitResult"
    @hidden="emitDone"
    :ok-disabled="!dataIsGood"
  >
    <table class="table">
      <tbody>
        <tr>
          <td style="width: 50%">
            <b-form-select
              v-model="selectedTimezoneGroup"
              :options="groupOptions"
              :select-size="SELECT_SIZE"
            />
          </td>
          <td>
            <b-form-select
              v-model="selectedTimezone"
              :options="timezoneOptions"
              :select-size="SELECT_SIZE"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </b-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import * as Timezone from '../Timezone'
import moment from 'moment-timezone'
import { faGlobe, faCrosshairs, faCalendarDay, faClock } from '@fortawesome/free-solid-svg-icons'

interface ISelectItem {
  value: string
  text: string
}

@Component
export default class TimezonePicker extends Vue {
  readonly SELECT_SIZE: number = 16

  get NO_GROUP_TEXT (): string {
    return this.$i18n.t('- others -') as string
  }

  @Prop()
  private visible!: boolean

  selectedTimezoneGroup: string = (Timezone.getByID(Timezone.MY_TIMEZONE) as Timezone.Timezone).group

  selectedTimezone: string = Timezone.MY_TIMEZONE

  selectedDate: string = ''

  selectedTime: string = ''

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
      result.push({ value: '', text: this.NO_GROUP_TEXT })
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

  get dataIsGood (): boolean {
    return typeof this.selectedTimezone === 'string' && this.selectedTimezone !== ''
  }

  mounted () {
    this.onVisibleChanged(this.visible)
  }

  @Watch('visible')
  onVisibleChanged (value: boolean) {
    if (value) {
      this.$bvModal.show('modal-pick-time-zone')
    } else {
      this.$bvModal.hide('modal-pick-time-zone')
    }
  }

  emitResult (): void {
    this.$emit('timezonePicked', this.selectedTimezone)
  }

  emitDone (): void {
    this.$emit('timezonePickerCompleted')
  }
}
</script>
