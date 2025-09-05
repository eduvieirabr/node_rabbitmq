import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  customerName!: string;

  @Column({ type: 'varchar', length: 120 })
  customerEmail!: string;

  @Column({ type: 'jsonb' })
  items!: Array<{ sku: string; quantity: number; price: number }>;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

