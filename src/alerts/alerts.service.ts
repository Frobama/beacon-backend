import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { AlertServiceClient, ALERT_SERVICE_NAME } from '../gen/beacon/alerts/v1/alerts.js';
import { toHttpException } from '../incidents/grpc-errors.js';
import { ALERTS_GRPC_CLIENT } from './alerts.constants.js';
import { toAlertModel } from './alerts.mapper.js';
@Injectable()
export class AlertsService implements OnModuleInit {
  private client: AlertServiceClient;
  constructor(@Inject(ALERTS_GRPC_CLIENT) private readonly grpc: ClientGrpc) {}
  onModuleInit() { this.client = this.grpc.getService<AlertServiceClient>(ALERT_SERVICE_NAME); }
  async byIncident(incidentId: string) {
    const response = await firstValueFrom(this.client.getAlertsByIncident({ incidentId }).pipe(catchError((error) => throwError(() => toHttpException(error, 'Alerts')))));
    return response.alerts.map(toAlertModel);
  }
}
