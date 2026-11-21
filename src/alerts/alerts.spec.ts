import { jest } from '@jest/globals';
import { AlertsService } from './alerts.service.js';
import { toAlertModel } from './alerts.mapper.js';
import { Severity } from '../incidents/models/enums.js';
import { Severity as ProtoSeverity } from '../gen/beacon/common/v1/common.js';
import { of } from 'rxjs';

describe('alerts', () => {
  it('maps labels and empty incident id', () => {
    const result = toAlertModel({ id: 'a', source: 's', fingerprint: 'f', title: 't', service: 'svc', severity: ProtoSeverity.SEVERITY_HIGH, labels: { env: 'prod' }, rawPayload: '', occurrences: 2, incidentId: '', firstReceivedAt: undefined, lastReceivedAt: undefined });
    expect(result).toMatchObject({ severity: Severity.HIGH, incidentId: undefined, labels: [{ key: 'env', value: 'prod' }] });
  });
  it('gets alerts by incident', async () => {
    const client = { getAlertsByIncident: jest.fn().mockReturnValue(of({ alerts: [] })) };
    const service = new AlertsService({ getService: () => client } as never);
    service.onModuleInit();
    await expect(service.byIncident('i')).resolves.toEqual([]);
    expect(client.getAlertsByIncident).toHaveBeenCalledWith({ incidentId: 'i' });
  });
});
