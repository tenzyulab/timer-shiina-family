import { useEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/ban-types
export const useInterval = (callback: Function, delay: number) => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const callbackRef = useRef<Function>()

  useEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    if (!delay) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return () => {}
    }

    const interval = setInterval(() => {
      callbackRef.current && callbackRef.current()
    }, delay)
    return () => clearInterval(interval)
  }, [delay])
}
