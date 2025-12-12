import { Controller, Get, Query, Param } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  async getTrialBalance(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('postingStatus') postingStatus?: 'all' | 'posted' | 'unposted',
  ) {
    return await this.reportsService.getTrialBalance(startDate, endDate, postingStatus);
  }

  @Get('account-statement/:accountId')
  async getAccountStatement(
    @Param('accountId') accountId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return await this.reportsService.getAccountStatement(accountId, startDate, endDate);
  }

  @Get('income-statement')
  async getIncomeStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.reportsService.getIncomeStatement(startDate, endDate);
  }

  @Get('balance-sheet')
  async getBalanceSheet(
    @Query('asOfDate') asOfDate: string,
  ) {
    return await this.reportsService.getBalanceSheet(asOfDate);
  }

  @Get('cash-flow')
  async getCashFlowStatement(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.reportsService.getCashFlowStatement(startDate, endDate);
  }
}
