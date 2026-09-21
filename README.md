# Rifa Bomberos — scaffold multi-tenant

Scaffold **Pandaworks** para digitalizar el **bono/rifa anual** de asociaciones de bomberos voluntarios en Argentina.

Stack: **Next.js App Router · TypeScript · Prisma · SQLite · Tailwind**.

> **Sin cobros en vivo.** Los campos de Mercado Pago son placeholders. No conectar tokens reales en este repo scaffold.

## Requisitos

- Node.js 20+
- npm 9+

## Arranque local

```bash
npm install
cp .env.example .env
# DATABASE_URL="file:./dev.db" (ruta relativa a /prisma)

npx prisma generate
npx prisma db push
# opcional: npm run db:seed

npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) → **Admin** en `/admin`.

### Scripts útiles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run db:generate` | `prisma generate` |
| `npm run db:push` | Sincroniza schema → SQLite (sin migraciones formales) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Datos de ejemplo (1 cuartel + campaña) |

Para migraciones versionadas más adelante:

```bash
npx prisma migrate dev --name init
```

## Modelo de dominio

- **Tenant** (cuartel): `name`, `slug`, `cuit?`, `status`; placeholders MP: `mpSellerId`, `marketplaceFee`, `linkStatus` (`pendiente` \| `ok` \| `expirada`), stubs de token (nunca secretos reales).
- **Campaign**: `tenantId`, `year`, `period`, `premio` (orden de compra), `status`.
- **Participant**: `tenantId`, `campaignId`, contactos, `status` **exacto**: `pendiente` \| `al_dia` \| `mora` \| `baja`.
- **Cuota**: `participantId`, `campaignId`, `period`/`month`, `amount`, `paymentStatus`: `abierta` \| `pagada` \| `vencida`.

### Patrón multi-tenant

Toda consulta de negocio debe filtrar por `tenantId`. Usar `tenantScope(tenantId)` en `src/lib/tenant.ts` (listados de campañas, abonados, cuotas y alta de participantes).

## Estados del participante (transiciones)

| Desde | Hacia | Cuándo (producto) |
|-------|-------|-------------------|
| `pendiente` | `al_dia` | Alta confirmada / primera cuota marcada pagada |
| `pendiente` | `baja` | Desiste antes de activarse |
| `al_dia` | `mora` | Hay cuota(s) `vencida` sin regularizar |
| `al_dia` | `baja` | Baja voluntaria o administrativa |
| `mora` | `al_dia` | Regulariza cuotas vencidas |
| `mora` | `baja` | Baja en mora |
| `baja` | — | Terminal en este scaffold (reactivación = TODO) |

Helpers: `src/lib/participant-status.ts`.

Elegibilidad a sorteos (Quiniela): en producto real, solo `al_dia` debería participar — lógica de sorteo = TODO.

## Admin mínimo

- `/admin` — resumen
- `/admin/tenants` + `/admin/tenants/nuevo` — listado / alta de cuarteles
- `/admin/campaigns` — campañas por tenant
- `/admin/participants` — abonados + stub de 9 cuotas `abierta`

API stub: `GET/POST /api/tenants` (sin auth — TODO).

## TODOs (sin integrar en vivo)

1. **Mercado Pago Marketplace OAuth por cuartel**  
   - Flujo OAuth para vincular vendedor (`mp_seller_id`)  
   - Renovar tokens; respetar `link_status` (`pendiente` \| `ok` \| `expirada`)  
   - Split / marketplace fee compatible con topes de comisión (~6% PBA)  
   - **No cobrar en este scaffold**

2. **Webhooks MP**  
   - Confirmar pagos de cuota → `paymentStatus = pagada`  
   - Recalcular estado del participante (`al_dia` / `mora`)  
   - Idempotencia y firma de webhook

3. **WhatsApp**  
   - Links/QR listos para pegar  
   - Ticket digital al comprador  
   - Recordatorios de cuota (opt-in)

4. Auth / roles (Comisión Directiva vs cobrador) scoped por `tenantId`  
5. Sorteo Quiniela + elegibilidad `al_dia`  
6. Checklist compliance municipal/provincial  
7. Migrar SQLite → Postgres en producción

## Estructura relevante

```
prisma/schema.prisma
src/lib/prisma.ts
src/lib/tenant.ts              # consultas scoped
src/lib/participant-status.ts
src/app/admin/...
src/app/api/tenants/route.ts
.env.example
```

## Repo

Privado: [adrianustheone/rifa-bomberos](https://github.com/adrianustheone/rifa-bomberos)

Confidencial · Borrador de producto · No es dictamen jurídico.
