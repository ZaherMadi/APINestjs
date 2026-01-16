import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LogbookService } from './logbook.service';
import { CreateLogbookEntryDto } from './dto/create-logbook-entry.dto';
import { UpdateLogbookEntryDto } from './dto/update-logbook-entry.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Fishing Logbook')
@Controller('v1/logbook')
@ApiBearerAuth()
export class LogbookController {
  constructor(private readonly logbookService: LogbookService) {}

  @Post()
  @ApiOperation({ summary: 'Create logbook entry' })
  @ApiResponse({
    status: 201,
    description: 'Logbook entry created successfully',
  })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async create(
    @Body() createLogbookEntryDto: CreateLogbookEntryDto,
    @CurrentUser() user: User,
  ) {
    return this.logbookService.create(createLogbookEntryDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get logbook entries' })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'fishSpecies', required: false })
  @ApiResponse({
    status: 200,
    description: 'Logbook entries retrieved successfully',
  })
  async findAll(
    @Query('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('fishSpecies') fishSpecies?: string,
  ) {
    return this.logbookService.findAll({ userId, startDate, fishSpecies });
  }

  @Get(':entryId')
  @ApiOperation({ summary: 'Get logbook entry details' })
  @ApiResponse({
    status: 200,
    description: 'Logbook entry details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Logbook entry not found' })
  async findOne(@Param('entryId') entryId: string) {
    return this.logbookService.findOne(entryId);
  }

  @Put(':entryId')
  @ApiOperation({ summary: 'Update logbook entry' })
  @ApiResponse({
    status: 200,
    description: 'Logbook entry updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Can only edit your own logbook entries',
  })
  async update(
    @Param('entryId') entryId: string,
    @Body() updateLogbookEntryDto: UpdateLogbookEntryDto,
    @CurrentUser() user: User,
  ) {
    return this.logbookService.update(entryId, updateLogbookEntryDto, user.id);
  }

  @Delete(':entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete logbook entry' })
  @ApiResponse({
    status: 204,
    description: 'Logbook entry deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Can only delete your own logbook entries',
  })
  async remove(@Param('entryId') entryId: string, @CurrentUser() user: User) {
    return this.logbookService.remove(entryId, user.id);
  }
}
