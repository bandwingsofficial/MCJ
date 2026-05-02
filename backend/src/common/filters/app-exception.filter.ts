// src/common/filters/app-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Response } from 'express';

// 🔥 your base error
import { AppError } from '../../modules/auth/application/errors/app-error';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 🔥 ALWAYS LOG FULL ERROR
    this.logger.error(
      '🔥 Exception caught',
      exception instanceof Error ? exception.stack : String(exception),
    );

    // =====================
    // 🟢 APP ERROR (YOUR DOMAIN / APP)
    // =====================
    if (exception instanceof AppError) {
      return response.status(exception.statusCode).json({
        success: false,
        code: exception.code,
        message: exception.message,
        ...(exception.meta && { meta: exception.meta }), // 🔥 ADD THIS
      });
    }

    // =====================
    // 🔵 HTTP EXCEPTION (NEST)
    // =====================
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res: any = exception.getResponse();

      // 🔥 VALIDATION PIPE ERRORS (class-validator etc.)
      if (res?.code === 'VALIDATION_ERROR') {
        return response.status(status).json({
          success: false,
          code: res.code,
          errors: res.errors,
          ...(res.meta && { meta: res.meta }), // 🔥 ADD THIS
        });
      }

      return response.status(status).json({
        success: false,
        code: res?.code || 'HTTP_ERROR',
        message: res?.message || exception.message,
        ...(res?.meta && { meta: res.meta }), // 🔥 ADD THIS
      });
    }

    // =====================
    // 🔴 UNKNOWN ERROR
    // =====================
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      code: 'INTERNAL_SERVER_ERROR',
      message:
        exception instanceof Error
          ? exception.message
          : 'Something went wrong',
    });
  }
}