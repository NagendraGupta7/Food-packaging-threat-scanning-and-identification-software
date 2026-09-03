import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

export default function TopNav() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('userEmail') || '') : '';
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    delete axios.defaults.headers.common['Authorization'];
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[64px] flex items-center justify-between px-6 bg-obsidian-canvas/90 backdrop-blur-sm border-b border-ash-stroke">
      <div className="flex items-center space-x-12">
        {!isLoggedIn && (
           <Link to="/" className="font-geist-mono text-[12px] uppercase text-bone tracking-widest font-bold">
             COMPLIANCE FACTORY
           </Link>
        )}
      </div>
      <div className="flex items-center space-x-6">
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="bg-chalk text-obsidian-canvas text-[14px] font-normal px-4 py-2 rounded-[3px] hover:opacity-90 transition-opacity">
              Log In
            </Link>
          </>
        ) : (
          <div className="relative">
            <div 
               onClick={() => setDropdownOpen(!dropdownOpen)}
               className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="font-geist text-[14px] text-bone hidden md:block">
                {userEmail ? userEmail.split('@')[0] : 'Inspector'}
              </div>
              <div className="w-10 h-10 rounded-full bg-carbon-lift border-2 border-ash-stroke flex items-center justify-center overflow-hidden group-hover:border-bone transition-colors">
                 <User className="w-5 h-5 text-warm-granite group-hover:text-bone transition-colors" />
              </div>
            </div>
            
            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-obsidian-canvas border border-carbon-lift rounded-[6px] shadow-2xl py-2 z-50 flex flex-col">
                 <div className="px-4 py-2 border-b border-carbon-lift mb-1">
                   <p className="font-geist text-[12px] text-warm-granite uppercase">Signed in as</p>
                   <p className="font-geist text-[14px] text-bone truncate">{userEmail || 'Unknown'}</p>
                 </div>
                 <button onClick={() => setDropdownOpen(false)} className="px-4 py-2 text-left font-geist text-[14px] text-bone hover:bg-carbon-lift transition-colors">
                    Profile Settings
                 </button>
                 <button onClick={() => setDropdownOpen(false)} className="px-4 py-2 text-left font-geist text-[14px] text-bone hover:bg-carbon-lift transition-colors">
                    API Keys
                 </button>
                 <div className="border-t border-carbon-lift mt-1 pt-1">
                   <button onClick={handleLogout} className="w-full px-4 py-2 text-left font-geist text-[14px] text-signal-orange hover:bg-carbon-lift transition-colors flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                   </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
