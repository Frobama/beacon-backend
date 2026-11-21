import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationsService } from './notifications.service.js';
import { CreateScheduleInput, EscalationPolicyModel, OnCallUserModel, ScheduleModel, TeamModel } from './models/notification.models.js';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly service: NotificationsService) {}
  @Query(() => [TeamModel]) teams() { return this.service.listTeams(); }
  @Query(() => [OnCallUserModel]) onCall(@Args('teamId', { type: () => ID }) teamId: string, @Args('at', { type: () => Date, nullable: true }) at?: Date) { return this.service.onCall(teamId, at); }
  @Query(() => [EscalationPolicyModel]) escalationPolicies(@Args('teamId', { type: () => ID }) teamId: string) { return this.service.listPolicies(teamId); }
  @Query(() => [ScheduleModel]) schedules(@Args('teamId', { type: () => ID }) teamId: string) { return this.service.listSchedules(teamId); }
  @Mutation(() => ScheduleModel) createSchedule(@Args('input') input: CreateScheduleInput) { return this.service.createSchedule(input); }
}
