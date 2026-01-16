import { SetMetadata } from '@nestjs/common';

/**
 * Décorateur @Public()
 *
 * CONCEPT NestJS - DECORATOR:
 * Un décorateur personnalisé ajoute des métadonnées à une route.
 * Ici, @Public() marque une route comme accessible sans authentification.
 *
 * USAGE:
 * @Public()
 * @Post('login')
 * login() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
