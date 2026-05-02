import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express'; // 👈 ADD THIS

import { AppModule } from './app.module';
import { AppExceptionFilter } from './common/filters/app-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule); // 👈 FIX

  const configService = app.get(ConfigService);

  // ✅ Now this works
  app.set('trust proxy', true);

  app.enableShutdownHooks();

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

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
              formattedErrors[field].push(message);
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

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();