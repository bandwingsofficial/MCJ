import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetBranchHandler } from '../../application/get-branch/get-branch.handler';
import { GetBranchQuery } from '../../application/get-branch/get-branch.query';
import { ListBranchesHandler } from '../../application/list-branches/list-branches.handler';
import { ListBranchesQuery } from '../../application/list-branches/list-branches.query';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

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
      data: result.items.map((branch) => ({
        id: branch.id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        city: branch.city,
        state: branch.state,
        country: branch.country,
        status: branch.status,
      })),
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

    return {
      success: true,
      message: 'Branch fetched successfully',
      data: {
        id: result.id,
        branchName: result.branchName,
        branchCode: result.branchCode,
        city: result.city,
        state: result.state,
        country: result.country,
        description: result.description,
        status: result.status,
      },
    };
  }
}
