import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { JournalEntry } from '../journal-entries/journal-entry.entity';

@Entity('payment_vouchers')
export class PaymentVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'voucher_number', unique: true, length: 50 })
  voucherNumber: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'account_id' })
  accountId: number;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ name: 'beneficiary_name', length: 255, nullable: true })
  beneficiaryName: string;

  @Column({ name: 'payment_method', length: 50, default: 'cash' })
  paymentMethod: string;

  @Column({ name: 'reference_number', length: 100, nullable: true })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: 'draft' })
  status: string;

  @Column({ default: false })
  posted: boolean;

  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: number;

  @ManyToOne(() => JournalEntry, { nullable: true })
  @JoinColumn({ name: 'journal_entry_id' })
  journalEntry: JournalEntry;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy: string;

  @Column({ name: 'approved_by', length: 100, nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
