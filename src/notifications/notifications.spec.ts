import { jest } from '@jest/globals';
import { NotificationsService } from './notifications.service.js';
import { NatsService } from '../nats/nats.service.js';
import { toOnCallUserModel, toScheduleModel } from './notifications.mapper.js';

describe('notifications', () => {
  it('maps omitted fields with defaults', () => {
    expect(toOnCallUserModel({ userId: 'u' })).toEqual({ userId: 'u', name: 'u', email: '', level: 0 });
    expect(toScheduleModel({})).toEqual({ id: '', teamId: '', name: '', shifts: [] });
  });
  it('calls NATS subjects and maps responses', async () => {
    const request = jest.fn()
      .mockResolvedValueOnce({ teams: [{ id: 't' }] })
      .mockResolvedValueOnce({ users: [{ userId: 'u' }] })
      .mockResolvedValueOnce({ policies: [] })
      .mockResolvedValueOnce({ schedules: [] })
      .mockResolvedValueOnce({ schedule: { id: 's' } });
    const service = new NotificationsService({ request } as unknown as NatsService);
    await expect(service.listTeams()).resolves.toHaveLength(1);
    await expect(service.onCall('t')).resolves.toHaveLength(1);
    await expect(service.listPolicies('t')).resolves.toEqual([]);
    await expect(service.listSchedules('t')).resolves.toEqual([]);
    await expect(service.createSchedule({ teamId: 't', name: 'n', shifts: [{ userId: 'u', startsAt: new Date(1), endsAt: new Date(2) }] })).resolves.toMatchObject({ id: 's' });
    expect(request).toHaveBeenCalledTimes(5);
  });
});
