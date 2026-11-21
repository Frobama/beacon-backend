import { join } from 'node:path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const root = join(process.cwd(), 'proto');
const definition = protoLoader.loadSync(join(root, 'beacon/alerts/v1/alerts.proto'), {
  includeDirs: [root],
  keepCase: false,
  longs: Number,
  defaults: true,
});
const { beacon } = grpc.loadPackageDefinition(definition);

const now = Math.floor(Date.now() / 1000);

const fakeAlert = (incidentId) => ({
  id: '00000000-0000-0000-0000-000000000001',
  source: 'alertmanager',
  fingerprint: 'abc123',
  title: 'Memoria sobre el 90%',
  service: 'checkout-api',
  severity: 'SEVERITY_CRITICAL',
  labels: { alertname: 'HighMemory', service: 'checkout-api', env: 'prod' },
  rawPayload: '{}',
  occurrences: 3,
  incidentId,
  firstReceivedAt: { seconds: now - 600, nanos: 0 },
  lastReceivedAt: { seconds: now - 30, nanos: 0 },
});

const server = new grpc.Server();
server.addService(beacon.alerts.v1.AlertService.service, {
  getAlertsByIncident: (call, callback) =>
    callback(null, { alerts: [fakeAlert(call.request.incidentId)] }),
  getAlert: (call, callback) => callback(null, { alert: fakeAlert('') }),
  listAlerts: (call, callback) => callback(null, { alerts: [fakeAlert('')], nextPageToken: '' }),
});

server.bindAsync('0.0.0.0:9091', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) throw err;
  console.log(`Fake alerts service listening on ${port}`);
});
