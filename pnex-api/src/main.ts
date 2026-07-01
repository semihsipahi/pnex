import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AppModule } from './app.module';
import appConfig from './config/app.config';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const cfg = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.enableCors({
    origin: cfg.corsOrigin === '*' ? true : cfg.corsOrigin.split(','),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(cfg.port, '0.0.0.0');
  Logger.log(`PNEX API running on http://localhost:${cfg.port}`, 'Bootstrap');
}

bootstrap();
