import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { Account } from '../accounts/account.entity';
import { decimalTransformer } from '../common/transformers/decimal.transformer';

@Entity('journal_entry_lines')
export class JournalEntryLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'journal_entry_id' })
  journalEntryId: number;

  @ManyToOne(() => JournalEntry, entry => entry.lines)
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @Column({ name: 'account_id' })
  accountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0, transformer: decimalTransformer })
  debit: any;

  @Column({ type: 'decimal', precision: 15, scale: 4, default: 0, transformer: decimalTransformer })
  credit: any;

  @Column({ type: 'text', nullable: true })
  description: string;
}
