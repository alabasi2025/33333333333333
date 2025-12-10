import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountsService, Account } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll(): Account[] {
    return this.accountsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Account {
    return this.accountsService.findOne(id);
  }

  @Post()
  create(@Body() accountData: Partial<Account>): Account {
    return this.accountsService.create(accountData);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() accountData: Partial<Account>,
  ): Account {
    return this.accountsService.update(id, accountData);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): { success: boolean } {
    const success = this.accountsService.remove(id);
    return { success };
  }
}
