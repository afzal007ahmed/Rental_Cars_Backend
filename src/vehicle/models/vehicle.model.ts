import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Availability } from 'src/availability/models/availability.model';

@Table({
  tableName: 'vehicles',
})
export class Vehicle extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;
  @HasMany(() => Availability)
   availability : Availability[]

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  brand: string;
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  price: number;
    @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;
}
