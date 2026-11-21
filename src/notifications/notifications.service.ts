import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NatsService } from '../nats/nats.service.js';
import { natsToHttpException } from '../nats/nats.errors.js';
import { NOTIFICATION_SUBJECTS as S } from './notifications.subjects.js';
import { CreateScheduleInput } from './models/notification.models.js';
import { toEscalationPolicyModel, toOnCallUserModel, toScheduleModel, toTeamModel } from './notifications.mapper.js';
import { EscalationPolicyDto, OnCallUserDto, ScheduleDto, TeamDto } from './notifications.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly nats: NatsService) {}
  private async call<T>(subject: string, payload: unknown): Promise<T> {
    try { return await this.nats.request<T>(subject, payload); } catch (error) { throw natsToHttpException(error); }
  }
  async listTeams() { const r = await this.call<{ teams?: TeamDto[] }>(S.teamsList, {}); return (r.teams ?? []).map(toTeamModel); }
  async onCall(teamId: string, at?: Date) {
    const r = await this.call<{ users?: OnCallUserDto[] }>(S.onCallGet, { teamId, ...(at ? { at: at.toISOString() } : {}) });
    return (r.users ?? []).map(toOnCallUserModel);
  }
  async listPolicies(teamId: string) { const r = await this.call<{ policies?: EscalationPolicyDto[] }>(S.policiesList, { teamId }); return (r.policies ?? []).map(toEscalationPolicyModel); }
  async listSchedules(teamId: string) { const r = await this.call<{ schedules?: ScheduleDto[] }>(S.schedulesList, { teamId }); return (r.schedules ?? []).map(toScheduleModel); }
  async createSchedule(input: CreateScheduleInput) {
    const r = await this.call<{ schedule?: ScheduleDto }>(S.scheduleCreate, { teamId: input.teamId, name: input.name, shifts: input.shifts.map((x) => ({ userId: x.userId, startsAt: x.startsAt.toISOString(), endsAt: x.endsAt.toISOString() })) });
    if (!r.schedule) throw new InternalServerErrorException('Empty response from notifications service');
    return toScheduleModel(r.schedule);
  }
}
