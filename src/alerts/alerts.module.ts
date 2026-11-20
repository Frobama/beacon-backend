import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { BEACON_ALERTS_V1_PACKAGE_NAME } from '../gen/beacon/alerts/v1/alerts.js';
import { ALERTS_GRPC_CLIENT } from './alerts.constants.js';
import { AlertsService } from './alerts.service.js';
@Module({
  imports: [ClientsModule.registerAsync([{ name: ALERTS_GRPC_CLIENT, inject: [ConfigService], useFactory: (config: ConfigService) => {
    const protoRoot = join(process.cwd(), 'proto');
    return { transport: Transport.GRPC, options: { url: config.get<string>('ALERTS_GRPC_URL', 'localhost:9091'), package: BEACON_ALERTS_V1_PACKAGE_NAME, protoPath: join(protoRoot, 'beacon/alerts/v1/alerts.proto'), loader: { includeDirs: [protoRoot], keepCase: false, longs: Number, defaults: true } } };
  } }])],
  providers: [AlertsService], exports: [AlertsService],
})
export class AlertsModule {}
