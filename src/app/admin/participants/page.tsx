import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { tenantScope, PARTICIPANT_STATUSES } from "@/lib/tenant";

export const dynamic = "force-dynamic";

async function createParticipant(formData: FormData) {
  "use server";
  const tenantId = String(formData.get("tenantId") || "");
  const campaignId = String(formData.get("campaignId") || "");
  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim() || undefined;
  const phone = String(formData.get("phone") || "").trim() || undefined;
  if (!tenantId || !campaignId || !fullName) {
    throw new Error("Datos incompletos");
  }
  const scope = tenantScope(tenantId);
  const participant = await scope.createParticipant({
    campaignId,
    fullName,
    email,
    phone,
    status: "pendiente",
  });

  // Stub: generar 9 cuotas abiertas (sin cobro real)
  const year = new Date().getFullYear();
  const amount = Number(formData.get("cuotaAmount") || 5000);
  await prisma.cuota.createMany({
    data: Array.from({ length: 9 }, (_, i) => {
      const month = i + 1;
      return {
        participantId: participant.id,
        campaignId,
        period: `${year}-${String(month).padStart(2, "0")}`,
        month,
        amount,
        paymentStatus: "abierta" as const,
      };
    }),
  });

  redirect("/admin/participants");
}

export default async function ParticipantsPage() {
  const [participants, tenants, campaigns] = await Promise.all([
    prisma.participant.findMany({
      orderBy: { fullName: "asc" },
      include: {
        tenant: true,
        campaign: true,
        cuotas: { orderBy: { month: "asc" } },
      },
      take: 100,
    }),
    prisma.tenant.findMany({ orderBy: { name: "asc" } }),
    prisma.campaign.findMany({
      orderBy: [{ year: "desc" }],
      include: { tenant: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Abonados y cuotas (stub)</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Estados exactos:{" "}
        {PARTICIPANT_STATUSES.map((s) => (
          <code key={s} className="mr-1 rounded bg-zinc-100 px-1 text-xs">
            {s}
          </code>
        ))}
        . Consultas vía <code className="text-xs">tenantScope(tenantId)</code>.
      </p>

      <form
        action={createParticipant}
        className="mt-6 grid gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:grid-cols-2"
      >
        <label className="text-sm">
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
          <span className="font-medium">Campaña</span>
          <select
            name="campaignId"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            defaultValue=""
          >
            <option value="" disabled>
              Seleccionar…
            </option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tenant.name} — {c.period} ({c.year})
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="font-medium">Nombre completo</span>
          <input
            name="fullName"
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Teléfono / WhatsApp</span>
          <input
            name="phone"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Monto cuota (ARS stub)</span>
          <input
            name="cuotaAmount"
            type="number"
            defaultValue={5000}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 sm:self-end"
        >
          Alta abonado + 9 cuotas abiertas
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {participants.length === 0 && (
          <p className="text-sm text-zinc-500">
            Sin abonados.{" "}
            <Link href="/admin/campaigns" className="underline">
              Creá una campaña
            </Link>{" "}
            primero si hace falta.
          </p>
        )}
        {participants.map((p) => {
          const pagadas = p.cuotas.filter((c) => c.paymentStatus === "pagada").length;
          const abiertas = p.cuotas.filter((c) => c.paymentStatus === "abierta").length;
          const vencidas = p.cuotas.filter((c) => c.paymentStatus === "vencida").length;
          return (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.fullName}</p>
                  <p className="text-xs text-zinc-500">
                    {p.tenant.name} · {p.campaign.period} ·{" "}
                    <span className="font-mono">{p.status}</span>
                  </p>
                </div>
                <p className="text-xs text-zinc-600">
                  Cuotas: {pagadas} pagadas / {abiertas} abiertas / {vencidas}{" "}
                  vencidas
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.cuotas.map((c) => (
                  <span
                    key={c.id}
                    title={`${c.period} · $${c.amount}`}
                    className={`rounded px-2 py-0.5 text-xs ${
                      c.paymentStatus === "pagada"
                        ? "bg-green-100 text-green-800"
                        : c.paymentStatus === "vencida"
                          ? "bg-red-100 text-red-800"
                          : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {c.month}:{c.paymentStatus}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
