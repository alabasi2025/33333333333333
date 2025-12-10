import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CashBox } from './cash-box.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out'
}

@Entity('cash_transactions')
export class CashTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cash_box_id' })
  cashBoxId: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    name: 'transaction_type'
  })
  transactionType: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @Column({ name: 'reference_type', nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', nullable: true })
  referenceId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', name: 'transaction_date' })
  transactionDate: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => CashBox, cashBox => cashBox.transactions)
  @JoinColumn({ name: 'cash_box_id' })
  cashBox: CashBox;
}
