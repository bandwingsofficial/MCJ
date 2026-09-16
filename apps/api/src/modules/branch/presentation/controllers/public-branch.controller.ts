import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetBranchHandler } from '../../application/get-branch/get-branch.handler';
import { GetBranchQuery } from '../../application/get-branch/get-branch.query';
import { ListBranchesHandler } from '../../application/list-branches/list-branches.handler';
import { ListBranchesQuery } from '../../application/list-branches/list-branches.query';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

function mapPublicBranch(branch: {
  id: string;
  branchName: string;
  branchCode: string;
  email?: string | null;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  status: BranchStatus;
}) {
  return {
    id: branch.id,
    branchName: branch.branchName,
    branchCode: branch.branchCode,
    email: branch.email ?? null,
    phone: branch.phone ?? null,
    addressLine1: branch.addressLine1 ?? null,
    addressLine2: branch.addressLine2 ?? null,
    city: branch.city,
    state: branch.state,
    country: branch.country,
    postalCode: branch.postalCode ?? null,
    latitude: branch.latitude ?? null,
    longitude: branch.longitude ?? null,
    description: branch.description ?? null,
    status: branch.status,
  };
}

@ApiTags('Branches')
@Controller('branches')
export class PublicBranchController {
  constructor(
    private readonly listBranchesHandler: ListBranchesHandler,
    private readonly getBranchHandler: GetBranchHandler,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Active branches listed',
  })
  async list(
    @Query('search') search?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    const result = await this.listBranchesHandler.execute(
      new ListBranchesQuery(
        BranchStatus.ACTIVE,
        search,
        undefined,
        undefined,
        undefined,
        false,
        skip ?? 0,
        take ?? 100,
      ),
    );

    return {
      success: true,
      message: 'Branches fetched successfully',
      data: result.items.map((branch) => mapPublicBranch(branch)),
      meta: {
        total: result.count,
        skip: result.meta.skip,
        take: result.meta.take,
      },
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getBranchHandler.execute(
      new GetBranchQuery(id),
    );

    if (
      result.status !== BranchStatus.ACTIVE ||
      result.deletedAt !== null
    ) {
      throw new NotFoundException('Branch not found');
    }

    return {
      success: true,
      message: 'Branch fetched successfully',
      data: mapPublicBranch(result),
    };
  }
}
