import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BoatsModule } from './modules/boats/boats.module';
import { TripsModule } from './modules/trips/trips.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { LogbookModule } from './modules/logbook/logbook.module';

/**
 * Module racine de l'application
 *
 * CONCEPT NestJS - MODULE:
 * Un module est un conteneur qui organise le code par fonctionnalité.
 * Il regroupe les controllers, services, et autres providers liés.
 *
 * @Module() est un décorateur qui définit les métadonnées du module:
 * - imports: modules dont on a besoin (comme des dépendances)
 * - controllers: les contrôleurs qui gèrent les routes HTTP
 * - providers: les services, guards, interceptors, etc.
 * - exports: ce qu'on rend disponible aux autres modules
 */
@Module({
  imports: [
    // ConfigModule charge les variables d'environnement depuis .env
    // isGlobal: true = accessible partout sans réimporter
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeOrmModule configure la connexion à la base de données PostgreSQL
    // TypeORM est un ORM (Object-Relational Mapping) qui traduit les objets TypeScript en SQL
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'fisherfans',
      password: process.env.DATABASE_PASSWORD || 'fisherfans',
      database: process.env.DATABASE_NAME || 'fisherfans',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // ATTENTION: à mettre à false en production ! Synchronise auto le schéma DB
      logging: true, // Active les logs SQL pour le développement
    }),

    // Import de tous les modules métier de l'application
    AuthModule,     // Gestion de l'authentification (login, JWT)
    UsersModule,    // Gestion des utilisateurs
    BoatsModule,    // Gestion des bateaux
    TripsModule,    // Gestion des sorties pêche
    BookingsModule, // Gestion des réservations
    LogbookModule,  // Gestion du carnet de pêche
  ],
  controllers: [AppController], // Controller racine pour / et /health
})
export class AppModule {}
