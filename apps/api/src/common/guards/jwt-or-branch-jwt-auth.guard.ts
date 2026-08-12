import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtOrBranchJwtAuthGuard extends AuthGuard([
  'jwt',
  'branch-jwt',
]) {}
