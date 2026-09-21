import type { ParticipantStatus } from "./tenant";

/**
 * Transiciones de estado del participante (referencia de producto).
 * pendiente → al_dia (primera cuota pagada / alta confirmada)
 * al_dia → mora (cuota vencida sin pago)
 * mora → al_dia (regulariza cuotas)
 * * → baja (baja voluntaria o administrativa)
 * baja es terminal en el scaffold (reactivación = TODO)
 */
export const STATUS_TRANSITIONS: Record<
  ParticipantStatus,
  ParticipantStatus[]
> = {
  pendiente: ["al_dia", "baja"],
  al_dia: ["mora", "baja"],
  mora: ["al_dia", "baja"],
  baja: [],
};

export function canTransition(
  from: ParticipantStatus,
  to: ParticipantStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
