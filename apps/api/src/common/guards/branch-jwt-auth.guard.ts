import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class BranchJwtAuthGuard extends AuthGuard(
  'branch-jwt',
) {}
