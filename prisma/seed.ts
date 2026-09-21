import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "bv-demo" },
    update: {},
    create: {
      name: "Bomberos Voluntarios Demo",
      slug: "bv-demo",
      cuit: "30-00000000-0",
      status: "activo",
      linkStatus: "pendiente",
      marketplaceFee: 0.06,
      mpAccessTokenStub: "STUB_NO_SECRET",
      mpRefreshTokenStub: "STUB_NO_SECRET",
    },
  });

  const campaign = await prisma.campaign.upsert({
    where: {
      tenantId_year_period: {
        tenantId: tenant.id,
        year: 2026,
        period: "Bono Anual 2026",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      year: 2026,
      period: "Bono Anual 2026",
      premio: "Orden de compra demo — stub",
      status: "activa",
    },
  });

  console.log("Seed OK:", { tenant: tenant.slug, campaign: campaign.period });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
