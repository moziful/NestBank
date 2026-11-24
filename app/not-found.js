'use client';

import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import { useRole } from './providers';

const overviewPaths = {
    Admin: '/admin/overview',
    'Bank Staff': '/staff/overview',
    Customer: '/overview',
};

export default function NotFound() {
    const { role } = useRole();

    return (
        <main className="grid min-h-full place-items-center bg-surface px-6 py-16 text-primary">
            <section className="w-full max-w-lg">
                <p className="text-sm font-semibold uppercase text-accent">404 · Page not found</p>
                <h1 className="mt-3 text-4xl font-semibold">We can’t find that page.</h1>
                <p className="mt-4 text-base leading-7 opacity-75">
                    The address may be incorrect, or the page may have moved.
                </p>
                <Link
                    href={overviewPaths[role]}
                    className="mt-8 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-surface transition-colors hover:bg-secondary"
                >
                    <FiArrowLeft aria-hidden="true" className="h-4 w-4" />
                    Back to overview
                </Link>
            </section>
        </main>
    );
}
