import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');

  // Enable URI Versioning

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN, // Allow your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API endpoints documentation')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
      name: 'Authorization',
      in: 'header',
    },
      'bearer',
    )
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     description: 'Enter JWT token',
    //     name: 'Authorization',
    //     in: 'header',
    //   },
    //   'access-token',
    // )
    .addServer(`http://${process.env.SWAGGER_HOST}:${process.env.PORT}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'], //
    },
  });
  app.getHttpAdapter().get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });


  await app.listen(process.env.PORT || 4000);
}
bootstrap();