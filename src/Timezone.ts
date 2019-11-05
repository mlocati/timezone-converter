import moment from 'moment-timezone'

function toDisplayName (name: string): string {
  return name.replace(/_/g, ' ').replace(/\//g, ' - ')
}

export class Timezone {
  readonly id: string
  readonly displayName: string
  readonly group: string
  readonly locality: string
  constructor (id: string) {
    this.id = id
    this.displayName = toDisplayName(id)
    const p = id.indexOf('/')
    if (p < 0) {
      this.group = ''
      this.locality = this.displayName
    } else {
      this.group = toDisplayName(id.substr(0, p))
      this.locality = toDisplayName(id.substr(p + 1))
    }
  }
}

const map : { [id: string] : Timezone} = {}

export const all: Timezone[] = []
export const groups: string[] = []
export const timezonesForGroup: { [group: string] : Timezone[]} = {}

const ids: string[] = moment.tz.names()
ids.sort()
ids.forEach((id) => {
  const timezone = new Timezone(id)
  map[id] = timezone
  all.push(timezone)
  if (groups.indexOf(timezone.group) < 0) {
    groups.push(timezone.group)
    timezonesForGroup[timezone.group] = []
  }
  timezonesForGroup[timezone.group].push(timezone)
})

export function isValid (timezone: any): boolean {
  return typeof timezone === 'string' && timezone !== '' && map.hasOwnProperty(timezone)
}

export function getByID (timezone: any): Timezone|null {
  return isValid(timezone) ? map[timezone] : null
}

export const MY_TIMEZONE: string = moment.tz.guess()
