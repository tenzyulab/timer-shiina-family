import { Temporal } from '@js-temporal/polyfill'
import type { DependencyList } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

type IntervalVVV = {
  adjust: (timeoutBase?: Temporal.Instant) => void
}

export const useInterval = (
  callback: () => void,
  interval: Temporal.Duration,
  deps: DependencyList = []
): IntervalVVV => {
  const timeoutIdRef = useRef(0)
  const [timeoutBase, setTimeoutBase] = useState(() => Temporal.Now.instant())

  useEffect(() => {
    function scheduleTimeout() {
      const now = Temporal.Now.instant()
      const timeoutMs = interval
        .subtract(timeoutBase.until(now))
        .round({ largestUnit: 'millisecond' }).milliseconds

      setTimeout(() => {
        callback()
        scheduleTimeout()
      }, timeoutMs)
    }

    scheduleTimeout()

    return () => clearTimeout(timeoutIdRef.current)
  }, [callback, interval, timeoutBase, ...deps])

  return {
    adjust: useCallback((timeoutBase) => {
      setTimeoutBase(timeoutBase ?? Temporal.Now.instant())
    }, []),
  }
}
