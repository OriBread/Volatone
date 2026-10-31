import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Gallery } from './dev/Gallery'

import App from './App'
import './index.css'

const showGallery = import.meta.env.DEV && new URLSearchParams(location.search).has('gallery')
createRoot(document.getElementById('root')!).render(
  <StrictMode>{showGallery ? <Gallery /> : <App />}</StrictMode>,
)
