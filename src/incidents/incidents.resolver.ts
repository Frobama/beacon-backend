import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DEFAULT_ACTOR } from './incidents.constants.js';
import { IncidentsService } from './incidents.service.js';
import { CreateIncidentInput } from './models/create-incident.input.js';
import { IncidentStatus, Severity } from './models/enums.js';
import { IncidentModel } from './models/incident.model.js';

@Resolver(() => IncidentModel)
export class IncidentsResolver {
  constructor(private readonly service: IncidentsService) {}

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
