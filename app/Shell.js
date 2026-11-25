'use client';

import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';
import SideNav from './components/SideNav';

function ShellInner({ children }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return (
      <>
        <Navbar />
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
      </>
    );
  }

  return (
    <>
      <Navbar
        menuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen((open) => !open)}
      />
      <div className="flex flex-1 min-h-0">
        <SideNav open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">{children}</main>
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
            <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </>
      }
    >
      <ShellInner>{children}</ShellInner>
    </Suspense>
  );
}
