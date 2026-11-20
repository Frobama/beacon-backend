import { Alert as ProtoAlert } from '../gen/beacon/alerts/v1/alerts.js';
import { severityFromProto, timestampToDate } from '../incidents/incidents.mapper.js';
import { AlertModel } from './models/alert.model.js';
export function toAlertModel(alert: ProtoAlert): AlertModel {
  return { id: alert.id, source: alert.source, fingerprint: alert.fingerprint, title: alert.title, service: alert.service, severity: severityFromProto(alert.severity), labels: Object.entries(alert.labels ?? {}).map(([key, value]) => ({ key, value })), occurrences: alert.occurrences, incidentId: alert.incidentId || undefined, firstReceivedAt: timestampToDate(alert.firstReceivedAt) ?? new Date(0), lastReceivedAt: timestampToDate(alert.lastReceivedAt) ?? new Date(0) };
}
