import 'react-toastify/dist/ReactToastify.css'

import { useMap, useWebSocket } from '@joebobmiles/y-react'
import { Temporal } from '@js-temporal/polyfill'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import {
  createTimer,
  getRemainingTime,
  loadTimer,
  pauseTimer,
  resumeTimer,
  syncTimer,
} from './utils/time-manager'
import { useForceUpdate } from './utils/use-force-update'
import { useInterval } from './utils/use-interval'

type WebsocketStatus = 'disconnected' | 'connecting' | 'connected'
const STATUS_EMOJIS: Record<WebsocketStatus, string> = {
  disconnected: '🔴',
  connecting: '🟡',
  connected: '🟢',
}

export const App = () => {
  const forceUpdate = useForceUpdate()
  const notify = (status: string) => toast(status, { autoClose: 5000 })

  const timerMap = useMap('timer')
  const wsProvider = useWebSocket('ws://y.shiina.family', 'shiina')
  wsProvider.connect()

  const [status, setStatus] = useState<WebsocketStatus>('disconnected')
  wsProvider.on('status', ({ status }: { status: WebsocketStatus }) => {
    setStatus(status)
    // notify(status)
  })

  const [synced, setIsSynced] = useState<boolean>(false)
  wsProvider.on('synced', () => {
    // if not exist, create timer
    if (Object.entries(timerMap).length === 0) {
      syncTimer(createTimer(), timerMap)
    }

    setIsSynced(true)
    notify('synced')
  })

  switch (status) {
    case 'disconnected':
    case 'connecting': {
      return (
        <>
          <div>
            {STATUS_EMOJIS[status]} {status}
          </div>
        </>
      )
    }
    case 'connected': {
      if (!synced) return <div>syncing...</div>
      return (
        <>
          <div id="timer">
            <div id="timer__title">Timer</div>
            <Timer {...{ timerMap }} />
            <div id="timer__buttons">
              <button
                id="timer__stop"
                onClick={() => {
                  const timer = loadTimer(timerMap)
                  const newTimer = timerMap?.get('isPaused')
                    ? resumeTimer(timer)
                    : pauseTimer(timer)

                  syncTimer(newTimer, timerMap)
                  forceUpdate()
                }}
              >
                {timerMap.get('isPaused') ? '▶️' : '⏸'}
              </button>
              <button
                id="timer__reset"
                onClick={() => {
                  const timer = createTimer()
                  syncTimer(timer, timerMap)
                  forceUpdate()
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </>
      )
    }
  }
}

const Timer = ({
  timerMap,
}: {
  timerMap: ReturnType<typeof useMap>
}): JSX.Element => {
  const [remaining, setRemaining] = useState(
    getRemainingTime(loadTimer(timerMap))
  )

  useInterval(() => {
    if (timerMap.get('isPaused')) return

    setRemaining(getRemainingTime(loadTimer(timerMap)))
  }, 1000)

  useEffect(() => {
    if (remaining.minutes === 0 && remaining.seconds <= 0) {
      console.log('called')
      timerMap.set(
        'currentMode',
        timerMap.get('currentMode') === 'work' ? 'break' : 'work'
      )
      timerMap.set('startedAt', Temporal.Now.instant().toString())
      timerMap.set('pausedAt', Temporal.Now.instant().toString())
      timerMap.set(
        'pausedDuration',
        Temporal.Duration.from({ seconds: 0 }).toString()
      )
      return
    }
  }, [remaining])

  return (
    <div>
      {remaining.minutes}:{remaining.seconds}
    </div>
  )
}
