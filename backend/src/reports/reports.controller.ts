import { Controller, Get, Query, Param, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('income-statement/pdf')
  async getIncomeStatementPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateIncomeStatementPdf(startDate, endDate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=income-statement-${startDate}-${endDate}.pdf`);
    res.send(pdfBuffer);
  }

  @Get('balance-sheet/pdf')
  async getBalanceSheetPdf(
    @Query('asOfDate') asOfDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateBalanceSheetPdf(asOfDate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=balance-sheet-${asOfDate}.pdf`);
    res.send(pdfBuffer);
  }

  @Get('cash-flow/pdf')
  async getCashFlowPdf(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.reportsService.generateCashFlowPdf(startDate, endDate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=cash-flow-${startDate}-${endDate}.pdf`);
    res.send(pdfBuffer);
  }
}
