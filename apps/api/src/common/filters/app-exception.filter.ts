// src/common/filters/app-exception.filter.ts

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

interface HttpExceptionResponse {
  code?: string;
  message?: string | string[];
  errors?: unknown;
  meta?: Record<string, unknown>;
}

interface ApplicationErrorLike {
  code: string;
  statusCode: number;
  message: string;
  meta?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

function isApplicationErrorLike(
  exception: unknown,
): exception is ApplicationErrorLike {
  const maybeError = exception as
    | (Error & Partial<ApplicationErrorLike>)
    | null;

  return (
    maybeError instanceof Error &&
    typeof maybeError.code === 'string' &&
    typeof maybeError.statusCode === 'number'
  );
}

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // =====================
    // 🟢 APP ERROR
    // =====================

    if (isApplicationErrorLike(exception)) {
      const meta = exception.meta ?? exception.metadata;

      this.logException(
        exception.statusCode,
        exception,
        request,
      );

      response.status(exception.statusCode).json({
        success: false,
        code: exception.code,
        message: exception.message,
        ...(meta ? { meta } : {}),
      });

      return;
    }

    // =====================
    // 🔵 HTTP EXCEPTION
    // =====================

    if (exception instanceof HttpException) {
      const status = exception.getStatus();

      const res = exception.getResponse();

      const responseBody: HttpExceptionResponse =
        typeof res === 'object' && res !== null
          ? res
          : {
              message:
                typeof res === 'string'
                  ? res
                  : exception.message,
            };

      this.logException(status, exception, request);

      if (responseBody.code === 'VALIDATION_ERROR') {
        response.status(status).json({
          success: false,
          code: responseBody.code,
          errors: responseBody.errors,
          ...(responseBody.meta
            ? { meta: responseBody.meta }
            : {}),
        });

        return;
      }

      response.status(status).json({
        success: false,
        code: responseBody.code ?? 'HTTP_ERROR',
        message:
          responseBody.message ?? exception.message,
        ...(responseBody.meta
          ? { meta: responseBody.meta }
          : {}),
      });

      return;
    }

    // =====================
    // 🔴 UNKNOWN ERROR
    // =====================

    this.logException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      exception,
      request,
    );

    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message:
          exception instanceof Error
            ? exception.message
            : 'Something went wrong',
      });
  }

  private logException(
    statusCode: number,
    exception: unknown,
    request: Request,
  ): void {
    const message =
      exception instanceof Error
        ? exception.message
        : String(exception);

    const method = request.method;
    const url = request.originalUrl;
    const ip = request.ip;
    const user =
      (request as any).user?.sub ??
      (request as any).user?.id ??
      'Anonymous';

    const divider =
      '====================================================';

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`
${divider}
❌ INTERNAL SERVER ERROR
Method  : ${method}
URL     : ${url}
Status  : ${statusCode}
User    : ${user}
IP      : ${ip}
Message : ${message}
${divider}
`,
      exception instanceof Error
        ? exception.stack
        : undefined,
      );

      return;
    }

    this.logger.warn(`
${divider}
⚠️ REQUEST FAILED
Method  : ${method}
URL     : ${url}
Status  : ${statusCode}
User    : ${user}
IP      : ${ip}
Message : ${message}
${divider}
`);
  }
}