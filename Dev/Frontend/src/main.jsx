import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './app/App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <ToastContainer position="top-right" autoClose={4000} closeOnClick pauseOnHover />
  </BrowserRouter>,
)
