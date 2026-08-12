// src/main.ts

import { BadRequestException, ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';

import { ConfigService } from '@nestjs/config';

import { NestExpressApplication } from '@nestjs/platform-express';

import { ValidationError } from 'class-validator';

import { AppModule } from './app.module';

import { AppExceptionFilter } from './common/filters/app-exception.filter';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Buffers the raw request body so gateway webhook signatures (e.g. Razorpay)
    // can be verified against the exact bytes received.
    rawBody: true,
  });

  const configService = app.get(ConfigService);

  // 🔥 Important for proxies/load balancers
  app.set('trust proxy', true);

  app.enableShutdownHooks();

  app.enableCors({
    origin: (() => {
      const configured = configService.get<string>('CORS_ORIGINS');

      if (!configured || configured.trim() === '' || configured.trim() === '*') {
        // Dev-friendly default; set CORS_ORIGINS in production (comma-separated)
        return true;
      }

      return configured.split(',').map((origin) => origin.trim()).filter(Boolean);
    })(),
    credentials: true,
  });

  app.useGlobalFilters(new AppExceptionFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,

      forbidNonWhitelisted: true,

      transform: true,

      // transformOptions: {
      //   enableImplicitConversion: true,
      // },

      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors: Record<string, string[]> = {};

        const extractErrors = (
          errs: ValidationError[],
          parent?: string,
        ): void => {
          for (const err of errs) {
            const field = parent ? `${parent}.${err.property}` : err.property;

            const constraints = err.constraints ?? {};

            const messages = Object.values(constraints);

            if (messages.length > 0) {
              formattedErrors[field] = messages.filter(
                (message): message is string => typeof message === 'string',
              );
            }

            if (err.children && err.children.length > 0) {
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
  // app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') ?? 4000;

  await app.listen(port);
  

  console.log(`🚀 Server running on http://localhost:${port}`);
}

// 🔥 fixes no-floating-promises
void bootstrap();
