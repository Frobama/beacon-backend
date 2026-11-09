import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { jest } from '@jest/globals';
import { status } from '@grpc/grpc-js';
import { of, throwError } from 'rxjs';
import {
  IncidentStatus as ProtoStatus,
  Severity as ProtoSeverity,
} from '../gen/beacon/common/v1/common';
import {
  Incident as ProtoIncident,
  IncidentServiceClient,
} from '../gen/beacon/incidents/v1/incidents';
import { IncidentsService } from './incidents.service';
import { IncidentStatus, Severity } from './models/enums';

const protoIncident: ProtoIncident = {
  id: 'abc',
  title: 'DB down',
  service: 'checkout',
  status: ProtoStatus.INCIDENT_STATUS_TRIGGERED,
  severity: ProtoSeverity.SEVERITY_HIGH,
  assigneeId: '',
  alertIds: [],
  timeline: [],
  createdAt: { seconds: 1_700_000_000, nanos: 0 },
  updatedAt: { seconds: 1_700_000_000, nanos: 0 },
  resolvedAt: undefined,
};

describe('IncidentsService', () => {
  let client: jest.Mocked<IncidentServiceClient>;
  let service: IncidentsService;

  beforeEach(() => {
    client = {
      createIncident: jest.fn(),
      reportAlert: jest.fn(),
      getIncident: jest.fn(),
      listIncidents: jest.fn(),
      updateStatus: jest.fn(),
      addTimelineEntry: jest.fn(),
    };
    const grpc = { getService: () => client } as unknown as ClientGrpc;
    service = new IncidentsService(grpc);
    service.onModuleInit();
  });

  it('lists incidents and maps them to GraphQL models', async () => {
    client.listIncidents.mockReturnValue(
      of({ incidents: [protoIncident], nextPageToken: '' }),
    );

    const result = await service.list({ status: IncidentStatus.TRIGGERED });

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe(Severity.HIGH);
    expect(client.listIncidents).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ProtoStatus.INCIDENT_STATUS_TRIGGERED,
        severity: ProtoSeverity.SEVERITY_UNSPECIFIED,
        service: '',
      }),
    );
  });

  it('returns an incident by id', async () => {
    client.getIncident.mockReturnValue(of({ incident: protoIncident }));
    const result = await service.get('abc');
    expect(result?.id).toBe('abc');
  });

  it('returns null when the incident does not exist', async () => {
    client.getIncident.mockReturnValue(
      throwError(() => ({ code: status.NOT_FOUND, details: 'missing' })),
    );
    await expect(service.get('nope')).resolves.toBeNull();
  });

  it('propagates other errors from get', async () => {
    client.getIncident.mockReturnValue(
      throwError(() => ({ code: status.INTERNAL, details: 'boom' })),
    );
    await expect(service.get('abc')).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('creates an incident with the given actor', async () => {
    client.createIncident.mockReturnValue(of({ incident: protoIncident }));

    const result = await service.create(
      { title: 'DB down', service: 'checkout', severity: Severity.HIGH },
      'ana',
    );

    expect(result.title).toBe('DB down');
    expect(client.createIncident).toHaveBeenCalledWith({
      title: 'DB down',
      service: 'checkout',
      severity: ProtoSeverity.SEVERITY_HIGH,
      actor: 'ana',
    });
  });

  it('updates the status', async () => {
    client.updateStatus.mockReturnValue(
      of({
        incident: { ...protoIncident, status: ProtoStatus.INCIDENT_STATUS_ACKNOWLEDGED },
      }),
    );

    const result = await service.updateStatus('abc', IncidentStatus.ACKNOWLEDGED, 'ana');

    expect(result.status).toBe(IncidentStatus.ACKNOWLEDGED);
  });

  it('fails when the response has no incident', async () => {
    client.updateStatus.mockReturnValue(of({ incident: undefined }));
    await expect(
      service.updateStatus('abc', IncidentStatus.RESOLVED, 'ana'),
    ).rejects.toBeInstanceOf(InternalServerErrorException);
  });

  it('turns a gRPC NOT_FOUND into NotFoundException on mutations', async () => {
    client.updateStatus.mockReturnValue(
      throwError(() => ({ code: status.NOT_FOUND, details: 'missing' })),
    );
    await expect(
      service.updateStatus('nope', IncidentStatus.RESOLVED, 'ana'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
