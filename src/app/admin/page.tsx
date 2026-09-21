import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [tenants, campaigns, participants] = await Promise.all([
    prisma.tenant.count(),
    prisma.campaign.count(),
    prisma.participant.count(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Panel admin (scaffold)</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Resumen global — en producción cada usuario CD ve solo su cuartel.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Cuarteles" value={tenants} href="/admin/tenants" />
        <StatCard label="Campañas" value={campaigns} href="/admin/campaigns" />
        <StatCard
          label="Abonados"
          value={participants}
          href="/admin/participants"
        />
      </div>
      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Sin pagos en vivo.</strong> Los campos MP son placeholders.
        Ver README → TODOs (OAuth Marketplace, webhooks, WhatsApp).
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-red-300"
    >
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
