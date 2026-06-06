import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import { NomiProvider } from './context/NomiContext' // Importa tu provider
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NomiProvider> 
        <App />
      </NomiProvider>
    </BrowserRouter>
  </StrictMode>,
)