import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { JournalEntryLine } from './journal-entry-line.entity';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'entry_number' })
  entryNumber: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string; // 'voucher', 'invoice', 'manual', etc.

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalCredit: number;

  @Column({ default: false })
  isPosted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => JournalEntryLine, line => line.journalEntry, { cascade: true })
  lines: JournalEntryLine[];
}
