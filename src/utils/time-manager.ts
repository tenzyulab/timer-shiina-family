import { Temporal } from '@js-temporal/polyfill'
// Documentation: https://tc39.es/proposal-temporal/docs/index.html

export type Timer = {
  workDuration: Temporal.Duration // in seconds
  breakDuration: Temporal.Duration // in seconds
  currentMode: 'work' | 'break'

  startedAt: Temporal.Instant

  isPaused: boolean
  pausedAt: Temporal.Instant
  pausedDuration: Temporal.Duration // in seconds
}

export const createTimer = (): Timer => {
  return {
    startedAt: Temporal.Now.instant(),
    pausedAt: Temporal.Now.instant(),
    isPaused: true,

    currentMode: 'work',

    workDuration: Temporal.Duration.from({ seconds: 10 }),
    breakDuration: Temporal.Duration.from({ seconds: 5 }),
    pausedDuration: Temporal.Duration.from({ seconds: 0 }),
  }
}

export const changeTimerMode = (timer: Timer): Timer => {
  return {
    ...timer,
    currentMode: timer.currentMode === 'work' ? 'break' : 'work',
    startedAt: Temporal.Now.instant(),
    pausedAt: Temporal.Now.instant(),
    pausedDuration: Temporal.Duration.from({ seconds: 0 }),
  }
}

export const pauseTimer = (timer: Timer): Timer => {
  return timer.isPaused
    ? timer
    : {
        ...timer,
        isPaused: true,
        pausedAt: Temporal.Now.instant(),
      }
}

export const resumeTimer = (timer: Timer): Timer => {
  return !timer.isPaused
    ? timer
    : {
        ...timer,
        isPaused: false,
        pausedDuration: timer.pausedDuration.add(
          Temporal.Now.instant().since(timer.pausedAt)
        ),
      }
}

export const getRemainingTime = (timer: Timer): Temporal.Duration => {
  const now = timer.isPaused ? timer.pausedAt : Temporal.Now.instant()

  const elapsed = now.since(timer.startedAt).subtract(timer.pausedDuration)
  const duration =
    timer.currentMode === 'work' ? timer.workDuration : timer.breakDuration

  return duration.subtract(elapsed).add({ milliseconds: 10 })
}

export const syncTimer = (
  timer: Timer,
  y: { set: (name: string, value: unknown) => void }
): void => {
  y.set('workDuration', timer.workDuration.toString())
  y.set('breakDuration', timer.breakDuration.toString())
  y.set('currentMode', timer.currentMode)
  y.set('startedAt', timer.startedAt.toString())
  y.set('isPaused', timer.isPaused)
  y.set('pausedAt', timer.pausedAt.toString())
  y.set('pausedDuration', timer.pausedDuration.toString())
}

export const loadTimer = (y: { get: (name: string) => unknown }): Timer => {
  return {
    workDuration: Temporal.Duration.from(y.get('workDuration') as string),
    breakDuration: Temporal.Duration.from(y.get('breakDuration') as string),
    currentMode: y.get('currentMode') as 'work' | 'break',
    startedAt: Temporal.Instant.from(y.get('startedAt') as string),
    isPaused: y.get('isPaused') as boolean,
    pausedAt: Temporal.Instant.from(y.get('pausedAt') as string),
    pausedDuration: Temporal.Duration.from(y.get('pausedDuration') as string),
  }
}
