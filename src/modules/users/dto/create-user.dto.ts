import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * DTO pour créer un utilisateur
 *
 * DECORATEURS class-validator utilisés:
 * @IsOptional() : Le champ est optionnel
 * @IsEnum() : La valeur doit faire partie d'une énumération
 * @Matches() : Valide avec une regex (ex: format du numéro de permis)
 */
export class CreateUserDto {
  @ApiProperty({ example: 'Dupont' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Jean' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'jean.dupont@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123', minLength: 8 })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Nice' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ enum: ['individual', 'professional'], example: 'individual' })
  @IsNotEmpty()
  @IsEnum(['individual', 'professional'])
  status: string;

  @ApiPropertyOptional({ example: '12345678', pattern: '^\\d{8}$' })
  @IsOptional()
  @Matches(/^\d{8}$/, { message: 'Boat license must be 8 digits' })
  boatLicenseNumber?: string;

  @ApiPropertyOptional({ example: 'ABC123456789', pattern: '^[A-Z0-9]{12}$' })
  @IsOptional()
  @Matches(/^[A-Z0-9]{12}$/, { message: 'Insurance number must be 12 alphanumeric characters' })
  insuranceNumber?: string;

  @ApiPropertyOptional({ example: 'Fisher Boats SARL' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ enum: ['rental', 'fishing_guide'] })
  @IsOptional()
  @IsEnum(['rental', 'fishing_guide'])
  activityType?: string;
}
