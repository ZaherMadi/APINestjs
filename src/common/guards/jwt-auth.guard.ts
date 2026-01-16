import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard JWT pour protéger les routes
 *
 * CONCEPT NestJS - GUARD:
 * Un Guard est un middleware qui contrôle l'accès à une route.
 * Il retourne true (accès autorisé) ou false (accès refusé).
 *
 * AuthGuard('jwt') vient de @nestjs/passport et vérifie le token JWT.
 * Si le token est valide, la requête continue. Sinon, erreur 401.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate est appelé avant chaque route protégée
   * On vérifie d'abord si la route est publique (@Public())
   * Si oui, on permet l'accès sans vérifier le token
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
