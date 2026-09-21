import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { campaigns: true, participants: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Cuarteles (tenants)</h1>
        <Link
          href="/admin/tenants/nuevo"
          className="rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Nuevo cuartel
        </Link>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Cada tenant es una asociación / cuartel. Campos MP = stubs.
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">CUIT</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">MP link</th>
              <th className="px-4 py-3">Campañas</th>
              <th className="px-4 py-3">Abonados</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  Sin cuarteles. Creá el primero para el piloto.
                </td>
              </tr>
            )}
            {tenants.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{t.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{t.slug}</td>
                <td className="px-4 py-3">{t.cuit ?? "—"}</td>
                <td className="px-4 py-3">{t.status}</td>
                <td className="px-4 py-3">{t.linkStatus}</td>
                <td className="px-4 py-3">{t._count.campaigns}</td>
                <td className="px-4 py-3">{t._count.participants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
