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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

/**
 * Contrôleur Users - Gère toutes les routes liées aux utilisateurs
 *
 * ROUTES IMPLEMENTEES:
 * - POST /api/v1/users - Créer un utilisateur (public)
 * - GET /api/v1/users - Rechercher des utilisateurs avec filtres
 * - GET /api/v1/users/:id - Récupérer un utilisateur
 * - PUT /api/v1/users/:id - Mettre à jour un utilisateur
 * - DELETE /api/v1/users/:id - Supprimer un utilisateur (RGPD)
 */
@ApiTags('Users')
@Controller('v1/users')
@ApiBearerAuth() // Indique que toutes les routes nécessitent le token JWT (sauf @Public())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public() // Route publique pour l'inscription
  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 422, description: 'Validation error' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'lastName', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['individual', 'professional'],
  })
  @ApiResponse({ status: 200, description: 'Users list retrieved successfully' })
  async findAll(
    @Query('lastName') lastName?: string,
    @Query('city') city?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll({ lastName, city, status });
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('userId') userId: string) {
    return this.usersService.findOne(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only update your own profile' })
  async update(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(userId, updateUserDto, currentUser.id);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user account (GDPR)' })
  @ApiResponse({ status: 204, description: 'User deleted and data anonymized' })
  @ApiResponse({ status: 403, description: 'Forbidden - can only delete your own account' })
  async remove(
    @Param('userId') userId: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.remove(userId, currentUser.id);
  }

  // Routes supplémentaires pour BF19 : récupérer les ressources d'un utilisateur

  @Get(':userId/boats')
  @ApiOperation({ summary: "Get user's boats" })
  @ApiResponse({ status: 200, description: 'User boats retrieved successfully' })
  async getUserBoats(@Param('userId') userId: string) {
    return this.usersService.getUserBoats(userId);
  }

  @Get(':userId/trips')
  @ApiOperation({ summary: "Get user's trips" })
  @ApiResponse({ status: 200, description: 'User trips retrieved successfully' })
  async getUserTrips(@Param('userId') userId: string) {
    return this.usersService.getUserTrips(userId);
  }

  @Get(':userId/bookings')
  @ApiOperation({ summary: "Get user's bookings" })
  @ApiResponse({ status: 200, description: 'User bookings retrieved successfully' })
  async getUserBookings(@Param('userId') userId: string) {
    return this.usersService.getUserBookings(userId);
  }
}
