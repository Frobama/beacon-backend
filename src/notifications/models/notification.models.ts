import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ArrayMinSize, IsDate, IsNotEmpty, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType('Team') export class TeamModel { @Field(() => ID) id: string; @Field() name: string; @Field(() => [String]) services: string[]; }
@ObjectType('OnCallUser') export class OnCallUserModel { @Field(() => ID) userId: string; @Field() name: string; @Field() email: string; @Field(() => Int) level: number; }
@ObjectType('EscalationLevel') export class EscalationLevelModel { @Field(() => Int) level: number; @Field(() => Int) waitMinutes: number; @Field(() => [String]) userIds: string[]; }
@ObjectType('EscalationPolicy') export class EscalationPolicyModel { @Field(() => ID) id: string; @Field() teamId: string; @Field() name: string; @Field(() => [EscalationLevelModel]) levels: EscalationLevelModel[]; }
@ObjectType('ScheduleShift') export class ScheduleShiftModel { @Field() userId: string; @Field(() => Date) startsAt: Date; @Field(() => Date) endsAt: Date; }
@ObjectType('Schedule') export class ScheduleModel { @Field(() => ID) id: string; @Field() teamId: string; @Field() name: string; @Field(() => [ScheduleShiftModel]) shifts: ScheduleShiftModel[]; }

@InputType('ScheduleShiftInput') export class ScheduleShiftInput {
  @Field() @IsNotEmpty() @IsString() userId: string;
  @Field(() => Date) @Type(() => Date) @IsDate() startsAt: Date;
  @Field(() => Date) @Type(() => Date) @IsDate() endsAt: Date;
}
@InputType('CreateScheduleInput') export class CreateScheduleInput {
  @Field(() => ID) @IsNotEmpty() teamId: string;
  @Field() @IsNotEmpty() @IsString() @MaxLength(100) @MinLength(1) name: string;
  @Field(() => [ScheduleShiftInput]) @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ScheduleShiftInput) shifts: ScheduleShiftInput[];
}
