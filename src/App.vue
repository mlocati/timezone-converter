<template>
  <div
    id="app"
    class="h-100 d-flex flex-column"
  >
    <header class="mb-auto">
      <TopBar />
    </header>
    <main>
      <div class="container-fluid mt-3">
        <b-card-group deck>
          <DateTimeViewer
            :title="$t('Source time zone')"
            :timezone="sourceTimezone"
            :timestamp="timestamp"
          >
            <template v-slot:action>
              <b-button
                size="sm"
                class="my-2 my-sm-0"
                variant="success"
                @click.prevent="configure"
              >
                <font-awesome-icon icon="edit" />
                {{ $t('Edit') }}
              </b-button>
            </template>
          </DateTimeViewer>
          <DateTimeViewer
            :title="$t('Your time zone')"
            :timezone="localTimezone"
            :timestamp="timestamp"
          />
          <DateTimeViewer
            v-for="(otherTimezone, otherTimezoneIndex) in otherTimezones"
            :key="otherTimezone + '@' + otherTimezoneIndex"
            :title="$t('Custom time zone')"
            :timezone="otherTimezone"
            :timestamp="timestamp"
          >
            <template v-slot:action>
              <b-button
                size="sm"
                class="my-2 my-sm-0"
                variant="danger"
                @click.prevent="removeOtherTimezoneAt(otherTimezoneIndex)"
              >
                <font-awesome-icon icon="trash-alt" />
                {{ $t('Remove') }}
              </b-button>
            </template>
          </DateTimeViewer>
          <b-card
            class="text-center add-timezone"
            border-variant="light"
            @click.prevent="pickTimezone"
          >
            +
          </b-card>
        </b-card-group>
      </div>
    </main>
    <footer class="footer mt-auto py-3">
      <div class="container-fluid">
        <div class="text-right">
          <b-button
            :variant="copyButtonVariant"
            @click.prevent="copyUrl"
          >
            <font-awesome-icon icon="copy" />
            {{ $t('Copy URL') }}
          </b-button>
        </div>
      </div>
    </footer>
    <Configurer
      :timezone="sourceTimezone"
      :timestamp="timestamp"
      :visible="configuring"
      @configured="configured"
      @configurationCompleted="configuring = false"
    />
    <TimezonePicker
      :visible="pickingTimezone"
      @timezonePicked="timezonePicked"
      @timezonePickerCompleted="pickingTimezone = false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import * as LocationHash from './LocationHash'
import TopBar from './components/TopBar.vue'
import DateTimeViewer from './components/DateTimeViewer.vue'
import * as Configurer from './components/Configurer.vue'
import TimezonePicker from './components/TimezonePicker.vue'
import * as Timezone from './Timezone'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import copy from 'clipboard-copy'
import EventBus from './EventBus'

@Component({
  components: {
    TopBar,
    DateTimeViewer,
    Configurer: Configurer.default,
    TimezonePicker
  }
})
export default class App extends Vue {
  sourceTimezone: string = ''
  localTimezone: string = Timezone.MY_TIMEZONE
  timestamp: number = Number.MIN_VALUE
  otherTimezones: string[] = []
  configuring: boolean = false
  pickingTimezone: boolean = false
  copyButtonVariant: string = 'info'
  private _mounted: boolean = false
  private _freezeLocationHash = false
  beforeMount () {
    document.title = this.$i18n.t('Time Zone Converter') as string
    this.locationHashChanged()
  }
  mounted () {
    this.updateLocationHash()
    this.$nextTick(() => {
      this._mounted = true
      window.addEventListener('hashchange', () => this.locationHashChanged(), false)
    })
    EventBus.$on('localeChanged', (): void => {
      document.title = this.$i18n.t('Time Zone Converter') as string
      this._freezeLocationHash = true
      const stz = this.sourceTimezone
      const ts = this.timestamp
      const otz = this.otherTimezones
      this.sourceTimezone = 'UTC'
      this.localTimezone = 'UTC'
      this.timestamp++
      this.otherTimezones = []
      this.$nextTick(() : void => {
        this.localTimezone = Timezone.MY_TIMEZONE
        this.sourceTimezone = stz
        this.timestamp = ts
        this.otherTimezones = otz
        this._freezeLocationHash = false
      })
    })
  }
  private locationHashChanged (): void {
    const hashData = LocationHash.fromWindowLocation()
    this.sourceTimezone = hashData.sourceTimezone
    this.timestamp = hashData.timestamp
    this.otherTimezones = hashData.otherTimezones
  }
  private updateLocationHash (): void {
    if (!this._freezeLocationHash) {
      LocationHash.toWindowLocation(new LocationHash.HashData(this.timestamp, this.sourceTimezone, this.otherTimezones))
    }
  }
  @Watch('sourceTimezone')
  onSourceTimezoneChanged (value: string, oldValue: string) {
    if (this._mounted) {
      this.updateLocationHash()
    }
  }
  @Watch('timestamp')
  onTimestampChanged (value: number, oldValue: number) {
    if (this._mounted) {
      this.updateLocationHash()
    }
  }
  public configure (): void {
    this.configuring = true
  }
  public configured (data: Configurer.Result): void {
    this.configuring = false
    this.sourceTimezone = data.timezone
    this.timestamp = data.timestamp
  }
  public pickTimezone () : void {
    this.pickingTimezone = true
  }
  public timezonePicked (timezone: string): void {
    if (this.otherTimezones.indexOf(timezone) >= 0) {
      return
    }
    this.otherTimezones.push(timezone)
    this.updateLocationHash()
  }
  public removeOtherTimezoneAt (otherTimezoneIndex: number): void {
    this.otherTimezones.splice(otherTimezoneIndex, 1)
    this.updateLocationHash()
  }
  public copyUrl () : void {
    copy(window.location.href)
      .then(() => {
        this.copyButtonVariant = 'success'
      })
      .catch((reason: any): void => {
        this.copyButtonVariant = 'danger'
        window.alert(this.$i18n.t('Copy failed: {reason}', { reason: reason ? reason.toString() : this.$i18n.t('unknown reason') }))
      })
      .finally((): void => {
        setTimeout(
          () => {
            this.copyButtonVariant = 'info'
          },
          1500
        )
      })
  }
}
</script>
<style scoped lang="scss">
.add-timezone {
  cursor: pointer;
  .card-body {
    font-size: 500%;
    opacity: 0.5;
    line-height: 200%;
    &:hover {
      opacity: 1;
    }
  }
}

</style>
