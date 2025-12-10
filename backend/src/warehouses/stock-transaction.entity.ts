import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { StockTransactionItem } from './stock-transaction-item.entity';
import { Supplier } from './supplier.entity';
import { Account } from '../financial/account.entity';

@Entity('stock_transactions')
export class StockTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_number', unique: true })
  transactionNumber: string;

  @Column({ name: 'transaction_type' })
  transactionType: 'in' | 'out';

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'transaction_date', type: 'timestamp' })
  transactionDate: Date;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'journal_entry_id', nullable: true })
  journalEntryId: number;

  @Column({ name: 'payment_account_id', nullable: true })
  paymentAccountId: number;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'payment_account_id' })
  paymentAccount: Account;

  @Column({ name: 'supplier_id', nullable: true })
  supplierId: number;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @OneToMany(() => StockTransactionItem, item => item.transaction, { cascade: true })
  items: StockTransactionItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
