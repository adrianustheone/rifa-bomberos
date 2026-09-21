import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-red-700">
        Pandaworks · Scaffold
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        Bono digital — Bomberos voluntarios
      </h1>
      <p className="mt-4 text-zinc-600">
        Plataforma multi-tenant (un cuartel = un tenant) para campañas anuales
        de bono/rifa: cuotas, estados de abonado y placeholders de Mercado Pago
        Marketplace. Sin cobros en vivo en este scaffold.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Ir al admin
        </Link>
        <Link
          href="/admin/tenants"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-100"
        >
          Cuarteles (tenants)
        </Link>
      </div>
      <ul className="mt-10 list-disc space-y-1 pl-5 text-sm text-zinc-600">
        <li>Next.js App Router + TypeScript + Prisma + SQLite + Tailwind</li>
        <li>Consultas siempre con <code className="text-xs">tenantId</code></li>
        <li>TODO: OAuth MP por cuartel, webhooks, WhatsApp</li>
      </ul>
    </main>
  );
}
