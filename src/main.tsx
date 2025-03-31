import { createRoot } from 'react-dom/client'
import '@app/styles/index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <App />,
)
