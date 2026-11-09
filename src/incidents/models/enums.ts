import { registerEnumType } from '@nestjs/graphql';

export enum IncidentStatus {
  TRIGGERED = 'TRIGGERED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  MITIGATING = 'MITIGATING',
  RESOLVED = 'RESOLVED',
  POSTMORTEM = 'POSTMORTEM',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TimelineEventKind {
  STATUS_CHANGED = 'STATUS_CHANGED',
  ALERT_ATTACHED = 'ALERT_ATTACHED',
  NOTIFICATION_SENT = 'NOTIFICATION_SENT',
  ESCALATED = 'ESCALATED',
  RUNBOOK_EXECUTED = 'RUNBOOK_EXECUTED',
  MCP_ANALYSIS = 'MCP_ANALYSIS',
  NOTE = 'NOTE',
}

registerEnumType(IncidentStatus, { name: 'IncidentStatus' });
registerEnumType(Severity, { name: 'Severity' });
registerEnumType(TimelineEventKind, { name: 'TimelineEventKind' });
