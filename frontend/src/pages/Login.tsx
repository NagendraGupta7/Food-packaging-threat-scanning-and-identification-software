import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal } from 'lucide-react';
import axios from 'axios';

import { API_ORIGIN as API_BASE } from '../config';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        localStorage.setItem('userEmail', res.data.user?.email ?? email);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Incorrect email or password.');
      } else {
        setError('Could not sign in. Is the backend running?');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-[400px] space-y-[32px]">
        
        {/* Logo / Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-carbon-lift rounded-[3px] border border-ash-stroke flex items-center justify-center text-bone">
              <Terminal className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="font-geist text-[24px] text-bone tracking-tight">Compliance Factory</h1>
            <p className="font-geist text-[14px] text-warm-granite mt-1">Sign in to the terminal</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-[#0d0d0d] border border-carbon-lift p-[24px] rounded-[10px] space-y-6">
          <div>
            <label className="block font-geist-mono text-[12px] uppercase text-pale-stone mb-2">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-obsidian-canvas border border-carbon-lift text-bone p-3 rounded-[3px] focus:outline-none focus:border-ash-stroke font-geist text-[14px]"
              placeholder="inspector@factory.local"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="block font-geist-mono text-[12px] uppercase text-pale-stone">Password</label>
              <a href="#" className="font-geist text-[12px] text-warm-granite hover:text-bone">Forgot?</a>
            </div>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-obsidian-canvas border border-carbon-lift text-bone p-3 rounded-[3px] focus:outline-none focus:border-ash-stroke font-geist text-[14px]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-signal-orange/10 border border-signal-orange/40 text-signal-orange text-[13px] font-geist px-3 py-2 rounded-[3px]">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-chalk text-obsidian-canvas font-geist text-[14px] px-6 py-3 rounded-[3px] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center font-geist text-[12px] text-warm-granite">
           New setup? A default admin account is seeded on first backend start — see README.
        </div>
      </div>
    </div>
  );
}
