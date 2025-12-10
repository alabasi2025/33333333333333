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
import { AccountsService } from './accounts.service';
import { Account } from './account.entity';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(
    @Query('unitId') unitId?: string,
    @Query('subType') subType?: string
  ): Promise<Account[]> {
    return await this.accountsService.findAll(
      unitId ? +unitId : undefined,
      subType
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Account> {
    return await this.accountsService.findOne(id);
  }

  @Post()
  async create(@Body() accountData: Partial<Account>): Promise<Account> {
    return await this.accountsService.create(accountData);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() accountData: Partial<Account>,
  ): Promise<Account> {
    return await this.accountsService.update(id, accountData);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.accountsService.remove(id);
    return { success: true };
  }
}
