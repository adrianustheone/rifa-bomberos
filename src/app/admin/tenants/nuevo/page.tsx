import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function createTenant(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const slug = String(formData.get("slug") || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  const cuit = String(formData.get("cuit") || "").trim() || null;
  if (!name || !slug) {
    throw new Error("Nombre y slug son obligatorios");
  }
  await prisma.tenant.create({
    data: {
      name,
      slug,
      cuit,
      status: "activo",
      linkStatus: "pendiente",
      marketplaceFee: 0.06,
      // Stubs — nunca tokens reales
      mpSellerId: null,
      mpAccessTokenStub: "STUB_NO_SECRET",
      mpRefreshTokenStub: "STUB_NO_SECRET",
    },
  });
  redirect("/admin/tenants");
}

export default function NuevoTenantPage() {
  return (
    <div className="max-w-lg">
      <Link href="/admin/tenants" className="text-sm text-zinc-500 hover:underline">
        ← Volver
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Nuevo cuartel</h1>
      <form action={createTenant} className="mt-6 space-y-4">
        <Field label="Nombre" name="name" required placeholder="Bomberos Vol. Ejemplo" />
        <Field
          label="Slug (URL)"
          name="slug"
          required
          placeholder="bv-ejemplo"
        />
        <Field label="CUIT (opcional)" name="cuit" placeholder="30-XXXXXXXX-X" />
        <button
          type="submit"
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
        >
          Crear
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
      />
    </label>
  );
}
