import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Location } from 'src/location/models/location.model';
import { User } from 'src/user/models/user.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';

@Table({
  tableName: 'bookings',
})
export class Bookings extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;
  @Column({
    type: DataType.INTEGER,
  })
  total_price: number;

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vehicle_id: string;

  @BelongsTo(() => Vehicle)
  vehicle: Vehicle;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  user_id: string;
  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  start_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  to_date: Date;

  @Column({
    type: DataType.ENUM('pending', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  })
  status: string;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  location_id: Date;

  @BelongsTo(() => Location)
  location: Location;
}
