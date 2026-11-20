# beacon-backend

**Orquestador** de Beacon. Expone la API GraphQL al frontend y reparte el trabajo entre los microservicios.

| | |
|---|---|
| Framework | NestJS + GraphQL |
| Hacia Alertas e Incidentes | gRPC |
| Hacia Notificaciones | NATS (request/reply y eventos) |
| Hacia el MCP | REST |
| Hacia el frontend | GraphQL (queries, mutations y subscriptions) |

## Contratos

```bash
make proto
```

- `src/gen/`: clientes gRPC y tipos de mensajes (no versionado).
- `proto/`: copia de los `.proto` que carga el transporte gRPC en tiempo de ejecución (no versionado).

## Entorno local

NATS corre desde [`beacon-infra`](https://github.com/Frobama/beacon-infra) (`make up`): `nats://localhost:4222`. Para simular Notificaciones ejecuta `node scripts/dev/fake-notifications.mjs`.

## Calidad

Meta de cobertura: **60% mínimo**, aplicada en el pipeline a partir de la Fase 3.

## Cómo ejecutar

```bash
make proto          # genera src/gen y exporta proto/
npm run build       # compila el backend
npm run start:dev   # requiere beacon-incidents corriendo en localhost:9090
```

GraphQL: <http://localhost:3000/graphql> (Apollo Sandbox).

## Variables de entorno

| Variable | Por defecto |
|---|---|
| `PORT` | `3000` |
| `INCIDENTS_GRPC_URL` | `localhost:9090` |
| `ALERTS_GRPC_URL` | `localhost:9091` |
| `NATS_URL` | `nats://localhost:4222` |
| `CORS_ORIGIN` | `http://localhost:3000,http://127.0.0.1:3000` (lista separada por comas) |

## API (Fase 1)

```graphql
type Query {
  incidents(status: IncidentStatus, severity: Severity, service: String): [Incident!]!
  incident(id: ID!): Incident
}

type Mutation {
  createIncident(input: CreateIncidentInput!): Incident!
  acknowledgeIncident(id: ID!): Incident!
  resolveIncident(id: ID!): Incident!
}
```

## Tests

```bash
npm test
npm run test:cov    # el código generado no cuenta en la cobertura
```

## API (Fase 2)

GraphQL también expone `teams`, `onCall(teamId, at)`,
`escalationPolicies(teamId)`, `schedules(teamId)` y `createSchedule(input)`.
Cada incidente incluye `alerts` nullable; si Alertas no está disponible, el
incidente sigue devolviéndose con un error parcial y `alerts: null`.

Para desarrollo local:

```bash
make up
node scripts/dev/fake-notifications.mjs
npm run start:dev
```

La Fase 2 mantiene pendientes las subscriptions y el MCP.
