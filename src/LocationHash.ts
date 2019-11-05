import moment from 'moment-timezone'

const CHUNK_SEPARATOR: string = '|'
const KEYVALUE_SEPARATOR: string = ':'
const CHUNK_SOURCETIMEZONE: string = 'stz'
const CHUNK_TIMESTAMP: string = 'ts'
const CHUNK_OTHERTIMEZONE: string = 'otz'

export class HashData {
  public timestamp: number
  public sourceTimezone: string
  public readonly otherTimezones: string[] = []
  constructor (timestamp?: number, sourceTimezone?: string, otherTimezones?: string[]) {
    if (timestamp === undefined) {
      this.timestamp = Math.round(Date.now() / 1000)
    } else {
      this.timestamp = timestamp
    }
    this.sourceTimezone = ''
    if (sourceTimezone === undefined || sourceTimezone === '') {
      this.sourceTimezone = moment.tz.guess()
    } else {
      this.sourceTimezone = sourceTimezone
    }
    if (otherTimezones !== undefined) {
      this.otherTimezones = (<string[]>[]).concat(otherTimezones)
    }
  }
}

function fromLocationHash (hash: string): HashData {
  const hashData: HashData = new HashData()
  hash.split(CHUNK_SEPARATOR).forEach((chunk: string) => {
    if (chunk.length === 0) {
      return
    }
    let keyValueSeparatorPosition: number = chunk.indexOf(KEYVALUE_SEPARATOR)
    let key: string = keyValueSeparatorPosition < 0 ? chunk : chunk.substr(0, keyValueSeparatorPosition)
    let value: string | null = keyValueSeparatorPosition < 0 ? null : chunk.substr(keyValueSeparatorPosition + 1)
    switch (key) {
      case CHUNK_TIMESTAMP:
        if (value === null || value === '') {
          console.warn(`Missing timestamp value`)
        } else if (!value.match(/^-?\d+$/)) {
          console.warn(`Invalid timestamp value: ${value}`)
        } else {
          hashData.timestamp = parseInt(value, 10)
        }
        break
      case CHUNK_SOURCETIMEZONE:
        if (value === null && value === '') {
          console.warn(`Missing source timezone value`)
        } else {
          let sourceTimezone: string|null|undefined
          try {
            sourceTimezone = moment.tz(<string>value).tz()
          } catch {
          }
          if (typeof sourceTimezone !== 'string' || sourceTimezone === '') {
            console.warn(`Invalid source timezone value: ${value}`)
          } else {
            hashData.sourceTimezone = sourceTimezone
          }
        }
        break
      case CHUNK_OTHERTIMEZONE:
        if (value === null && value === '') {
          console.warn(`Missing other timezone value`)
        } else {
          let otherTimezone: string|null|undefined
          try {
            otherTimezone = moment.tz(<string>value).tz()
          } catch {
          }
          if (typeof otherTimezone !== 'string' || otherTimezone === '') {
            console.warn(`Invalid other timezone value: ${value}`)
          } else if (hashData.otherTimezones.indexOf(otherTimezone) >= 0) {
            console.warn(`Duplicated other timezone value: ${value}`)
          } else {
            hashData.otherTimezones.push(otherTimezone)
          }
        }
        break
      default:
        console.warn(`Unsupported chunk URL hash: ${key}`)
        break
    }
  })
  return hashData
}

function toHash (hashData: HashData): string {
  let chunks: string[] = []
  chunks.push(CHUNK_SOURCETIMEZONE + KEYVALUE_SEPARATOR + hashData.sourceTimezone)
  chunks.push(CHUNK_TIMESTAMP + KEYVALUE_SEPARATOR + hashData.timestamp.toString())
  hashData.otherTimezones.forEach((otherTimezone: string) : void => {
    chunks.push(CHUNK_OTHERTIMEZONE + KEYVALUE_SEPARATOR + otherTimezone)
  })
  return chunks.join(CHUNK_SEPARATOR)
}

export function fromWindowLocation (win: Window = window): HashData {
  let hash: string = decodeURIComponent(win.location.hash.replace(/^#/, ''))
  return fromLocationHash(hash)
}

export function toWindowLocation (hasdData: HashData, win: Window = window): void {
  let hash: string = toHash(hasdData)
  if (hash.length === 0) {
    try {
      win.history.replaceState(null, '', ' ')
    } catch (e) {
      let x = win.document.body.scrollLeft
      let y = win.document.body.scrollTop
      win.location.hash = hash
      win.document.body.scrollLeft = x
      win.document.body.scrollTop = y
    }
  } else {
    win.location.hash = hash
  }
}
