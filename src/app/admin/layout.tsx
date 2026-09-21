import Link from "next/link";

const nav = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/tenants", label: "Cuarteles" },
  { href: "/admin/campaigns", label: "Campañas" },
  { href: "/admin/participants", label: "Abonados / Cuotas" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-6 py-3">
          <Link href="/" className="font-semibold text-red-800">
            Rifa Bomberos
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-zinc-600 hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
