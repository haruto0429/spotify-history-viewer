import { format, isValid } from 'date-fns'

export const formatHoursAndMinutes = (ms: number): string => {
  if (!ms || ms <= 0) {
    return '0分'
  }

  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) {
    return `${minutes}分`
  }

  return `${hours}時間${minutes.toString().padStart(2, '0')}分`
}

export const formatMinutesAndSeconds = (ms: number): string => {
  if (!ms || ms <= 0) {
    return '0秒'
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes <= 0) {
    return `${seconds}秒`
  }

  return `${minutes}分${seconds.toString().padStart(2, '0')}秒`
}

export const formatDateRange = (start: Date, end: Date): string => {
  if (!isValid(start) || !isValid(end)) {
    return 'データなし'
  }

  const startLabel = format(start, 'yyyy/MM/dd')
  const endLabel = format(end, 'yyyy/MM/dd')

  if (startLabel === endLabel) {
    return startLabel
  }

  return `${startLabel} 〜 ${endLabel}`
}


