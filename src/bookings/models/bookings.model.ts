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
    allowNull: true,
  })
  user_id: string;
  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  start_date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  to_date: string;

  @Column({
    type: DataType.ENUM('pending', 'inprogress', 'completed', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false,
  })
  status: string;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  location_id: string;

  @BelongsTo(() => Location, {
    foreignKey: 'location_id',
    as: 'pickupLocation',
  })
  pickup_location: Location;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  guest_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  guest_email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  start_time: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  end_time: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vehicle_price: number;

  @ForeignKey(() => Location)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  drop_location_id: string;

  @BelongsTo(() => Location, { foreignKey: 'drop_location_id', as: 'dropLocation' })
  drop_location: Location;
}
