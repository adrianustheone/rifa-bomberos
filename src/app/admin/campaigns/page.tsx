import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function createCampaign(formData: FormData) {
  "use server";
  const tenantId = String(formData.get("tenantId") || "");
  const year = Number(formData.get("year") || new Date().getFullYear());
  const period = String(formData.get("period") || "").trim();
  const premio = String(formData.get("premio") || "").trim() || null;
  if (!tenantId || !period) throw new Error("tenant y período requeridos");
  await prisma.campaign.create({
    data: {
      tenantId,
      year,
      period,
      premio,
      status: "borrador",
    },
  });
  redirect("/admin/campaigns");
}

export default async function CampaignsPage() {
  const [campaigns, tenants] = await Promise.all([
    prisma.campaign.findMany({
      orderBy: [{ year: "desc" }, { period: "asc" }],
      include: { tenant: true, _count: { select: { participants: true } } },
    }),
    prisma.tenant.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Campañas</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Campaña anual por cuartel (año + período + premio / orden de compra).
      </p>

      <form
        action={createCampaign}
        className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2"
      >
        <label className="text-sm sm:col-span-2">
          <span className="font-medium">Cuartel</span>
          <select
            name="tenantId"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Año</span>
          <input
            type="number"
            name="year"
            defaultValue={2026}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Período</span>
          <input
            name="period"
            required
            placeholder="Bono Anual 2026"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="font-medium">Premio (orden de compra)</span>
          <input
            name="premio"
            placeholder="Ej. orden de compra $X en comercio local"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 sm:col-span-2 sm:w-fit"
          disabled={tenants.length === 0}
        >
          Crear campaña
        </button>
        {tenants.length === 0 && (
          <p className="text-sm text-amber-700 sm:col-span-2">
            Primero{" "}
            <Link href="/admin/tenants/nuevo" className="underline">
              creá un cuartel
            </Link>
            .
          </p>
        )}
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-zinc-50 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Cuartel</th>
              <th className="px-4 py-3">Año</th>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Premio</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Abonados</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  Sin campañas.
                </td>
              </tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-3">{c.tenant.name}</td>
                <td className="px-4 py-3">{c.year}</td>
                <td className="px-4 py-3">{c.period}</td>
                <td className="px-4 py-3 max-w-xs truncate">{c.premio ?? "—"}</td>
                <td className="px-4 py-3">{c.status}</td>
                <td className="px-4 py-3">{c._count.participants}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
