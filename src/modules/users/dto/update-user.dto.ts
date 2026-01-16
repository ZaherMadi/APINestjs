import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO pour mettre à jour un utilisateur
 *
 * CONCEPT - PartialType:
 * PartialType() rend tous les champs du CreateUserDto optionnels.
 * Très pratique pour les updates où on veut modifier seulement certains champs.
 *
 * Au lieu de réécrire tous les champs avec @IsOptional(),
 * PartialType() le fait automatiquement.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
