import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur @CurrentUser()
 *
 * CONCEPT - PARAM DECORATOR:
 * Un param decorator extrait des données de la requête HTTP.
 * Ici, on extrait l'utilisateur authentifié depuis req.user
 * (injecté automatiquement par Passport après validation du JWT)
 *
 * USAGE dans un contrôleur:
 * @Get('profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user; // user contient les infos de l'utilisateur connecté
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
