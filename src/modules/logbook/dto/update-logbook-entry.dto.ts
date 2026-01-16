import { PartialType } from '@nestjs/swagger';
import { CreateLogbookEntryDto } from './create-logbook-entry.dto';

export class UpdateLogbookEntryDto extends PartialType(CreateLogbookEntryDto) {}
