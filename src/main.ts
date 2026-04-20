import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { globalValidationPipe } from './shared/pipes/validation.pipe';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3000;

  app.use(cookieParser(config.get<string>('app.cookieSecret')));
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix('api');

  await app.listen(port);
  console.log(`🚀 App rodando em http://localhost:${port}/api`);
}

bootstrap();
