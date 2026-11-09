import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { Severity } from './enums.js';

@InputType()
export class CreateIncidentInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @Field()
  @IsNotEmpty()
  @MaxLength(100)
  service: string;

  @Field(() => Severity)
  @IsEnum(Severity)
  severity: Severity;
}
