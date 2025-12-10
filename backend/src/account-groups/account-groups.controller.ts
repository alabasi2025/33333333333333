import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountGroupsService } from './account-groups.service';
import { AccountGroup } from './account-group.entity';

@Controller('account-groups')
export class AccountGroupsController {
  constructor(private readonly accountGroupsService: AccountGroupsService) {}

  @Get()
  async findAll(): Promise<AccountGroup[]> {
    return await this.accountGroupsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AccountGroup> {
    return await this.accountGroupsService.findOne(id);
  }

  @Post()
  async create(@Body() groupData: Partial<AccountGroup>): Promise<AccountGroup> {
    return await this.accountGroupsService.create(groupData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() groupData: Partial<AccountGroup>,
  ): Promise<AccountGroup> {
    return await this.accountGroupsService.update(id, groupData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.accountGroupsService.remove(id);
    return { success: true };
  }
}
