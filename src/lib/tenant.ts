import { prisma } from "./prisma";

/** Estados exactos de participante (no inventar otros en UI). */
export const PARTICIPANT_STATUSES = [
  "pendiente",
  "al_dia",
  "mora",
  "baja",
] as const;
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export const CUOTA_PAYMENT_STATUSES = ["abierta", "pagada", "vencida"] as const;
export type CuotaPaymentStatus = (typeof CUOTA_PAYMENT_STATUSES)[number];

export const MP_LINK_STATUSES = ["pendiente", "ok", "expirada"] as const;
export type MpLinkStatus = (typeof MP_LINK_STATUSES)[number];

/**
 * Patrón multi-tenant: TODA consulta de negocio debe filtrar por tenantId.
 * Nunca listar participants/campaigns/cuotas sin scope de cuartel.
 */
export function tenantScope(tenantId: string) {
  return {
    async getTenant() {
      return prisma.tenant.findUnique({ where: { id: tenantId } });
    },

    async listCampaigns() {
      return prisma.campaign.findMany({
        where: { tenantId },
        orderBy: [{ year: "desc" }, { period: "asc" }],
      });
    },

    async listParticipants(campaignId?: string) {
      return prisma.participant.findMany({
        where: {
          tenantId,
          ...(campaignId ? { campaignId } : {}),
        },
        orderBy: { fullName: "asc" },
        include: { cuotas: true },
      });
    },

    async listCuotas(campaignId: string) {
      // Cuotas vía campaign del mismo tenant (doble check)
      return prisma.cuota.findMany({
        where: {
          campaignId,
          campaign: { tenantId },
        },
        include: { participant: true },
        orderBy: [{ period: "asc" }],
      });
    },

    async createParticipant(data: {
      campaignId: string;
      fullName: string;
      email?: string;
      phone?: string;
      dni?: string;
      status?: ParticipantStatus;
    }) {
      // Garantiza que la campaña pertenece al tenant
      const campaign = await prisma.campaign.findFirst({
        where: { id: data.campaignId, tenantId },
      });
      if (!campaign) {
        throw new Error("Campaña no encontrada para este cuartel");
      }
      return prisma.participant.create({
        data: {
          tenantId,
          campaignId: data.campaignId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          dni: data.dni,
          status: data.status ?? "pendiente",
        },
      });
    },
  };
}

export async function findTenantBySlug(slug: string) {
  return prisma.tenant.findUnique({ where: { slug } });
}
