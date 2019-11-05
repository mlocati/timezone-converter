<template>
  <div id="app">
    <TopBar />
    <div class="container-fluid mt-3">
      <b-card-group deck>
        <DateTimeViewer
          title="Source time zone"
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
              Change
            </b-button>
          </template>
        </DateTimeViewer>
        <DateTimeViewer
          title="Your time zone"
          :timezone="localTimezone"
          :timestamp="timestamp"
        />
        <DateTimeViewer
          v-for="(otherTimezone, otherTimezoneIndex) in otherTimezones"
          :key="otherTimezone + '@' + otherTimezoneIndex"
          title="Custom time zone"
          :timezone="otherTimezone"
          :timestamp="timestamp"
        >
          <template v-slot:action>
            <b-button
              size="sm"
              class="my-2 my-sm-0"
              variant="danger"
              @click.prevent="otherTimezones.splice(otherTimezoneIndex, 1)"
            >
              <font-awesome-icon icon="trash-alt" />
              Remove
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
  timestamp: number = Number.MIN_VALUE
  otherTimezones: string[] = []
  configuring: boolean = false
  pickingTimezone: boolean = false
  private _mounted: boolean = false
  beforeMount () {
    this.locationHashChanged()
  }
  mounted () {
    this.updateLocationHash()
    this.$nextTick(() => {
      this._mounted = true
      window.addEventListener('hashchange', () => this.locationHashChanged(), false)
    })
  }
  private locationHashChanged (): void {
    const hashData = LocationHash.fromWindowLocation()
    this.sourceTimezone = hashData.sourceTimezone
    this.timestamp = hashData.timestamp
    this.otherTimezones = hashData.otherTimezones
  }
  private updateLocationHash (): void {
    LocationHash.toWindowLocation(new LocationHash.HashData(this.timestamp, this.sourceTimezone, this.otherTimezones))
  }
  get localTimezone () {
    return Timezone.MY_TIMEZONE
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
  public timezonePicked (timezone: string) :void {
    if (this.otherTimezones.indexOf(timezone) >= 0) {
      return
    }
    this.otherTimezones.push(timezone)
    this.updateLocationHash()
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
