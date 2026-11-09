# Guía de contribución

Aplica a todos los repositorios de Beacon.

## Ramas

Trabajamos con **trunk-based development**: `main` siempre está estable y desplegable. Todo cambio entra por Pull Request desde una rama corta.

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feat/` | Funcionalidad nueva | `feat/acknowledge-incident` |
| `fix/` | Corrección de bug | `fix/dedup-fingerprint` |
| `chore/` | Mantenimiento, dependencias, CI | `chore/bump-grpc` |
| `docs/` | Solo documentación | `docs/readme-setup` |
| `refactor/` | Cambios internos sin alterar comportamiento | `refactor/escalation-timer` |

## Commits: Conventional Commits

Formato: `tipo(alcance opcional): descripción en imperativo`

Tipos: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`.

Ejemplos:

```
feat(incidents): add status transition validation
fix(alerts): compute fingerprint from sorted labels
ci: add coverage threshold
docs(contracts): document nats subjects
```

El **título del PR** también debe seguir este formato (lo valida un workflow) porque usamos *squash merge*: el título del PR se convierte en el commit en `main`.

## Pull Requests

1. Crea la rama desde `main` actualizado.
2. Abre el PR con el template.
3. El pipeline debe pasar en verde.
4. Haz *squash and merge* y borra la rama.

## Versionado

Semantic Versioning (`vMAYOR.MENOR.PARCHE`) mediante tags en `main`.

- En `beacon-contracts` los tags son la **fuente de verdad**: los demás repos fijan la versión que consumen.
- Cambios compatibles (agregar campos o mensajes) suben MENOR.
- Cambios incompatibles (renombrar, borrar, cambiar tipos) están prohibidos en `v1`; requieren un paquete `v2`.

## Calidad

- Los tests acompañan al código en el mismo PR.
- El backend debe mantener al menos 60% de cobertura (se configura en la Fase 3).
- Nunca subas secretos: usa `.env` (ignorado) y `.env.example` (versionado).
