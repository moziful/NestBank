'use client';

import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';

export default function Shell({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <>
        <Navbar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <SideNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
