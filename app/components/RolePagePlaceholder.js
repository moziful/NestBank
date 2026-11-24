export default function RolePagePlaceholder({ role, title }) {
    return (
        <section className="min-h-full bg-surface px-6 py-10 text-primary sm:px-10">
            <p className="text-sm font-semibold uppercase text-accent">{role} workspace</p>
            <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 opacity-75">
                This page is ready for its role-specific content and backend data.
            </p>
        </section>
    );
}
