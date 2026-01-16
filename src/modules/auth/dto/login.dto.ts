import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO (Data Transfer Object) pour le login
 *
 * CONCEPT - DTO:
 * Un DTO est un objet qui définit comment les données sont envoyées sur le réseau.
 * Il sert à :
 * 1. Valider les données entrantes (avec class-validator)
 * 2. Documenter l'API (avec @ApiProperty de Swagger)
 * 3. Transformer les données (avec class-transformer)
 *
 * DECORATEURS class-validator:
 * @IsEmail() : Vérifie que c'est un email valide
 * @IsNotEmpty() : Le champ ne peut pas être vide
 * @IsString() : Doit être une chaîne de caractères
 * @MinLength(8) : Longueur minimale de 8 caractères
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'jean.dupont@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'securePassword123',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
