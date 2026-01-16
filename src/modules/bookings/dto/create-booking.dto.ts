import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsNotEmpty()
  @IsUUID()
  tripId: string;

  @ApiProperty({ example: '2024-06-15' })
  @IsNotEmpty()
  @IsDateString()
  selectedDate: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  seats: number;
}
