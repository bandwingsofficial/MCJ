import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  // 🔐 Trust proxy (important for production behind load balancer)
  app.set('trust proxy', true);

  // 🔁 Graceful shutdown
  app.enableShutdownHooks();

  // 🌐 CORS (STRICT for your frontend)
  app.enableCors({
    origin: [
      'http://localhost:3000', // main frontend
      'http://localhost:3001', // customer-web
      'http://localhost:3002', // admin-web (if needed)
    ],
    credentials: true,
  });

  // 🧠 Global filters & interceptors
  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ✅ Validation (clean error formatting)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors: Record<string, string[]> = {};

        const extractErrors = (errs: any[], parent?: string) => {
          for (const err of errs) {
            const field = parent
              ? `${parent}.${err.property}`
              : err.property;

            const constraints = err.constraints || {};

            const message =
              constraints.isNotEmpty ||
              constraints.isDefined ||
              Object.values(constraints)[0];

            if (message) {
              if (!formattedErrors[field]) {
                formattedErrors[field] = [];
              }
              formattedErrors[field].push(message as string);
            }

            if (err.children?.length) {
              extractErrors(err.children, field);
            }
          }
        };

        extractErrors(errors);

        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          errors: formattedErrors,
        });
      },
    }),
  );

  // 📌 Port handling (safe fallback)
  const port = configService.get<number>('PORT') || 4000;

  await app.listen(port);

  console.log(`🚀 Backend running on: http://localhost:${port}`);
}

bootstrap();