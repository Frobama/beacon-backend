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

NATS corre desde [`beacon-infra`](https://github.com/Frobama/beacon-infra) (`make up`): `nats://localhost:4222`.

## Calidad

Meta de cobertura: **60% mínimo**, aplicada en el pipeline a partir de la Fase 3.

## Estado

Fase 0: solo generación de contratos. El orquestador se crea en la Fase 1.
