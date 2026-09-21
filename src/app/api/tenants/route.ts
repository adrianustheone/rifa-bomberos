import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Lista tenants (admin scaffold). Sin auth aún — TODO. */
export async function GET() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      cuit: true,
      status: true,
      linkStatus: true,
      marketplaceFee: true,
      // Nunca exponer stubs de token en APIs públicas reales
    },
  });
  return NextResponse.json({ tenants });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name || "").trim();
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  if (!name || !slug) {
    return NextResponse.json({ error: "name y slug requeridos" }, { status: 400 });
  }
  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      cuit: body.cuit ?? null,
      status: "activo",
      linkStatus: "pendiente",
      marketplaceFee: body.marketplaceFee ?? 0.06,
      mpAccessTokenStub: "STUB_NO_SECRET",
      mpRefreshTokenStub: "STUB_NO_SECRET",
    },
  });
  return NextResponse.json({ tenant }, { status: 201 });
}
