import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

/**
 * Contrôleur d'authentification
 *
 * CONCEPT NestJS - CONTROLLER:
 * Un contrôleur gère les requêtes HTTP et retourne des réponses.
 * Il délègue la logique métier au service (AuthService).
 *
 * DECORATEURS NestJS:
 * @Controller('route') : Définit le préfixe de route
 * @Post() : Route POST
 * @Body() : Extrait le corps de la requête et le valide avec le DTO
 *
 * DECORATEURS Swagger:
 * @ApiTags() : Groupe les routes dans la doc Swagger
 * @ApiOperation() : Décrit l'opération
 * @ApiResponse() : Décrit les réponses possibles
 */
@ApiTags('Authentication')
@Controller('auth/v1')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() // Cette route est accessible sans authentification
  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful - returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
