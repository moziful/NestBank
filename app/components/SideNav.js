import Link from 'next/link';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Accounts', href: '/accounts' },
  { label: 'Transactions', href: '/transactions' },
  { label: 'Settings', href: '/settings' },
];

export default function SideNav() {
  return (
    <nav className="h-full w-56 shrink-0 overflow-y-auto bg-zinc-950 px-4 py-8 text-white">
      <ul className="m-0 list-none p-0">
        {navItems.map((item) => (
          <li key={item.href} className="mb-6">
            <Link
              href={item.href}
              className="text-base text-zinc-100 no-underline transition-colors hover:text-emerald-400"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
