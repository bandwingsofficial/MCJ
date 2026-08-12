// src/common/interceptors/response.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

interface ApiResponse<T> {
  message?: string;

  data?: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, unknown>
{
  intercept(
    context: ExecutionContext,

    next: CallHandler<T>,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((response: T | ApiResponse<T>) => {
        const typedResponse =
          response as ApiResponse<T>;

        return {
          success: true,

          message:
            typedResponse.message ||
            'Request successful',

          data:
            typedResponse.data !== undefined
              ? typedResponse.data
              : null,
        };
      }),
    );
  }
}