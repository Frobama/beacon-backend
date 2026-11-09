import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';
import {
  IncidentStatus as ProtoStatus,
  Severity as ProtoSeverity,
} from '../gen/beacon/common/v1/common.js';
import {
  Incident as ProtoIncident,
  INCIDENT_SERVICE_NAME,
  IncidentServiceClient,
} from '../gen/beacon/incidents/v1/incidents.js';
import { toHttpException } from './grpc-errors.js';
import { INCIDENTS_GRPC_CLIENT } from './incidents.constants.js';
import {
  severityToProto,
  statusToProto,
  toIncidentModel,
} from './incidents.mapper.js';
import { IncidentStatus, Severity } from './models/enums.js';
import { IncidentModel } from './models/incident.model.js';

export interface IncidentFilter {
  status?: IncidentStatus;
  severity?: Severity;
  service?: string;
}

export interface NewIncident {
  title: string;
  service: string;
  severity: Severity;
}

@Injectable()
export class IncidentsService implements OnModuleInit {
  private client: IncidentServiceClient;

  constructor(@Inject(INCIDENTS_GRPC_CLIENT) private readonly grpc: ClientGrpc) {}

  onModuleInit() {
    this.client = this.grpc.getService<IncidentServiceClient>(INCIDENT_SERVICE_NAME);
  }

  async list(filter: IncidentFilter = {}): Promise<IncidentModel[]> {
    // Fase 1: una sola página de hasta 100 incidentes. La paginación llega después.
    const response = await this.call(
      this.client.listIncidents({
        status: filter.status
          ? statusToProto(filter.status)
          : ProtoStatus.INCIDENT_STATUS_UNSPECIFIED,
        severity: filter.severity
          ? severityToProto(filter.severity)
          : ProtoSeverity.SEVERITY_UNSPECIFIED,
        service: filter.service ?? '',
        pageSize: 100,
        pageToken: '',
      }),
    );
    return response.incidents.map(toIncidentModel);
  }

  /** Devuelve null si el incidente no existe. */
  async get(id: string): Promise<IncidentModel | null> {
    try {
      const response = await this.call(this.client.getIncident({ id }));
      return toIncidentModel(this.requireIncident(response.incident));
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async create(input: NewIncident, actor: string): Promise<IncidentModel> {
    const response = await this.call(
      this.client.createIncident({
        title: input.title,
        service: input.service,
        severity: severityToProto(input.severity),
        actor,
      }),
    );
    return toIncidentModel(this.requireIncident(response.incident));
  }

  async updateStatus(
    id: string,
    status: IncidentStatus,
    actor: string,
  ): Promise<IncidentModel> {
    const response = await this.call(
      this.client.updateStatus({ id, status: statusToProto(status), actor }),
    );
    return toIncidentModel(this.requireIncident(response.incident));
  }

  private call<T>(request: Observable<T>): Promise<T> {
    return firstValueFrom(
      request.pipe(catchError((error) => throwError(() => toHttpException(error)))),
    );
  }

  private requireIncident(incident: ProtoIncident | undefined): ProtoIncident {
    if (!incident) {
      throw new InternalServerErrorException('Empty response from incidents service');
    }
    return incident;
  }
}
