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
import { BoatsService } from './boats.service';
import { CreateBoatDto } from './dto/create-boat.dto';
import { UpdateBoatDto } from './dto/update-boat.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

/**
 * Contrôleur Boats
 * Gère toutes les routes liées aux bateaux
 */
@ApiTags('Boats')
@Controller('v1/boats')
@ApiBearerAuth()
export class BoatsController {
  constructor(private readonly boatsService: BoatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new boat' })
  @ApiResponse({ status: 201, description: 'Boat created successfully' })
  @ApiResponse({
    status: 403,
    description: 'User must have valid boat license',
  })
  async create(
    @Body() createBoatDto: CreateBoatDto,
    @CurrentUser() user: User,
  ) {
    return this.boatsService.create(createBoatDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Search boats' })
  @ApiQuery({ name: 'boatType', required: false })
  @ApiQuery({ name: 'homePort', required: false })
  @ApiQuery({ name: 'minCapacity', required: false, type: Number })
  @ApiQuery({ name: 'minLat', required: false, type: Number })
  @ApiQuery({ name: 'maxLat', required: false, type: Number })
  @ApiQuery({ name: 'minLng', required: false, type: Number })
  @ApiQuery({ name: 'maxLng', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Boats list retrieved successfully' })
  async findAll(
    @Query('boatType') boatType?: string,
    @Query('homePort') homePort?: string,
    @Query('minCapacity') minCapacity?: number,
    @Query('minLat') minLat?: number,
    @Query('maxLat') maxLat?: number,
    @Query('minLng') minLng?: number,
    @Query('maxLng') maxLng?: number,
  ) {
    return this.boatsService.findAll({
      boatType,
      homePort,
      minCapacity,
      minLat,
      maxLat,
      minLng,
      maxLng,
    });
  }

  @Get(':boatId')
  @ApiOperation({ summary: 'Get boat details' })
  @ApiResponse({ status: 200, description: 'Boat details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Boat not found' })
  async findOne(@Param('boatId') boatId: string) {
    return this.boatsService.findOne(boatId);
  }

  @Put(':boatId')
  @ApiOperation({ summary: 'Update boat' })
  @ApiResponse({ status: 200, description: 'Boat updated successfully' })
  @ApiResponse({ status: 403, description: 'Can only edit your own boats' })
  async update(
    @Param('boatId') boatId: string,
    @Body() updateBoatDto: UpdateBoatDto,
    @CurrentUser() user: User,
  ) {
    return this.boatsService.update(boatId, updateBoatDto, user.id);
  }

  @Delete(':boatId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete boat' })
  @ApiResponse({ status: 204, description: 'Boat deleted successfully' })
  @ApiResponse({ status: 403, description: 'Can only delete your own boats' })
  async remove(@Param('boatId') boatId: string, @CurrentUser() user: User) {
    return this.boatsService.remove(boatId, user.id);
  }
}
