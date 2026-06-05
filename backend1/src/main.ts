import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Versioning API
  app.setGlobalPrefix('api/v1');

  // Sécurité headers HTTP
  app.use(helmet());

  // CORS
 /* app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true, // pour les HttpOnly cookies 
  });*/
app.enableCors({
  origin: (origin, callback) => {
    // Allow any localhost port in dev, block everything else
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger auto-généré
  const config = new DocumentBuilder()
    .setTitle('MTN Elite One Digital Platform API')
    .setDescription('API REST officielle - Championnat MTN Elite One Cameroun')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification & gestion sessions')
    .addTag('clubs', 'Profils et statistiques clubs')
    .addTag('players', 'Profils et statistiques joueurs')
    .addTag('matches', 'Fixtures, résultats, événements')
    .addTag('standings', 'Classement et form guide')
    .addTag('stats', 'Statistiques buteurs, passeurs')
    .addTag('awards', 'Awards et votes temps réel')
    .addTag('articles', 'Contenu éditorial (MongoDB)')
    .addTag('admin', 'Back-office CMS')
    .addTag('talents', 'Jeunes Talents (MongoDB)')
    .addTag('hall-of-fame', 'Légendes du Hall of Fame (MongoDB)')
    .addTag('culture-stories', 'Histoires culturelles et historiques (MongoDB)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(
    `MTN Elite One API running on http://localhost:${process.env.PORT ?? 3000}/api/v1`,
  );
  console.log(`Swagger: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
