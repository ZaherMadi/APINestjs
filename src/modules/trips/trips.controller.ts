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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Trips')
@Controller('v1/trips')
@ApiBearerAuth()
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new trip' })
  @ApiResponse({ status: 201, description: 'Trip created successfully' })
  @ApiResponse({
    status: 403,
    description: 'User must own a boat to create trips',
  })
  async create(
    @Body() createTripDto: CreateTripDto,
    @CurrentUser() user: User,
  ) {
    return this.tripsService.create(createTripDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Search fishing trips' })
  @ApiQuery({ name: 'tripType', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiResponse({ status: 200, description: 'Trips list retrieved successfully' })
  async findAll(
    @Query('tripType') tripType?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('startDate') startDate?: string,
  ) {
    return this.tripsService.findAll({ tripType, minPrice, maxPrice, startDate });
  }

  @Get(':tripId')
  @ApiOperation({ summary: 'Get trip details' })
  @ApiResponse({ status: 200, description: 'Trip details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Trip not found' })
  async findOne(@Param('tripId') tripId: string) {
    return this.tripsService.findOne(tripId);
  }

  @Put(':tripId')
  @ApiOperation({ summary: 'Update trip' })
  @ApiResponse({ status: 200, description: 'Trip updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only edit your own trips' })
  async update(
    @Param('tripId') tripId: string,
    @Body() updateTripDto: UpdateTripDto,
    @CurrentUser() user: User,
  ) {
    return this.tripsService.update(tripId, updateTripDto, user.id);
  }

  @Delete(':tripId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete trip' })
  @ApiResponse({ status: 204, description: 'Trip deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own trips' })
  async remove(@Param('tripId') tripId: string, @CurrentUser() user: User) {
    return this.tripsService.remove(tripId, user.id);
  }
}
