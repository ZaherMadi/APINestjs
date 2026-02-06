import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

/**
 * Controller racine de l'API
 * Fournit les informations de base et le health check
 */
@ApiExcludeController() // Ne pas afficher dans Swagger
@Controller()
export class AppController {
  @Public()
  @Get()
  getApiInfo() {
    return {
      name: 'Fisher Fans API',
      description: 'The BlaBlaCar for sea fishing',
      version: '3.0.0',
      documentation: '/api-docs',
      endpoints: {
        auth: '/api/auth/v1',
        users: '/api/v1/users',
        boats: '/api/v1/boats',
        trips: '/api/v1/trips',
        bookings: '/api/v1/bookings',
        logbook: '/api/v1/logbook',
      },
      status: 'running',
    };
  }

  @Public()
  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
