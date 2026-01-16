import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';

/**
 * Stratégie JWT pour Passport
 *
 * CONCEPT - PASSPORT STRATEGY:
 * Une stratégie définit COMMENT vérifier l'authentification.
 * Passport-jwt vérifie automatiquement :
 * 1. La présence du token dans le header Authorization: Bearer <token>
 * 2. La signature du token avec la clé secrète
 * 3. La validité (non expiré)
 *
 * Si tout est OK, validate() est appelé avec le payload décodé du JWT.
 * On peut alors récupérer l'utilisateur depuis la DB et le retourner.
 * Cet utilisateur sera injecté dans req.user par Passport.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      // Extraire le token depuis le header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Si le token est expiré, Passport renvoie automatiquement une erreur 401
      ignoreExpiration: false,
      // Clé secrète pour vérifier la signature du token (doit être la même que lors de la création)
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
    });
  }

  /**
   * validate() est appelé automatiquement par Passport après vérification du token
   * @param payload - Le contenu décodé du JWT (ce qu'on a mis dedans lors du login)
   * @returns L'utilisateur qui sera injecté dans req.user
   */
  async validate(payload: any) {
    // payload contient ce qu'on a mis dans le token (voir auth.service.ts)
    // Exemple: { sub: 'user-id-123', email: 'user@example.com' }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Cet objet sera disponible via @CurrentUser() dans les contrôleurs
    return user;
  }
}
