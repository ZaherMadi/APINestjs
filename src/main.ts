import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Point d'entrée de l'application NestJS
 * C'est ici que l'application démarre et se configure
 */
async function bootstrap() {
  // Création de l'application NestJS
  // NestFactory.create() initialise l'app avec le module racine (AppModule)
  const app = await NestFactory.create(AppModule);

  // Activation de CORS pour permettre les requêtes depuis le navigateur (Swagger UI)
  app.enableCors();

  // Configuration du préfixe global pour toutes les routes
  // Toutes les routes commenceront par /api (ex: /api/v1/users)
  app.setGlobalPrefix('api');

  // Activation de la validation automatique des DTOs (Data Transfer Objects)
  // ValidationPipe utilise class-validator pour valider automatiquement les données entrantes
  // whitelist: true = supprime les propriétés non définies dans les DTOs
  // forbidNonWhitelisted: true = renvoie une erreur si des propriétés inconnues sont envoyées
  // transform: true = transforme automatiquement les types (ex: string "5" → number 5)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configuration de Swagger pour la documentation de l'API
  // DocumentBuilder permet de construire la configuration Swagger
  const port = process.env.PORT || 8443;
  const config = new DocumentBuilder()
    .setTitle('Fisher Fans REST API')
    .setDescription('REST API for Fisher Fans - The BlaBlaCar for sea fishing')
    .setVersion('3.0')
    .addBearerAuth() // Ajoute le support de l'authentification JWT dans Swagger UI
    .addServer(`http://localhost:${port}`, 'Local development server')
    .build();ù

  // Création du document Swagger à partir de la configuration
  const document = SwaggerModule.createDocument(app, config);

  // Exposition de la documentation Swagger sur /api-docs
  // Accessible via http://localhost:8443/api-docs
  SwaggerModule.setup('api-docs', app, document);

  // Démarrage du serveur sur le port configuré
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
}

// Démarrage de l'application
bootstrap();
