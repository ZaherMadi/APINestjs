import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';

/**
 * Module d'authentification
 *
 * Ce module configure tout ce qui concerne l'authentification JWT:
 * - Enregistre l'entité User pour TypeORM
 * - Configure PassportModule
 * - Configure JwtModule avec la clé secrète et l'expiration
 * - Enregistre la stratégie JWT
 * - Applique le JwtAuthGuard globalement (toutes les routes sont protégées par défaut)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Enregistre l'entité User pour l'injection
    PassportModule, // Module Passport pour les stratégies d'authentification
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
        signOptions: {
          expiresIn: `${configService.get<number>('JWT_EXPIRES_IN', 3600)}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // APP_GUARD applique le JwtAuthGuard à TOUTES les routes par défaut
    // Pour rendre une route publique, utiliser @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService], // Exporte AuthService pour utilisation dans d'autres modules
})
export class AuthModule {}
