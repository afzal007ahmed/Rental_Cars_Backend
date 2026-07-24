import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Availability } from 'src/availability/models/availability.model';
import { Bookings } from 'src/bookings/models/bookings.model';
import { Images } from 'src/images/models/image.model';

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
  availability: Availability[];

  @HasMany(() => Images)
  images: Images[];

  @HasMany(() => Bookings)
  bookings: Bookings[];

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
    type: DataType.INTEGER,
    allowNull: false,
  })
  price: number;
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;
}
