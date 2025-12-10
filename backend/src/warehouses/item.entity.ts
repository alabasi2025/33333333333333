import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '../accounts/account.entity';
import { Unit } from '../units/unit.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ name: 'category', nullable: true })
  category: string;

  @Column({ name: 'unit_id', nullable: true })
  unitId: number;

  @ManyToOne(() => Unit, { nullable: true })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ name: 'account_id', nullable: true })
  accountId: number;

  @ManyToOne(() => Account, { nullable: true })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'min_stock_level' })
  minStockLevel: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'max_stock_level' })
  maxStockLevel: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
