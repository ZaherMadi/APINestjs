/**
 * Script pour générer le fichier OAS (OpenAPI Specification)
 * Exporte la documentation Swagger en fichier JSON et YAML
 *
 * Usage: npx ts-node scripts/generate-oas.ts
 */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateOAS() {
  // Créer l'application sans la démarrer
  const app = await NestFactory.create(AppModule, { logger: false });

  // Configuration Swagger identique à main.ts
  const config = new DocumentBuilder()
    .setTitle('Fisher Fans REST API')
    .setDescription('REST API for Fisher Fans - The BlaBlaCar for sea fishing')
    .setVersion('3.0')
    .addBearerAuth()
    .addServer('http://localhost:8443', 'Local development server')
    .build();

  // Générer le document Swagger
  const document = SwaggerModule.createDocument(app, config);

  // Créer le dossier docs s'il n'existe pas
  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Exporter en JSON
  const jsonPath = path.join(docsDir, 'openapi.json');
  fs.writeFileSync(jsonPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI JSON exported to: ${jsonPath}`);

  // Exporter en YAML (format simple sans dépendance externe)
  const yamlPath = path.join(docsDir, 'openapi.yaml');
  const yamlContent = jsonToYaml(document);
  fs.writeFileSync(yamlPath, yamlContent);
  console.log(`OpenAPI YAML exported to: ${yamlPath}`);

  await app.close();
  console.log('\nOAS files generated successfully!');
}

/**
 * Convertit un objet JSON en YAML (version simplifiée)
 */
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent);
  let yaml = '';

  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        yaml += `${spaces}-\n${jsonToYaml(item, indent + 1)}`;
      } else {
        yaml += `${spaces}- ${formatYamlValue(item)}\n`;
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          yaml += `${spaces}${key}: []\n`;
        } else if (
          typeof value === 'object' &&
          !Array.isArray(value) &&
          Object.keys(value).length === 0
        ) {
          yaml += `${spaces}${key}: {}\n`;
        } else {
          yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`;
        }
      } else {
        yaml += `${spaces}${key}: ${formatYamlValue(value)}\n`;
      }
    }
  }

  return yaml;
}

function formatYamlValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return '';
  if (typeof value === 'string') {
    if (
      value.includes('\n') ||
      value.includes(':') ||
      value.includes('#') ||
      value.startsWith(' ') ||
      value.endsWith(' ')
    ) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  return String(value);
}

generateOAS().catch((error) => {
  console.error('Error generating OAS:', error);
  process.exit(1);
});
