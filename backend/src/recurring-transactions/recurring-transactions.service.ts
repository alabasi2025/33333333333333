import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringTransaction } from './recurring-transaction.entity';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class RecurringTransactionsService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private recurringTransactionRepository: Repository<RecurringTransaction>,
    private journalEntriesService: JournalEntriesService,
  ) {}

  async create(data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    // التحقق من صحة البيانات
    if (!data.name || !data.frequency || !data.startDate || !data.templateData) {
      throw new BadRequestException('البيانات المطلوبة ناقصة');
    }

    // تعيين تاريخ التنفيذ التالي
    if (!data.nextRunDate) {
      data.nextRunDate = data.startDate;
    }

    const recurringTransaction = this.recurringTransactionRepository.create(data);
    return await this.recurringTransactionRepository.save(recurringTransaction);
  }

  async findAll(): Promise<RecurringTransaction[]> {
    return await this.recurringTransactionRepository.find({
      order: { nextRunDate: 'ASC' }
    });
  }

  async findOne(id: number): Promise<RecurringTransaction> {
    const transaction = await this.recurringTransactionRepository.findOne({
      where: { id }
    });

    if (!transaction) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(id: number, data: Partial<RecurringTransaction>): Promise<RecurringTransaction> {
    await this.recurringTransactionRepository.update(id, data);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const result = await this.recurringTransactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Recurring transaction with ID ${id} not found`);
    }
  }

  async execute(id: number): Promise<any> {
    const recurring = await this.findOne(id);

    if (!recurring.isActive) {
      throw new BadRequestException('القيد المتكرر غير نشط');
    }

    // إنشاء القيد اليومي
    const journalEntry = await this.journalEntriesService.create({
      date: new Date(),
      description: recurring.templateData.description,
      referenceType: 'recurring',
      referenceId: recurring.id,
      lines: recurring.templateData.lines
    });

    // تحديث تاريخ التنفيذ التالي
    const nextRunDate = this.calculateNextRunDate(recurring.nextRunDate, recurring.frequency);
    
    // إذا كان هناك تاريخ نهاية وتجاوزناه، نوقف القيد
    if (recurring.endDate && nextRunDate > recurring.endDate) {
      recurring.isActive = false;
    }

    recurring.nextRunDate = nextRunDate;
    await this.recurringTransactionRepository.save(recurring);

    return {
      recurring,
      journalEntry
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringTransactions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // البحث عن القيود المستحقة
    const dueTransactions = await this.recurringTransactionRepository.find({
      where: {
        isActive: true,
        nextRunDate: LessThanOrEqual(today)
      }
    });

    console.log(`Found ${dueTransactions.length} recurring transactions to process`);

    // تنفيذ كل قيد
    for (const recurring of dueTransactions) {
      try {
        await this.execute(recurring.id);
        console.log(`Executed recurring transaction: ${recurring.name}`);
      } catch (error) {
        console.error(`Failed to execute recurring transaction ${recurring.id}:`, error);
      }
    }
  }

  private calculateNextRunDate(currentDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        throw new BadRequestException(`Invalid frequency: ${frequency}`);
    }

    return nextDate;
  }
}
