import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsArray,
  Min,
} from 'class-validator';

export class CreateBoatDto {
  @ApiProperty({ example: 'Sea Explorer' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Beautiful fishing boat' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Beneteau' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: 2018 })
  @IsOptional()
  @IsNumber()
  yearBuilt?: number;

  @ApiPropertyOptional({ example: 'https://example.com/boat.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ enum: ['coastal', 'river'] })
  @IsOptional()
  @IsEnum(['coastal', 'river'])
  licenseType?: string;

  @ApiProperty({
    enum: ['open', 'cabin', 'catamaran', 'sailboat', 'jet_ski', 'canoe'],
    example: 'cabin',
  })
  @IsNotEmpty()
  @IsEnum(['open', 'cabin', 'catamaran', 'sailboat', 'jet_ski', 'canoe'])
  boatType: string;

  @ApiPropertyOptional({
    type: [String],
    enum: ['sounder', 'livewell', 'ladder', 'gps', 'rod_holder', 'vhf_radio'],
    example: ['gps', 'sounder'],
  })
  @IsOptional()
  @IsArray()
  equipment?: string[];

  @ApiPropertyOptional({ example: 1500.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deposit?: number;

  @ApiProperty({ example: 8 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  maxCapacity: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  bedCount?: number;

  @ApiProperty({ example: 'Antibes' })
  @IsNotEmpty()
  @IsString()
  homePort: string;

  @ApiPropertyOptional({ example: 43.5804 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 7.1251 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ enum: ['diesel', 'gasoline', 'none'] })
  @IsOptional()
  @IsEnum(['diesel', 'gasoline', 'none'])
  engineType?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  enginePower?: number;
}
