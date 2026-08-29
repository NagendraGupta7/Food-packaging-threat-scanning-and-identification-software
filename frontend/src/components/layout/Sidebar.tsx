import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, Package, AlertTriangle, FileText, Settings, Users, Shield, Search, BarChart3, Scale } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
    { name: 'Inspections', icon: <ClipboardList className="w-4 h-4" />, path: '/inspections' },
    { name: 'New Inspection', icon: <PlusCircle className="w-4 h-4" />, path: '/inspections/new' },
    { name: 'Products', icon: <Package className="w-4 h-4" />, path: '#' },
    { name: 'Violations', icon: <AlertTriangle className="w-4 h-4" />, path: '#' },
    { name: 'Reports', icon: <FileText className="w-4 h-4" />, path: '#' },
    { name: 'Rules', icon: <Scale className="w-4 h-4" />, path: '#' },
    { name: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '#' },
    { name: 'Search', icon: <Search className="w-4 h-4" />, path: '#' },
  ];

  const adminLinks = [
    { name: 'Users', icon: <Users className="w-4 h-4" />, path: '#' },
    { name: 'Audit Logs', icon: <Shield className="w-4 h-4" />, path: '#' },
    { name: 'Settings', icon: <Settings className="w-4 h-4" />, path: '#' },
  ];

  return (
    <aside className="w-[240px] h-screen bg-[#0d0d0d] border-r border-carbon-lift flex flex-col fixed left-0 top-0 overflow-y-auto hidden md:flex">
      <div className="p-6 flex items-center space-x-3 mb-2">
        <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
           <img src="/logo.png" alt="Golden Bird Logo" className="w-full h-full object-cover scale-[1.7]" />
        </div>
        <h1 className="font-geist text-[16px] text-bone font-bold tracking-tight">Golden Bird</h1>
      </div>

      <div className="flex-1 px-4 py-2 space-y-1">
        {links.map((link, i) => {
          const isActive = location.pathname === link.path || (location.pathname === '/' && link.path === '/dashboard');
          return (
            <Link 
              key={i} 
              to={link.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-[6px] font-geist text-[13px] transition-colors ${
                isActive 
                  ? 'bg-[#3b82f6] text-white font-medium' 
                  : 'text-warm-granite hover:text-bone hover:bg-carbon-lift/50'
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-3">
           <h3 className="font-geist-mono text-[10px] uppercase text-pale-stone tracking-wider">Administration</h3>
        </div>

        {adminLinks.map((link, i) => (
            <Link 
              key={i} 
              to={link.path}
              className="flex items-center space-x-3 px-3 py-2 rounded-[6px] font-geist text-[13px] text-warm-granite hover:text-bone hover:bg-carbon-lift/50 transition-colors"
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
        ))}
      </div>
    </aside>
  );
}
