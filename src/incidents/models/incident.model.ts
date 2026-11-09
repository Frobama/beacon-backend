import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IncidentStatus, Severity, TimelineEventKind } from './enums.js';

@ObjectType('TimelineEvent')
export class TimelineEventModel {
  @Field(() => ID)
  id: string;

  @Field(() => TimelineEventKind)
  kind: TimelineEventKind;

  @Field()
  message: string;

  @Field()
  actor: string;

  @Field()
  createdAt: Date;
}

@ObjectType('Incident')
export class IncidentModel {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  service: string;

  @Field(() => IncidentStatus)
  status: IncidentStatus;

  @Field(() => Severity)
  severity: Severity;

  @Field(() => String, { nullable: true })
  assigneeId?: string;

  @Field(() => [String])
  alertIds: string[];

  /** Vacío en el listado; se completa al pedir un incidente por id. */
  @Field(() => [TimelineEventModel])
  timeline: TimelineEventModel[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  resolvedAt?: Date;
}
