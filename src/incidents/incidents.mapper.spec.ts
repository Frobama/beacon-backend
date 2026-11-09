import {
  IncidentStatus as ProtoStatus,
  Severity as ProtoSeverity,
} from '../gen/beacon/common/v1/common';
import {
  Incident as ProtoIncident,
  TimelineEntryKind as ProtoKind,
} from '../gen/beacon/incidents/v1/incidents';
import {
  kindFromProto,
  severityFromProto,
  severityToProto,
  statusFromProto,
  statusToProto,
  timestampToDate,
  toIncidentModel,
} from './incidents.mapper';
import { IncidentStatus, Severity, TimelineEventKind } from './models/enums';

describe('incidents.mapper', () => {
  it('converts a protobuf timestamp to a Date', () => {
    const date = timestampToDate({ seconds: 1_700_000_000, nanos: 500_000_000 });
    expect(date?.getTime()).toBe(1_700_000_000_500);
  });

  it('returns undefined for a missing timestamp', () => {
    expect(timestampToDate(undefined)).toBeUndefined();
    expect(timestampToDate(null)).toBeUndefined();
  });

  it('maps statuses and severities in both directions', () => {
    for (const status of Object.values(IncidentStatus)) {
      expect(statusFromProto(statusToProto(status))).toBe(status);
    }
    for (const severity of Object.values(Severity)) {
      expect(severityFromProto(severityToProto(severity))).toBe(severity);
    }
  });

  it('maps a timeline kind', () => {
    expect(kindFromProto(ProtoKind.TIMELINE_ENTRY_KIND_ESCALATED)).toBe(
      TimelineEventKind.ESCALATED,
    );
  });

  it('rejects unspecified enum values', () => {
    expect(() => statusFromProto(ProtoStatus.INCIDENT_STATUS_UNSPECIFIED)).toThrow();
    expect(() => severityFromProto(ProtoSeverity.SEVERITY_UNSPECIFIED)).toThrow();
    expect(() => kindFromProto(ProtoKind.TIMELINE_ENTRY_KIND_UNSPECIFIED)).toThrow();
  });

  it('maps a protobuf incident to the GraphQL model', () => {
    const proto: ProtoIncident = {
      id: 'abc',
      title: 'DB down',
      service: 'checkout',
      status: ProtoStatus.INCIDENT_STATUS_ACKNOWLEDGED,
      severity: ProtoSeverity.SEVERITY_HIGH,
      assigneeId: 'ana',
      alertIds: ['a1'],
      timeline: [
        {
          id: 't1',
          kind: ProtoKind.TIMELINE_ENTRY_KIND_NOTE,
          message: 'hola',
          actor: 'ana',
          createdAt: { seconds: 1_700_000_000, nanos: 0 },
        },
      ],
      createdAt: { seconds: 1_700_000_000, nanos: 0 },
      updatedAt: { seconds: 1_700_000_100, nanos: 0 },
      resolvedAt: undefined,
    };

    const model = toIncidentModel(proto);

    expect(model.status).toBe(IncidentStatus.ACKNOWLEDGED);
    expect(model.severity).toBe(Severity.HIGH);
    expect(model.assigneeId).toBe('ana');
    expect(model.resolvedAt).toBeUndefined();
    expect(model.timeline).toHaveLength(1);
    expect(model.timeline[0].kind).toBe(TimelineEventKind.NOTE);
    expect(model.createdAt.getTime()).toBe(1_700_000_000_000);
  });

  it('turns an empty assignee into undefined', () => {
    const model = toIncidentModel({
      id: 'abc',
      title: 't',
      service: 's',
      status: ProtoStatus.INCIDENT_STATUS_TRIGGERED,
      severity: ProtoSeverity.SEVERITY_LOW,
      assigneeId: '',
      alertIds: [],
      timeline: [],
      createdAt: { seconds: 1, nanos: 0 },
      updatedAt: { seconds: 1, nanos: 0 },
      resolvedAt: undefined,
    });
    expect(model.assigneeId).toBeUndefined();
  });
});
