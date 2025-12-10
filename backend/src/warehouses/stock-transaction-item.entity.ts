import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StockTransaction } from './stock-transaction.entity';
import { Item } from './item.entity';

@Entity('stock_transaction_items')
export class StockTransactionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'transaction_id' })
  transactionId: number;

  @ManyToOne(() => StockTransaction, transaction => transaction.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: StockTransaction;

  @Column({ name: 'item_id' })
  itemId: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ name: 'total_price', type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
