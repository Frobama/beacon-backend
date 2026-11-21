import { EscalationLevelModel, EscalationPolicyModel, OnCallUserModel, ScheduleModel, ScheduleShiftModel, TeamModel } from './models/notification.models.js';
import { EscalationLevelDto, EscalationPolicyDto, OnCallUserDto, ScheduleDto, ScheduleShiftDto, TeamDto } from './notifications.dto.js';

const date = (value?: string) => value ? new Date(value) : new Date(0);
export const toTeamModel = (x: TeamDto): TeamModel => ({ id: x.id ?? '', name: x.name ?? '', services: x.services ?? [] });
export const toOnCallUserModel = (x: OnCallUserDto): OnCallUserModel => ({ userId: x.userId ?? '', name: x.name ?? x.userId ?? '', email: x.email ?? '', level: x.level ?? 0 });
export const toEscalationLevelModel = (x: EscalationLevelDto): EscalationLevelModel => ({ level: x.level ?? 0, waitMinutes: x.waitMinutes ?? 0, userIds: x.userIds ?? [] });
export const toEscalationPolicyModel = (x: EscalationPolicyDto): EscalationPolicyModel => ({ id: x.id ?? '', teamId: x.teamId ?? '', name: x.name ?? '', levels: (x.levels ?? []).map(toEscalationLevelModel) });
export const toScheduleShiftModel = (x: ScheduleShiftDto): ScheduleShiftModel => ({ userId: x.userId ?? '', startsAt: date(x.startsAt), endsAt: date(x.endsAt) });
export const toScheduleModel = (x: ScheduleDto): ScheduleModel => ({ id: x.id ?? '', teamId: x.teamId ?? '', name: x.name ?? '', shifts: (x.shifts ?? []).map(toScheduleShiftModel) });
