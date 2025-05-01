import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('MICROSERVICIO DE SEGURIDAD')
    .setDescription('En este microservicio esta la gestión de usuarios, roles, permisos, y muchisimas mas autoridades')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3001', 'Local Dev')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/v1/api-docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      filter: true,
      persistAuthorization: true,
    },

  });

  await app.listen(process.env.PORT!);
}

bootstrap();
