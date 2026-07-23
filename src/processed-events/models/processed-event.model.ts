import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
  tableName: 'processed_events',
})
export class ProcessedEvent extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  event_id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  service_name: string;

  @Column({
    type: DataType.ENUM('success', 'failed', 'pending'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  error: string;
}
