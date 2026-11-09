import { IncidentsResolver } from './incidents.resolver';
import { IncidentsService } from './incidents.service';
import { DEFAULT_ACTOR } from './incidents.constants';
import { IncidentStatus, Severity } from './models/enums';
import { IncidentModel } from './models/incident.model';
import { jest } from '@jest/globals';

describe('IncidentsResolver', () => {
  let service: jest.Mocked<
    Pick<IncidentsService, 'list' | 'get' | 'create' | 'updateStatus'>
  >;
  let resolver: IncidentsResolver;
  const incident = { id: 'abc' } as IncidentModel;

  beforeEach(() => {
    service = {
      list: jest.fn().mockResolvedValue([incident]),
      get: jest.fn().mockResolvedValue(incident),
      create: jest.fn().mockResolvedValue(incident),
      updateStatus: jest.fn().mockResolvedValue(incident),
    };
    resolver = new IncidentsResolver(service as unknown as IncidentsService);
  });

  it('lists incidents passing the filters through', async () => {
    await resolver.listIncidents(IncidentStatus.TRIGGERED, undefined, 'checkout');
    expect(service.list).toHaveBeenCalledWith({
      status: IncidentStatus.TRIGGERED,
      severity: undefined,
      service: 'checkout',
    });
  });

  it('gets an incident by id', async () => {
    await expect(resolver.getIncident('abc')).resolves.toBe(incident);
    expect(service.get).toHaveBeenCalledWith('abc');
  });

  it('creates an incident attributed to the default actor', async () => {
    const input = { title: 't', service: 's', severity: Severity.LOW };
    await resolver.createIncident(input);
    expect(service.create).toHaveBeenCalledWith(input, DEFAULT_ACTOR);
  });

  it('acknowledges an incident', async () => {
    await resolver.acknowledgeIncident('abc');
    expect(service.updateStatus).toHaveBeenCalledWith(
      'abc',
      IncidentStatus.ACKNOWLEDGED,
      DEFAULT_ACTOR,
    );
  });

  it('resolves an incident', async () => {
    await resolver.resolveIncident('abc');
    expect(service.updateStatus).toHaveBeenCalledWith(
      'abc',
      IncidentStatus.RESOLVED,
      DEFAULT_ACTOR,
    );
  });
});
