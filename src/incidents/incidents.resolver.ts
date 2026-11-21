import { Args, ID, Mutation, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AlertModel } from '../alerts/models/alert.model.js';
import { AlertsService } from '../alerts/alerts.service.js';
import { DEFAULT_ACTOR } from './incidents.constants.js';
import { IncidentsService } from './incidents.service.js';
import { CreateIncidentInput } from './models/create-incident.input.js';
import { IncidentStatus, Severity } from './models/enums.js';
import { IncidentModel } from './models/incident.model.js';

@Resolver(() => IncidentModel)
export class IncidentsResolver {
  constructor(private readonly service: IncidentsService, private readonly alerts: AlertsService) {}

  @ResolveField(() => [AlertModel], { name: 'alerts', nullable: true })
  alertsForIncident(incident: IncidentModel) {
    return this.alerts.byIncident(incident.id);
  }

  @Query(() => [IncidentModel], { name: 'incidents' })
  listIncidents(
    @Args('status', { type: () => IncidentStatus, nullable: true })
    status?: IncidentStatus,
    @Args('severity', { type: () => Severity, nullable: true })
    severity?: Severity,
    @Args('service', { type: () => String, nullable: true })
    service?: string,
  ) {
    return this.service.list({
      status: status ?? undefined,
      severity: severity ?? undefined,
      service: service ?? undefined,
    });
  }

  @Query(() => IncidentModel, { name: 'incident', nullable: true })
  getIncident(@Args('id', { type: () => ID }) id: string) {
    return this.service.get(id);
  }

  @Mutation(() => IncidentModel)
  createIncident(@Args('input') input: CreateIncidentInput) {
    return this.service.create(input, DEFAULT_ACTOR);
  }

  @Mutation(() => IncidentModel)
  acknowledgeIncident(@Args('id', { type: () => ID }) id: string) {
    return this.service.updateStatus(id, IncidentStatus.ACKNOWLEDGED, DEFAULT_ACTOR);
  }

  @Mutation(() => IncidentModel)
  resolveIncident(@Args('id', { type: () => ID }) id: string) {
    return this.service.updateStatus(id, IncidentStatus.RESOLVED, DEFAULT_ACTOR);
  }
}
