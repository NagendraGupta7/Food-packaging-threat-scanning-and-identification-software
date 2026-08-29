import { Outlet, useLocation } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  if (isLogin) {
    return (
      <div className="min-h-screen bg-obsidian-canvas text-bone flex flex-col">
        <TopNav />
        <main className="flex-1 w-full mx-auto px-6 py-[40px]">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-bone flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[240px]">
        <TopNav />
        <main className="flex-1 w-full p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
