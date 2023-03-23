import './normalize.css'

import { DocumentProvider } from '@joebobmiles/y-react'
import { toTemporalInstant } from '@js-temporal/polyfill'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'

import { App } from './App'

Object.assign(Date.prototype, { toTemporalInstant }) // polyfill hack

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ToastContainer />
    <DocumentProvider>
      <App />
    </DocumentProvider>
  </React.StrictMode>
)
