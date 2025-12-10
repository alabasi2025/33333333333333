import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { Branch } from './branch.entity';

@Controller('api/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll(@Query('unitId') unitId?: string): Promise<Branch[]> {
    if (unitId) {
      return this.branchesService.findByUnit(+unitId);
    }
    return this.branchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Branch> {
    return this.branchesService.findOne(+id);
  }

  @Post()
  create(@Body() branch: Partial<Branch>): Promise<Branch> {
    return this.branchesService.create(branch);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() branch: Partial<Branch>): Promise<Branch> {
    return this.branchesService.update(+id, branch);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.branchesService.remove(+id);
  }
}
