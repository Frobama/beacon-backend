export interface TeamDto { id?: string; name?: string; services?: string[] }
export interface OnCallUserDto { userId?: string; name?: string; email?: string; level?: number }
export interface EscalationLevelDto { level?: number; waitMinutes?: number; userIds?: string[] }
export interface EscalationPolicyDto { id?: string; teamId?: string; name?: string; levels?: EscalationLevelDto[] }
export interface ScheduleShiftDto { userId?: string; startsAt?: string; endsAt?: string }
export interface ScheduleDto { id?: string; teamId?: string; name?: string; shifts?: ScheduleShiftDto[] }
