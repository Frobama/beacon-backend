import {
  IncidentStatus as ProtoStatus,
  Severity as ProtoSeverity,
} from '../gen/beacon/common/v1/common.js';
import {
  Incident as ProtoIncident,
  TimelineEntry as ProtoTimelineEntry,
  TimelineEntryKind as ProtoKind,
} from '../gen/beacon/incidents/v1/incidents.js';
import { Timestamp } from '../gen/google/protobuf/timestamp.js';
import { IncidentStatus, Severity, TimelineEventKind } from './models/enums.js';
import { IncidentModel, TimelineEventModel } from './models/incident.model.js';

const STATUS_FROM_PROTO: Partial<Record<ProtoStatus, IncidentStatus>> = {
  [ProtoStatus.INCIDENT_STATUS_TRIGGERED]: IncidentStatus.TRIGGERED,
  [ProtoStatus.INCIDENT_STATUS_ACKNOWLEDGED]: IncidentStatus.ACKNOWLEDGED,
  [ProtoStatus.INCIDENT_STATUS_MITIGATING]: IncidentStatus.MITIGATING,
  [ProtoStatus.INCIDENT_STATUS_RESOLVED]: IncidentStatus.RESOLVED,
  [ProtoStatus.INCIDENT_STATUS_POSTMORTEM]: IncidentStatus.POSTMORTEM,
};

const STATUS_TO_PROTO: Record<IncidentStatus, ProtoStatus> = {
  [IncidentStatus.TRIGGERED]: ProtoStatus.INCIDENT_STATUS_TRIGGERED,
  [IncidentStatus.ACKNOWLEDGED]: ProtoStatus.INCIDENT_STATUS_ACKNOWLEDGED,
  [IncidentStatus.MITIGATING]: ProtoStatus.INCIDENT_STATUS_MITIGATING,
  [IncidentStatus.RESOLVED]: ProtoStatus.INCIDENT_STATUS_RESOLVED,
  [IncidentStatus.POSTMORTEM]: ProtoStatus.INCIDENT_STATUS_POSTMORTEM,
};

const SEVERITY_FROM_PROTO: Partial<Record<ProtoSeverity, Severity>> = {
  [ProtoSeverity.SEVERITY_LOW]: Severity.LOW,
  [ProtoSeverity.SEVERITY_MEDIUM]: Severity.MEDIUM,
  [ProtoSeverity.SEVERITY_HIGH]: Severity.HIGH,
  [ProtoSeverity.SEVERITY_CRITICAL]: Severity.CRITICAL,
};

const SEVERITY_TO_PROTO: Record<Severity, ProtoSeverity> = {
  [Severity.LOW]: ProtoSeverity.SEVERITY_LOW,
  [Severity.MEDIUM]: ProtoSeverity.SEVERITY_MEDIUM,
  [Severity.HIGH]: ProtoSeverity.SEVERITY_HIGH,
  [Severity.CRITICAL]: ProtoSeverity.SEVERITY_CRITICAL,
};

const KIND_FROM_PROTO: Partial<Record<ProtoKind, TimelineEventKind>> = {
  [ProtoKind.TIMELINE_ENTRY_KIND_STATUS_CHANGED]: TimelineEventKind.STATUS_CHANGED,
  [ProtoKind.TIMELINE_ENTRY_KIND_ALERT_ATTACHED]: TimelineEventKind.ALERT_ATTACHED,
  [ProtoKind.TIMELINE_ENTRY_KIND_NOTIFICATION_SENT]: TimelineEventKind.NOTIFICATION_SENT,
  [ProtoKind.TIMELINE_ENTRY_KIND_ESCALATED]: TimelineEventKind.ESCALATED,
  [ProtoKind.TIMELINE_ENTRY_KIND_RUNBOOK_EXECUTED]: TimelineEventKind.RUNBOOK_EXECUTED,
  [ProtoKind.TIMELINE_ENTRY_KIND_MCP_ANALYSIS]: TimelineEventKind.MCP_ANALYSIS,
  [ProtoKind.TIMELINE_ENTRY_KIND_NOTE]: TimelineEventKind.NOTE,
};

function lookup<K extends string | number, V>(
  map: Partial<Record<K, V>>,
  key: K,
  label: string,
): V {
  const value = map[key];
  if (value === undefined) {
    throw new Error(`Unexpected ${label}: ${String(key)}`);
  }
  return value;
}

export const statusFromProto = (value: ProtoStatus): IncidentStatus =>
  lookup(STATUS_FROM_PROTO, value, 'incident status');
export const statusToProto = (value: IncidentStatus): ProtoStatus =>
  STATUS_TO_PROTO[value];
export const severityFromProto = (value: ProtoSeverity): Severity =>
  lookup(SEVERITY_FROM_PROTO, value, 'severity');
export const severityToProto = (value: Severity): ProtoSeverity =>
  SEVERITY_TO_PROTO[value];
export const kindFromProto = (value: ProtoKind): TimelineEventKind =>
  lookup(KIND_FROM_PROTO, value, 'timeline entry kind');

export function timestampToDate(
  timestamp: Timestamp | undefined | null,
): Date | undefined {
  if (!timestamp) {
    return undefined;
  }
  return new Date(
    Number(timestamp.seconds) * 1000 + Math.floor(timestamp.nanos / 1_000_000),
  );
}

export function toTimelineEventModel(entry: ProtoTimelineEntry): TimelineEventModel {
  return {
    id: entry.id,
    kind: kindFromProto(entry.kind),
    message: entry.message,
    actor: entry.actor,
    createdAt: timestampToDate(entry.createdAt) ?? new Date(0),
  };
}

export function toIncidentModel(incident: ProtoIncident): IncidentModel {
  return {
    id: incident.id,
    title: incident.title,
    service: incident.service,
    status: statusFromProto(incident.status),
    severity: severityFromProto(incident.severity),
    assigneeId: incident.assigneeId || undefined,
    alertIds: incident.alertIds,
    timeline: incident.timeline.map(toTimelineEventModel),
    createdAt: timestampToDate(incident.createdAt) ?? new Date(0),
    updatedAt: timestampToDate(incident.updatedAt) ?? new Date(0),
    resolvedAt: timestampToDate(incident.resolvedAt),
  };
}
