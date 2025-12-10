import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';

@Entity('stock_balances')
@Unique(['warehouseId', 'itemId'])
export class StockBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'warehouse_id' })
  warehouseId: number;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'item_id' })
  itemId: number;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'average_cost' })
  averageCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0, name: 'total_value' })
  totalValue: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
