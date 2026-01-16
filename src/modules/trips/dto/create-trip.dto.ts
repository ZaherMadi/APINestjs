import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsUUID,
  IsArray,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Tuna Fishing Day' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Bring your own gear' })
  @IsOptional()
  @IsString()
  practicalInfo?: string;

  @ApiProperty({ enum: ['daily', 'recurring'], example: 'daily' })
  @IsNotEmpty()
  @IsEnum(['daily', 'recurring'])
  tripType: string;

  @ApiProperty({ enum: ['total', 'per_person'], example: 'per_person' })
  @IsNotEmpty()
  @IsEnum(['total', 'per_person'])
  pricingType: string;

  @ApiPropertyOptional({ type: [String], example: ['2024-06-15'] })
  @IsOptional()
  @IsArray()
  startDates?: string[];

  @ApiPropertyOptional({ type: [String], example: ['2024-06-15'] })
  @IsOptional()
  @IsArray()
  endDates?: string[];

  @ApiPropertyOptional({ type: [String], example: ['08:00'] })
  @IsOptional()
  @IsArray()
  startTimes?: string[];

  @ApiPropertyOptional({ type: [String], example: ['18:00'] })
  @IsOptional()
  @IsArray()
  endTimes?: string[];

  @ApiProperty({ example: 6 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  passengerCount: number;

  @ApiProperty({ example: 120.5 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  boatId: string;
}
