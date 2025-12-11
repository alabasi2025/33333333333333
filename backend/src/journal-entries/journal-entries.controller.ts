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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntry } from './journal-entry.entity';
import { JournalEntryLine } from './journal-entry-line.entity';

@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ): Promise<JournalEntry[]> {
    return await this.journalEntriesService.findAll({
      startDate,
      endDate,
      accountId: accountId ? parseInt(accountId) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<JournalEntry> {
    const entry = await this.journalEntriesService.findOne(id);
    if (!entry) {
      throw new HttpException('Journal entry not found', HttpStatus.NOT_FOUND);
    }
    return entry;
  }

  @Post()
  async create(
    @Body() data: {
      date: string;
      description: string;
      lines: Array<{
        accountId: number;
        debit: number;
        credit: number;
        description?: string;
      }>;
    },
  ): Promise<JournalEntry> {
    // التحقق من التوازن
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new HttpException(
        `القيد غير متوازن: المدين ${totalDebit} - الدائن ${totalCredit}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // التحقق من وجود سطرين على الأقل
    if (data.lines.length < 2) {
      throw new HttpException(
        'القيد يجب أن يحتوي على سطرين على الأقل',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.journalEntriesService.create({
      ...data,
      date: new Date(data.date),
    });
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      date?: string;
      description?: string;
      lines?: Array<{
        accountId: number;
        debit: number;
        credit: number;
        description?: string;
      }>;
    },
  ): Promise<JournalEntry> {
    // التحقق من أن القيد موجود
    const entry = await this.journalEntriesService.findOne(id);
    if (!entry) {
      throw new HttpException('Journal entry not found', HttpStatus.NOT_FOUND);
    }

    // منع تعديل القيود المرتبطة بسندات
    if (entry.referenceType === 'voucher') {
      throw new HttpException(
        'لا يمكن تعديل القيود المرتبطة بالسندات',
        HttpStatus.FORBIDDEN,
      );
    }

    // التحقق من التوازن إذا تم تعديل السطور
    if (data.lines) {
      const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new HttpException(
          `القيد غير متوازن: المدين ${totalDebit} - الدائن ${totalCredit}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return await this.journalEntriesService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    // التحقق من أن القيد موجود
    const entry = await this.journalEntriesService.findOne(id);
    if (!entry) {
      throw new HttpException('Journal entry not found', HttpStatus.NOT_FOUND);
    }

    // منع حذف القيود المرتبطة بسندات
    if (entry.referenceType === 'voucher') {
      throw new HttpException(
        'لا يمكن حذف القيود المرتبطة بالسندات. يجب حذف السند أولاً.',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.journalEntriesService.remove(id);
    return { success: true };
  }

  @Post(':id/post')
  async post(@Param('id', ParseIntPipe) id: number): Promise<JournalEntry> {
    return await this.journalEntriesService.post(id);
  }

  @Post(':id/unpost')
  async unpost(@Param('id', ParseIntPipe) id: number): Promise<JournalEntry> {
    return await this.journalEntriesService.unpost(id);
  }
}
