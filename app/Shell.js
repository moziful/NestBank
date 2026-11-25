'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';

function ShellInner({ children }) {
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

export default function Shell({ children }) {
  return (
    <Suspense
      fallback={
        <>
          <header className="z-40 shrink-0 bg-primary min-h-16 shadow-sm border-b border-surface/20" />
          <div className="flex flex-1 min-h-0">
            <main className="flex-1 overflow-y-auto">{children}</main>
          </div>
        </>
      }
    >
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}
