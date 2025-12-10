import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'movement_type' })
  movementType: string; // in, out, transfer, adjustment

  @Column({ name: 'reference_number', unique: true })
  referenceNumber: string;

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

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'unit_cost' })
  unitCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, name: 'total_cost' })
  totalCost: number;

  @Column({ name: 'to_warehouse_id', nullable: true })
  toWarehouseId: number;

  @ManyToOne(() => Warehouse, { nullable: true })
  @JoinColumn({ name: 'to_warehouse_id' })
  toWarehouse: Warehouse;

  @Column({ type: 'date', name: 'movement_date' })
  movementDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true, name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
