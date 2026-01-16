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
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Bookings')
@Controller('v1/bookings')
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.create(createBookingDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Search bookings' })
  @ApiQuery({ name: 'tripId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiResponse({ status: 200, description: 'Bookings list retrieved successfully' })
  async findAll(
    @Query('tripId') tripId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.bookingsService.findAll({ tripId, userId });
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get booking details' })
  @ApiResponse({
    status: 200,
    description: 'Booking details retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async findOne(@Param('bookingId') bookingId: string) {
    return this.bookingsService.findOne(bookingId);
  }

  @Put(':bookingId')
  @ApiOperation({ summary: 'Update booking' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only edit your own bookings' })
  async update(
    @Param('bookingId') bookingId: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.update(bookingId, updateBookingDto, user.id);
  }

  @Delete(':bookingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 204, description: 'Booking cancelled successfully' })
  @ApiResponse({
    status: 403,
    description: 'Can only cancel your own bookings',
  })
  async remove(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: User,
  ) {
    return this.bookingsService.remove(bookingId, user.id);
  }
}
