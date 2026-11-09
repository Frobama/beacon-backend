import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BEACON_INCIDENTS_V1_PACKAGE_NAME } from '../gen/beacon/incidents/v1/incidents.js';
import { INCIDENTS_GRPC_CLIENT } from './incidents.constants.js';
import { IncidentsResolver } from './incidents.resolver.js';
import { IncidentsService } from './incidents.service.js';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: INCIDENTS_GRPC_CLIENT,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          const protoRoot = join(process.cwd(), 'proto');
          return {
            transport: Transport.GRPC,
            options: {
              url: config.get<string>('INCIDENTS_GRPC_URL', 'localhost:9090'),
              package: BEACON_INCIDENTS_V1_PACKAGE_NAME,
              protoPath: join(protoRoot, 'beacon/incidents/v1/incidents.proto'),
              loader: {
                includeDirs: [protoRoot],
                keepCase: false,
                longs: Number,
                defaults: true,
              },
            },
          };
        },
      },
    ]),
  ],
  providers: [IncidentsService, IncidentsResolver],
})
export class IncidentsModule {}
