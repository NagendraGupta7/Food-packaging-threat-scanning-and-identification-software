import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

// Attach the stored auth token (if any) to every future request via axios
// defaults, rather than mutating per-request config.headers. This is the
// safe pattern — mutating config.headers in a request interceptor can
// interfere with axios's automatic multipart/form-data boundary header
// when uploading FormData (e.g. image uploads), causing those requests to
// silently fail.
const storedToken = localStorage.getItem('token');
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

// If the token is missing/expired, the API returns 401 — bounce to login.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      delete axios.defaults.headers.common['Authorization'];
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
