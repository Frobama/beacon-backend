import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Severity } from '../../incidents/models/enums.js';
@ObjectType('AlertLabel') export class AlertLabelModel { @Field() key: string; @Field() value: string; }
@ObjectType('Alert') export class AlertModel {
  @Field(() => ID) id: string; @Field() source: string; @Field() fingerprint: string; @Field() title: string; @Field() service: string;
  @Field(() => Severity) severity: Severity; @Field(() => [AlertLabelModel]) labels: AlertLabelModel[]; @Field(() => Int) occurrences: number;
  @Field(() => ID, { nullable: true }) incidentId?: string; @Field(() => Date) firstReceivedAt: Date; @Field(() => Date) lastReceivedAt: Date;
}
