import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateLogbookEntryDto {
  @ApiProperty({ example: 'Sea Bass' })
  @IsNotEmpty()
  @IsString()
  fishSpecies: string;

  @ApiPropertyOptional({ example: 'https://example.com/fish.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ example: 'Great catch!' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ example: 45.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  length?: number;

  @ApiPropertyOptional({ example: 2.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 'Off Antibes' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '2024-06-15' })
  @IsNotEmpty()
  @IsDateString()
  fishingDate: string;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  @IsBoolean()
  released: boolean;
}
