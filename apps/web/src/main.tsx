import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { installStaleChunkReload } from './lib/staleChunk'
import { installEnterToNext } from './lib/enterToNext'

installStaleChunkReload()
installEnterToNext()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
