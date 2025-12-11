import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { JournalEntryLine } from './journal-entry-line.entity';

interface CreateJournalEntryDto {
  date: Date;
  description?: string;
  referenceType?: string;
  referenceId?: number;
  lines: {
    accountId: number;
    debit: number;
    credit: number;
    description?: string;
  }[];
}

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepository: Repository<JournalEntryLine>,
  ) {}

  async create(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    // التحقق من توازن القيد (المدين = الدائن)
    const totalDebit = dto.lines.reduce((sum, line) => sum + Number(line.debit), 0);
    const totalCredit = dto.lines.reduce((sum, line) => sum + Number(line.credit), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Journal entry is not balanced. Debit: ${totalDebit}, Credit: ${totalCredit}`
      );
    }

    // توليد رقم القيد
    const entryNumber = await this.getNextEntryNumber();

    // إنشاء القيد
    const entry = this.journalEntryRepository.create({
      entryNumber,
      date: dto.date,
      description: dto.description,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
      totalDebit,
      totalCredit,
      isPosted: true,
    });

    const savedEntry = await this.journalEntryRepository.save(entry);

    // إنشاء سطور القيد
    const lines = dto.lines.map(line =>
      this.journalEntryLineRepository.create({
        journalEntryId: savedEntry.id,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        description: line.description,
      })
    );

    await this.journalEntryLineRepository.save(lines);

    return await this.findOne(savedEntry.id);
  }

  async findAll(filters?: {
    startDate?: string;
    endDate?: string;
    accountId?: number;
  }): Promise<JournalEntry[]> {
    const query = this.journalEntryRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'lines')
      .leftJoinAndSelect('lines.account', 'account')
      .orderBy('entry.date', 'DESC')
      .addOrderBy('entry.entryNumber', 'DESC');

    if (filters?.startDate) {
      query.andWhere('entry.date >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      query.andWhere('entry.date <= :endDate', { endDate: filters.endDate });
    }

    if (filters?.accountId) {
      query.andWhere('lines.accountId = :accountId', { accountId: filters.accountId });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<JournalEntry> {
    return await this.journalEntryRepository.findOne({
      where: { id },
      relations: ['lines', 'lines.account'],
    });
  }

  async findByReference(referenceType: string, referenceId: number): Promise<JournalEntry[]> {
    return await this.journalEntryRepository.find({
      where: { referenceType, referenceId },
      relations: ['lines', 'lines.account'],
    });
  }

  async deleteByReference(referenceType: string, referenceId: number): Promise<void> {
    const entries = await this.findByReference(referenceType, referenceId);
    for (const entry of entries) {
      await this.journalEntryLineRepository.delete({ journalEntryId: entry.id });
      await this.journalEntryRepository.delete(entry.id);
    }
  }

  async update(
    id: number,
    data: {
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
    const entry = await this.findOne(id);

    // تحديث بيانات القيد
    if (data.date) entry.date = new Date(data.date) as any;
    if (data.description !== undefined) entry.description = data.description;

    // تحديث السطور إذا تم تعديلها
    if (data.lines) {
      // حذف السطور القديمة
      await this.journalEntryLineRepository.delete({ journalEntryId: id });

      // إنشاء السطور الجديدة
      const lines = data.lines.map(line =>
        this.journalEntryLineRepository.create({
          journalEntryId: id,
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          description: line.description,
        })
      );

      await this.journalEntryLineRepository.save(lines);

      // تحديث الإجماليات
      const totalDebit = data.lines.reduce((sum, line) => sum + Number(line.debit), 0);
      const totalCredit = data.lines.reduce((sum, line) => sum + Number(line.credit), 0);
      entry.totalDebit = totalDebit as any;
      entry.totalCredit = totalCredit as any;
    }

    await this.journalEntryRepository.save(entry);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // حذف السطور أولاً
    await this.journalEntryLineRepository.delete({ journalEntryId: id });
    // ثم حذف القيد
    await this.journalEntryRepository.delete(id);
  }

  async post(id: number): Promise<JournalEntry> {
    const entry = await this.findOne(id);
    
    if (!entry) {
      throw new BadRequestException('Journal entry not found');
    }

    if (entry.isPosted) {
      throw new BadRequestException('Journal entry is already posted');
    }

    // ترحيل القيد
    entry.isPosted = true;
    await this.journalEntryRepository.save(entry);

    return await this.findOne(id);
  }

  async unpost(id: number): Promise<JournalEntry> {
    const entry = await this.findOne(id);
    
    if (!entry) {
      throw new BadRequestException('Journal entry not found');
    }

    if (!entry.isPosted) {
      throw new BadRequestException('Journal entry is not posted');
    }

    // إلغاء ترحيل القيد
    entry.isPosted = false;
    await this.journalEntryRepository.save(entry);

    return await this.findOne(id);
  }

  private async getNextEntryNumber(): Promise<string> {
    const lastEntry = await this.journalEntryRepository
      .createQueryBuilder('entry')
      .orderBy('entry.id', 'DESC')
      .getOne();

    let nextNumber = 1;
    if (lastEntry) {
      const lastNumber = lastEntry.entryNumber.split('-').pop();
      nextNumber = parseInt(lastNumber || '0') + 1;
    }

    return `JE-${nextNumber.toString().padStart(6, '0')}`;
  }
}
