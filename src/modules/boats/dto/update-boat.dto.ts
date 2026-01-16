import { PartialType } from '@nestjs/swagger';
import { CreateBoatDto } from './create-boat.dto';

export class UpdateBoatDto extends PartialType(CreateBoatDto) {}
