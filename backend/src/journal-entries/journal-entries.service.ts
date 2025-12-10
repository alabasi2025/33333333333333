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

  async findAll(): Promise<JournalEntry[]> {
    return await this.journalEntryRepository.find({
      relations: ['lines', 'lines.account'],
      order: { date: 'DESC', entryNumber: 'DESC' },
    });
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
