import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AccountGroupsService, AccountGroup } from './account-groups.service';

@Controller('account-groups')
export class AccountGroupsController {
  constructor(private readonly accountGroupsService: AccountGroupsService) {}

  @Get()
  findAll(): AccountGroup[] {
    return this.accountGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): AccountGroup {
    return this.accountGroupsService.findOne(+id);
  }

  @Post()
  create(@Body() groupData: Partial<AccountGroup>): AccountGroup {
    return this.accountGroupsService.create(groupData);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() groupData: Partial<AccountGroup>,
  ): AccountGroup {
    return this.accountGroupsService.update(+id, groupData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): { success: boolean } {
    const success = this.accountGroupsService.remove(+id);
    return { success };
  }
}
