// Base URL of the backend API. In production, set VITE_API_BASE as a build-time
// environment variable (e.g. in your hosting provider's dashboard) to point at
// your deployed backend, such as https://your-backend.onrender.com.
// Falls back to localhost for local development, so `npm run dev` works with
// no extra setup.
export const API_ORIGIN: string = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
export const API_BASE: string = `${API_ORIGIN}/api`;
