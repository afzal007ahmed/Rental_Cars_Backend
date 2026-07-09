import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Availability } from 'src/availability/models/availability.model';
import { Bookings } from 'src/bookings/models/bookings.model';

@Table({
  tableName: 'locations',
})
export class Location extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @HasMany(() => Bookings)
  bookings : Bookings[]

  @HasMany(() => Availability)
  available: Availability[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  long: number;
  @Column({
    type: DataType.DECIMAL,
    allowNull: false,
  })
  lat: number;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  city: string;
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  state: string;
}
