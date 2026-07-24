import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Location } from 'src/location/models/location.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';

@Table({
  tableName: 'availability',
  indexes: [{ unique: true, fields: ['location_id', 'vehicle_id'] }],
})
export class Availability extends Model {
  @ForeignKey(() => Location)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  location_id: string;
  @BelongsTo(() => Location)
  location: Location;

  @ForeignKey(() => Vehicle)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  vehicle_id: string;
  @BelongsTo(() => Vehicle)
  vehicle: Vehicle;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  units: number;
}
